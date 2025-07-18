// app/book-service.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Calendar, Clock, MapPin, DollarSign, User, Phone, MessageCircle } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/app/contexts/AuthContext';
import { formatCurrency } from '@/utils/formatting';
import PaymentSelector from '@/components/PaymentSelector';
import { getCurrentLocation } from '@/utils/permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationService } from '@/utils/notificationService';

export default function BookServiceScreen() {
  const router = useRouter();
  const { serviceId, providerId } = useLocalSearchParams();
  const { user, profile } = useAuth();

  const [service, setService] = useState<any>(null);
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [location, setLocation] = useState<any>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any>(null);
  // Add taskResult state with other states
  const [taskResult, setTaskResult] = useState<any>(null);

  const [filters, setFilters] = useState({
    location: { lat: 5.3600, lng: -4.0083, address: 'Abidjan, Côte d\'Ivoire' },
    radius: 10,
    budget: { min: 1000, max: 100000 }, // More inclusive range
    urgency: 'normal' as 'low' | 'normal' | 'high',
    skills: [] as string[],
    language: 'Français',
    timePreference: 'anytime' as 'morning' | 'afternoon' | 'evening' | 'anytime',
    minRating: 0, // Accept all ratings
    minTrustScore: 0, // Accept all trust scores
    verificationLevel: 'any' as 'any' | 'basic' | 'government' | 'enhanced',
    availability: 'any' as 'any' | 'available' | 'busy', // Accept all availability
    selectedCategories: [] as string[],
    priceUnit: 'heure' as 'heure' | 'jour' | 'tâche',
    emergencyOnly: false,
    insuranceRequired: false,
    experienceLevel: 'any' as 'any' | 'beginner' | 'intermediate' | 'expert'
  });

  useEffect(() => {
    fetchServiceAndProvider();
  }, [serviceId, providerId]);

  const fetchServiceAndProvider = async () => {
    try {
      setLoading(true);

      if (serviceId) {
        // Fetch specific service
        const { data: serviceData, error: serviceError } = await supabase
          .from('services')
          .select(`
            *,
            categories (name_fr, icon),
            profiles!provider_id (
              id, full_name, avatar_url, phone, trust_score, is_verified
            )
          `)
          .eq('id', serviceId)
          .single();

        if (serviceError) throw serviceError;
        setService(serviceData);
        setProvider(serviceData.profiles);
        setCustomPrice(serviceData.price_min.toString());
      } else if (providerId) {
        // Fetch provider info for general booking
        const { data: providerData, error: providerError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', providerId)
          .single();

        if (providerError) throw providerError;
        setProvider(providerData);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les informations');
    } finally {
      setLoading(false);
    }
  };

  const saveFilters = async (newFilters: typeof filters) => {
    try {
      await AsyncStorage.setItem('advancedSearchFilters', JSON.stringify(newFilters));
    } catch (error) {
      console.error('Error saving filters:', error);
    }
  };

  const handleGetLocation = async () => {
    setLoadingLocation(true);
    try {
      const currentLocation = await getCurrentLocation();
      if (currentLocation) {
        const locationData = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          address: 'Position actuelle'
        };

        // Update the location state used in booking
        setLocation(locationData);

        // Also update filters for consistency
        const newFilters = {
          ...filters,
          location: {
            lat: currentLocation.coords.latitude,
            lng: currentLocation.coords.longitude,
            address: 'Position actuelle'
          }
        };
        setFilters(newFilters);
        await saveFilters(newFilters);

        Alert.alert('Succès', 'Position mise à jour');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de récupérer votre position');
    } finally {
      setLoadingLocation(false);
    }
  };

  // Validate date format (YYYY-MM-DD)
  const validateDate = (date: string) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(date)) return false;
    
    const d = new Date(date);
    const isValidDate = d instanceof Date && !isNaN(d.getTime());
    if (!isValidDate) return false;
    
    // Check if date is in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d >= today;
  };

  // Validate time format (HH:MM)
  const validateTime = (time: string) => {
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return regex.test(time);
  };

  // Complete handleBooking function
  const handleBooking = async () => {
    // Validation
    if (!selectedDate || !selectedTime || !taskDescription.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!validateDate(selectedDate)) {
      Alert.alert('Erreur', 'Veuillez entrer une date valide au format YYYY-MM-DD (date future)');
      return;
    }

    if (!validateTime(selectedTime)) {
      Alert.alert('Erreur', 'Veuillez entrer une heure valide au format HH:MM');
      return;
    }

    if (!location) {
      Alert.alert('Erreur', 'Veuillez définir une localisation pour la tâche');
      return;
    }

    if (customPrice && (isNaN(parseInt(customPrice)) || parseInt(customPrice) < 0)) {
      Alert.alert('Erreur', 'Veuillez entrer un prix valide');
      return;
    }

    try {
      // Create task
      const taskData = {
        client_id: user?.id,
        provider_id: provider.id,
        category_id: service?.category_id || null,
        title: service ? `${service.name} - ${provider.full_name}` : `Service de ${provider.full_name}`,
        description: taskDescription,
        location: `POINT(${location.longitude} ${location.latitude})`,
        address: {
          street: location.address,
          city: 'Abidjan',
          country: 'Côte d\'Ivoire',
          coordinates: { lat: location.latitude, lng: location.longitude }
        },
        budget_min: parseInt(customPrice) || service?.price_min || 0,
        budget_max: parseInt(customPrice) || service?.price_max || 0,
        urgency: 'normal',
        status: 'posted',
        scheduled_at: `${selectedDate}T${selectedTime}:00`,
        estimated_duration: estimatedDuration || service?.duration_estimate,
        preferred_language: 'Français'
      };

      const { data: taskResult, error: taskError } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single();

      if (taskError) throw taskError;

      // NOTIFY PROVIDER ABOUT NEW BOOKING
      const notificationSent = await NotificationService.notifyProviderOfBooking(
        provider.id,
        profile?.full_name || 'Un client',
        service?.name || 'un service',
        selectedDate,
        selectedTime,
        taskResult.id,
        parseInt(customPrice) || service?.price_min || 0
      );

      if (!notificationSent) {
        console.warn('Failed to send notification to provider');
      }

      // Store taskResult for payment handler
      setTaskResult(taskResult);

      // If payment method is selected, create payment
      if (selectedPaymentMethod && parseInt(customPrice) > 0) {
        setShowPayment(true);
      } else {
        Alert.alert(
          'Réservation confirmée!',
          'Votre demande a été envoyée au prestataire. Vous recevrez une notification dès qu\'il aura répondu.',
          [
            {
              text: 'OK',
              onPress: () => router.push(`/task-request/${taskResult.id}`)
            }
          ]
        );
      }
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert('Erreur', 'Impossible de créer la réservation. Veuillez réessayer plus tard.');
    }
  };

// Function to create notification for provider
  const createProviderNotification = async (task: any) => {
    try {
      const notificationData = {
        user_id: provider.id,
        title: 'Nouvelle demande de service',
        message: `${profile?.full_name || 'Un client'} souhaite réserver ${service?.name || 'vos services'} pour le ${selectedDate} à ${selectedTime}`,
        type: 'service_booking',
        data: {
          task_id: task.id,
          client_name: profile?.full_name,
          service_name: service?.name,
          scheduled_date: selectedDate,
          scheduled_time: selectedTime,
          budget: parseInt(customPrice) || service?.price_min || 0,
          action_text: 'Voir la demande',
          action_url: `/task-request/${task.id}`
        },
        action_url: `/task-request/${task.id}`,
        created_at: new Date().toISOString()
      };

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert(notificationData);

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
      } else {
        console.log('Provider notification created successfully');
      }

      // Optional: Send push notification if provider has push tokens
      await sendPushNotificationToProvider(provider.id, notificationData);

    } catch (error) {
      console.error('Error in createProviderNotification:', error);
    }
  };

// Function to send push notification
  const sendPushNotificationToProvider = async (providerId: string, notificationData: any) => {
    try {
      // Get provider's push tokens
      const { data: pushTokens } = await supabase
        .from('push_tokens')
        .select('token, platform')
        .eq('user_id', providerId)
        .eq('is_active', true);

      if (!pushTokens || pushTokens.length === 0) {
        console.log('No active push tokens for provider');
        return;
      }

      // Send to each active token
      for (const tokenData of pushTokens) {
        await sendPushNotification(tokenData.token, {
          title: notificationData.title,
          body: notificationData.message,
          data: {
            task_id: notificationData.data.task_id,
            type: 'task_booking',
            action_url: notificationData.action_url
          }
        });
      }
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  };

// Push notification sender (would integrate with Expo Push API)
  const sendPushNotification = async (pushToken: string, notification: any) => {
    try {
      const message = {
        to: pushToken,
        sound: 'default',
        title: notification.title,
        body: notification.body,
        data: notification.data,
      };

      // This would use Expo's push notification service
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const result = await response.json();
      console.log('Push notification sent:', result);
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  };

  const handlePaymentMethodSelect = (method: any) => {
    setSelectedPaymentMethod(method);
  };

  // Update handlePaymentComplete function
  const handlePaymentComplete = async () => {
    try {
      if (!taskResult || !selectedPaymentMethod || !profile) {
        throw new Error('Missing required data for payment');
      }

      // Import the escrow payment utility
      const { createEscrowPayment } = await import('@/utils/escrowPayment');

      // Create escrow payment
      const paymentResult = await createEscrowPayment(
        taskResult.id,
        profile.id,
        provider.id,
        parseInt(customPrice) || service?.price_min || 0,
        selectedPaymentMethod.id as 'mtn_money' | 'orange_money' | 'moov_money' | 'bank_transfer' | 'cash'
      );

      // Notify provider about payment
      await NotificationService.notifyPaymentUpdate(
        provider.id,
        parseInt(customPrice) || service?.price_min || 0,
        'completed',
        taskResult.id
      );

      Alert.alert(
        'Réservation et paiement confirmés!',
        'Votre tâche a été créée et le paiement est sécurisé dans notre système d\'entiercement. Le prestataire recevra le paiement une fois le service complété.',
        [
          {
            text: 'OK',
            onPress: () => router.push('/(tabs)/index')
          }
        ]
      );
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert(
        'Erreur de paiement',
        'Une erreur est survenue lors du traitement du paiement. Veuillez réessayer plus tard.'
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF7A00" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (showPayment && selectedPaymentMethod) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowPayment(false)}>
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Paiement</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content}>
          <PaymentSelector
            amount={parseInt(customPrice) || 0}
            onPaymentMethodSelect={handlePaymentMethodSelect}
            selectedMethod={selectedPaymentMethod.id}
          />

          <TouchableOpacity style={styles.confirmPaymentButton} onPress={handlePaymentComplete}>
            <Text style={styles.confirmPaymentButtonText}>Confirmer le paiement</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Réserver un service</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Service/Provider Info */}
        <View style={styles.serviceInfo}>
          <View style={styles.providerHeader}>
            <User size={24} color="#FF7A00" />
            <View style={styles.providerDetails}>
              <Text style={styles.providerName}>{provider?.full_name}</Text>
              {service && (
                <Text style={styles.serviceName}>{service.name}</Text>
              )}
            </View>
          </View>

          {service && (
            <View style={styles.serviceDetails}>
              <Text style={styles.serviceDescription}>{service.description}</Text>
              <Text style={styles.servicePricing}>
                Prix: {formatCurrency(service.price_min)} - {formatCurrency(service.price_max)}
              </Text>
            </View>
          )}
        </View>

        {/* Booking Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détails de la réservation</Text>

          <View style={styles.dateTimeContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Date *</Text>
              <View style={styles.inputContainer}>
                <Calendar size={20} color="#666" />
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD (ex: 2025-07-20)"
                  value={selectedDate}
                  onChangeText={setSelectedDate}
                  placeholderTextColor="#666"
                  keyboardType="numbers-and-punctuation"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Heure *</Text>
              <View style={styles.inputContainer}>
                <Clock size={20} color="#666" />
                <TextInput
                  style={styles.input}
                  placeholder="HH:MM (ex: 14:30)"
                  value={selectedTime}
                  onChangeText={setSelectedTime}
                  placeholderTextColor="#666"
                  keyboardType="numbers-and-punctuation"
                />
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description de la tâche *</Text>
            <TextInput
              style={[styles.inputContainer, styles.textArea]}
              placeholder="Décrivez en détail ce que vous souhaitez..."
              value={taskDescription}
              onChangeText={setTaskDescription}
              multiline
              numberOfLines={4}
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Durée estimée</Text>
            <View style={styles.inputContainer}>
              <Clock size={20} color="#666" />
              <TextInput
                style={styles.input}
                placeholder="Ex: 2 heures"
                value={estimatedDuration}
                onChangeText={setEstimatedDuration}
                placeholderTextColor="#666"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Budget proposé (FCFA)</Text>
            <View style={styles.inputContainer}>
              <DollarSign size={20} color="#666" />
              <TextInput
                style={styles.input}
                placeholder="Montant en FCFA (ex: 5000)"
                value={customPrice}
                onChangeText={(text) => {
                  // Only allow numeric input
                  const numericValue = text.replace(/[^0-9]/g, '');
                  setCustomPrice(numericValue);
                }}
                keyboardType="numeric"
                placeholderTextColor="#666"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Localisation</Text>
            <View style={styles.locationContainer}>
              <MapPin size={20} color="#666" />
              <Text style={styles.locationText}>
                {location?.address || 'Position non définie'}
              </Text>
              <TouchableOpacity
                style={styles.locationButton}
                onPress={handleGetLocation}
                disabled={loadingLocation}
              >
                {loadingLocation ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.locationButtonText}>Ma position</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Contact Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Options de contact</Text>
          <View style={styles.contactOptions}>
            <TouchableOpacity
              style={styles.contactOption}
              onPress={() => router.push(`/chat?providerId=${provider.id}`)}
            >
              <MessageCircle size={20} color="#FF7A00" />
              <Text style={styles.contactOptionText}>Discuter avant réservation</Text>
            </TouchableOpacity>

            {provider?.phone && (
              <TouchableOpacity style={styles.contactOption}>
                <Phone size={20} color="#FF7A00" />
                <Text style={styles.contactOptionText}>Appeler: {provider.phone}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Résumé de la réservation</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Prestataire:</Text>
            <Text style={styles.summaryValue}>{provider?.full_name}</Text>
          </View>
          {service && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Service:</Text>
              <Text style={styles.summaryValue}>{service.name}</Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Date et heure:</Text>
            <Text style={styles.summaryValue}>{selectedDate} à {selectedTime}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Budget:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(parseInt(customPrice) || 0)}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.bookButton} onPress={handleBooking}>
            <Text style={styles.bookButtonText}>Confirmer la réservation</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  serviceInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  providerDetails: {
    marginLeft: 12,
  },
  providerName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  serviceName: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FF7A00',
  },
  serviceDetails: {
    marginTop: 8,
  },
  serviceDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 8,
  },
  servicePricing: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputGroup: {
    marginBottom: 16,
    flex: 1,
    marginHorizontal: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
  textArea: {
    height: 80,
    alignItems: 'flex-start',
    paddingTop: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333',
    marginLeft: 12,
  },
  locationButton: {
    backgroundColor: '#FF7A00',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  locationButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
  contactOptions: {
    gap: 12,
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
  },
  contactOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333',
    marginLeft: 12,
  },
  summary: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333',
  },
  actions: {
    marginBottom: 40,
  },
  bookButton: {
    backgroundColor: '#FF7A00',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  bookButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  confirmPaymentButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  confirmPaymentButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});