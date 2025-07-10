// app/(tabs)/post-task.tsx (Fixed with proper data persistence)
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Switch } from 'react-native';
import { Camera, MapPin, Calendar, DollarSign, Clock, Shield, Plus, Edit3 } from 'lucide-react-native';
import { useAuth } from '@/app/contexts/AuthContext';
import { useTasks } from '@/hooks/useTasks';
import { useCategories } from '@/hooks/useCategories';
import { useServices } from '@/hooks/useServices';
import { usePayments } from '@/hooks/usePayments';
import { useReviews } from '@/hooks/useReviews';
import { getCurrentLocation } from '@/utils/permissions';
import * as Location from 'expo-location';
import RoleBasedAccess from '@/components/RoleBasedAccess';
import { formatCurrency } from '@/utils/formatting';
import { useRouter } from 'expo-router';

export default function PostTaskScreen() {
  const router = useRouter();
  const { profile, user } = useAuth();
  const { createTask } = useTasks();
  const { categories, loading: loadingCategories } = useCategories();
  const { services, loading: servicesLoading, updateService } = useServices(user?.id);
  const { stats: paymentStats, loading: paymentsLoading } = usePayments();
  const { stats: reviewStats, loading: reviewsLoading } = useReviews(user?.id);

  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    coordinates: null as { lat: number; lng: number } | null,
    fullAddress: null as any,
    budget_min: '',
    budget_max: '',
    urgency: 'normal' as 'low' | 'normal' | 'high' | 'emergency',
    photos: [],
  });

  const [gettingLocation, setGettingLocation] = useState(false);

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const result = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (result.length > 0) {
        const address = result[0];
        return {
          street: `${address.streetNumber || ''} ${address.street || ''}`.trim(),
          district: address.district || address.subregion || '',
          city: address.city || 'Abidjan',
          postalCode: address.postalCode || '',
          country: address.country || 'Côte d\'Ivoire',
          fullAddress: [
            address.streetNumber,
            address.street,
            address.district,
            address.city,
            address.country
          ].filter(Boolean).join(', ')
        };
      }
      return null;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  };

  const handleGetCurrentLocation = async () => {
    setGettingLocation(true);
    try {
      const location = await getCurrentLocation();
      if (location) {
        const { latitude, longitude } = location.coords;

        // Get address from coordinates
        const addressInfo = await reverseGeocode(latitude, longitude);

        setTaskData(prev => ({
          ...prev,
          coordinates: { lat: latitude, lng: longitude },
          location: addressInfo?.fullAddress || 'Position GPS récupérée',
          fullAddress: addressInfo
        }));

        Alert.alert('Succès', 'Position et adresse récupérées');
      } else {
        Alert.alert('Erreur', 'Impossible de récupérer votre position');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la récupération de la position');
    } finally {
      setGettingLocation(false);
    }
  };

  const urgencyLevels = [
    { id: 'low', name: 'Pas urgent', color: '#4CAF50' },
    { id: 'normal', name: 'Normal', color: '#FF9800' },
    { id: 'high', name: 'Urgent', color: '#FF5722' },
  ];

  const handleSubmit = async () => {
    if (!taskData.title || !taskData.description || !taskData.category) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!user) {
      Alert.alert('Erreur', 'Vous devez être connecté pour publier une tâche');
      return;
    }

    const taskPayload = {
      client_id: user.id,
      title: taskData.title,
      description: taskData.description,
      category_id: taskData.category,
      location: taskData.coordinates
        ? `POINT(${taskData.coordinates.lng} ${taskData.coordinates.lat})`
        : `POINT(-4.0435 5.3364)`, // Default to Abidjan if no location selected
      address: taskData.fullAddress ? {
        street: taskData.fullAddress.street,
        district: taskData.fullAddress.district,
        city: taskData.fullAddress.city,
        postalCode: taskData.fullAddress.postalCode,
        country: taskData.fullAddress.country,
        coordinates: taskData.coordinates
      } : {
        street: taskData.location || 'Adresse non spécifiée',
        city: 'Abidjan',
        country: 'Côte d\'Ivoire'
      },
      budget_min: taskData.budget_min ? parseInt(taskData.budget_min) : null,
      budget_max: taskData.budget_max ? parseInt(taskData.budget_max) : null,
      urgency: taskData.urgency,
      status: 'posted' as const,
      preferred_language: 'Français',
    };

    const { error } = await createTask(taskPayload);

    if (error) {
      Alert.alert('Erreur', error);
    } else {
      Alert.alert(
        'Tâche publiée!',
        'Votre tâche a été publiée avec succès. Vous recevrez des candidatures bientôt.',
        [
          { text: 'OK', onPress: () => {
              setTaskData({
                title: '',
                description: '',
                category: '',
                location: '',
                coordinates: null,
                fullAddress: null,
                budget_min: '',
                budget_max: '',
                urgency: 'normal',
                photos: [],
              });
            }}
        ]
      );
    }
  };

  const handleServiceToggle = async (serviceId: string, isActive: boolean) => {
    const { error } = await updateService(serviceId, { is_active: isActive });
    if (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour le service');
    } else {
      Alert.alert('Succès', `Service ${isActive ? 'activé' : 'désactivé'} avec succès`);
    }
  };

  // Provider Dashboard Component
  const ProviderDashboard = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard Prestataire</Text>
        <Text style={styles.subtitle}>Gérez vos services et suivez vos performances</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Performance Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{reviewStats.averageRating || 0}</Text>
            <Text style={styles.statLabel}>Note moyenne</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{reviewStats.totalReviews || 0}</Text>
            <Text style={styles.statLabel}>Avis reçus</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formatCurrency(paymentStats.totalEarned || 0)}</Text>
            <Text style={styles.statLabel}>Gains totaux</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{services.filter(s => s.is_active).length}</Text>
            <Text style={styles.statLabel}>Services actifs</Text>
          </View>
        </View>

        {/* My Services */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mes services</Text>
            <TouchableOpacity onPress={() => router.push('/service-management')}>
              <Plus size={20} color="#FF7A00" />
            </TouchableOpacity>
          </View>

          {servicesLoading ? (
            <Text style={styles.loadingText}>Chargement des services...</Text>
          ) : services.length === 0 ? (
            <View style={styles.emptyServices}>
              <Text style={styles.emptyServicesText}>
                Aucun service configuré
              </Text>
              <TouchableOpacity
                style={styles.addServiceButton}
                onPress={() => router.push('/service-management')}
              >
                <Text style={styles.addServiceText}>Ajouter un service</Text>
              </TouchableOpacity>
            </View>
          ) : (
            services.slice(0, 3).map((service) => (
              <View key={service.id} style={styles.serviceCard}>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.servicePrice}>
                    {formatCurrency(service.price_min)} - {formatCurrency(service.price_max)}
                  </Text>
                </View>

                <View style={styles.serviceControls}>
                  <TouchableOpacity
                    style={styles.editServiceButton}
                    onPress={() => router.push(`/edit-service?serviceId=${service.id}`)}
                  >
                    <Edit3 size={16} color="#666" />
                  </TouchableOpacity>
                  <Switch
                    value={service.is_active || false}
                    onValueChange={(value) => handleServiceToggle(service.id, value)}
                    trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                    thumbColor={service.is_active ? '#FFFFFF' : '#F4F3F4'}
                  />
                </View>
              </View>
            ))
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => router.push('/service-management')}
            >
              <Plus size={20} color="#FF7A00" />
              <Text style={styles.quickActionText}>Nouveau service</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => router.push('/provider-availability')}
            >
              <Calendar size={20} color="#FF7A00" />
              <Text style={styles.quickActionText}>Disponibilités</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );

  // Client Task Posting Component
  const ClientTaskPosting = () => (
    <RoleBasedAccess allowedRoles={['client']} fallback={
      <View style={styles.container}>
        <Text>Accès non autorisé</Text>
      </View>
    }>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Publier une tâche</Text>
          <Text style={styles.subtitle}>Décrivez votre besoin en détail</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Titre de la tâche *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Réparation de plomberie urgente"
              value={taskData.title}
              onChangeText={(text) => setTaskData({...taskData, title: text})}
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description détaillée *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Décrivez votre tâche en détail..."
              value={taskData.description}
              onChangeText={(text) => setTaskData({...taskData, description: text})}
              multiline
              numberOfLines={4}
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Catégorie *</Text>
            {loadingCategories ? (
              <Text style={styles.loadingText}>Chargement des catégories...</Text>
            ) : (
              <View style={styles.categoriesGrid}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryCard,
                      taskData.category === category.id && styles.selectedCategory,
                    ]}
                    onPress={() => setTaskData({...taskData, category: category.id})}
                  >
                    <Text style={styles.categoryIcon}>{category.icon || '📋'}</Text>
                    <Text
                      style={[
                        styles.categoryText,
                        taskData.category === category.id && styles.selectedCategoryText,
                      ]}
                    >
                      {category.name_fr}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Localisation</Text>
            <View style={styles.locationContainer}>
              <MapPin size={20} color="#666" />
              <TextInput
                style={styles.locationInput}
                placeholder="Entrez votre adresse"
                value={taskData.location}
                onChangeText={(text) => setTaskData({...taskData, location: text, coordinates: null})}
                placeholderTextColor="#666"
              />
              <TouchableOpacity
                style={styles.locationButton}
                onPress={handleGetCurrentLocation}
                disabled={gettingLocation}
              >
                <Text style={styles.locationButtonText}>
                  {gettingLocation ? 'Recherche...' : 'Ma position'}
                </Text>
              </TouchableOpacity>
            </View>
            {taskData.coordinates && (
              <Text style={styles.coordinatesText}>
                📍 Position GPS sélectionnée
              </Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Budget approximatif (FCFA)</Text>
            <View style={styles.budgetRow}>
              <View style={styles.budgetContainer}>
                <DollarSign size={20} color="#666" />
                <TextInput
                  style={styles.budgetInput}
                  placeholder="Min"
                  value={taskData.budget_min}
                  onChangeText={(text) => setTaskData({...taskData, budget_min: text})}
                  keyboardType="numeric"
                  placeholderTextColor="#666"
                />
              </View>
              <Text style={styles.budgetSeparator}>à</Text>
              <View style={styles.budgetContainer}>
                <DollarSign size={20} color="#666" />
                <TextInput
                  style={styles.budgetInput}
                  placeholder="Max"
                  value={taskData.budget_max}
                  onChangeText={(text) => setTaskData({...taskData, budget_max: text})}
                  keyboardType="numeric"
                  placeholderTextColor="#666"
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Urgence</Text>
            <View style={styles.urgencyContainer}>
              {urgencyLevels.map((level) => (
                <TouchableOpacity
                  key={level.id}
                  style={[
                    styles.urgencyButton,
                    taskData.urgency === level.id && styles.selectedUrgency,
                    { borderColor: level.color },
                  ]}
                  onPress={() => setTaskData({...taskData, urgency: level.id as any})}
                >
                  <Clock size={16} color={level.color} />
                  <Text
                    style={[
                      styles.urgencyText,
                      { color: level.color },
                      taskData.urgency === level.id && styles.selectedUrgencyText,
                    ]}
                  >
                    {level.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photos (optionnel)</Text>
            <TouchableOpacity style={styles.photoButton}>
              <Camera size={24} color="#666" />
              <Text style={styles.photoButtonText}>Ajouter des photos</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.safetyNote}>
            <Shield size={20} color="#4CAF50" />
            <Text style={styles.safetyText}>
              Vos informations sont sécurisées. Seuls les prestataires vérifiés peuvent voir vos détails.
            </Text>
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Publier la tâche</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </RoleBasedAccess>
  );

  // Render based on user role
  if (profile?.role === 'provider') {
    return <ProviderDashboard />;
  }

  return <ClientTaskPosting />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '30%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedCategory: {
    borderColor: '#FF7A00',
    backgroundColor: '#FFF3E0',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
    textAlign: 'center',
  },
  selectedCategoryText: {
    color: '#FF7A00',
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  locationInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
  locationButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FF7A00',
    borderRadius: 8,
    marginLeft: 8,
  },
  locationButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
  coordinatesText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#4CAF50',
    marginTop: 8,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  budgetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flex: 1,
  },
  budgetInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
  budgetSeparator: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginHorizontal: 16,
  },
  urgencyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  urgencyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderWidth: 1,
  },
  selectedUrgency: {
    backgroundColor: '#FFF3E0',
  },
  urgencyText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
  },
  selectedUrgencyText: {
    fontFamily: 'Inter-SemiBold',
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 20,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  photoButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginLeft: 8,
  },
  safetyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  safetyText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#333',
    marginLeft: 8,
    lineHeight: 16,
  },
  submitButton: {
    backgroundColor: '#FF7A00',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 40,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  // Provider Dashboard Styles
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    marginTop: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
  },
  emptyServices: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyServicesText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 16,
  },
  addServiceButton: {
    backgroundColor: '#FF7A00',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addServiceText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  servicePrice: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FF7A00',
  },
  serviceControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editServiceButton: {
    padding: 8,
    marginRight: 8,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#333',
    marginLeft: 8,
  },
});