import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, MapPin, Clock, DollarSign, User, MessageCircle, Phone, Star, Shield } from 'lucide-react-native';
import TrustBadge from '@/components/TrustBadge';
import SafetyButton from '@/components/SafetyButton';
import PaymentSelector from '@/components/PaymentSelector';

export default function TaskDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [showPayment, setShowPayment] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);

  // Mock task data - in real app, this would come from API
  const task = {
    id: '1',
    title: 'Réparation de plomberie urgente',
    description: 'Fuite d\'eau dans la cuisine, besoin d\'une intervention rapide. Le robinet principal fuit et il y a de l\'eau qui s\'accumule sous l\'évier.',
    category: 'Réparation',
    location: 'Cocody, Abidjan',
    budget: '25000',
    urgency: 'high',
    postedBy: 'Marie Kouassi',
    postedDate: '2024-01-15',
    status: 'open',
    applicants: 5,
    images: [
      'https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      'https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
    ]
  };

  const providers = [
    {
      id: '1',
      name: 'Kouadio Jean',
      rating: 4.8,
      reviews: 45,
      trustScore: 92,
      verificationLevel: 'enhanced',
      isVerified: true,
      price: '20000',
      estimatedTime: '2 heures',
      experience: '8 ans d\'expérience',
      specialties: ['Plomberie', 'Électricité'],
      responseTime: '15 min',
      avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    },
    {
      id: '2',
      name: 'Bakary Traoré',
      rating: 4.6,
      reviews: 32,
      trustScore: 87,
      verificationLevel: 'government',
      isVerified: true,
      price: '18000',
      estimatedTime: '3 heures',
      experience: '5 ans d\'expérience',
      specialties: ['Plomberie', 'Réparations'],
      responseTime: '30 min',
      avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    }
  ];

  const handleSelectProvider = (provider: any) => {
    setSelectedProvider(provider);
    setShowPayment(true);
  };

  const handlePaymentMethodSelect = (method: any) => {
    Alert.alert(
      'Confirmer la réservation',
      `Confirmer la réservation avec ${selectedProvider.name} pour ${selectedProvider.price} FCFA via ${method.name}?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Confirmer', 
          onPress: () => {
            Alert.alert('Succès', 'Réservation confirmée! Le prestataire a été notifié.');
            router.back();
          }
        }
      ]
    );
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return '#FF5722';
      case 'normal': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#666';
    }
  };

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'Urgent';
      case 'normal': return 'Normal';
      case 'low': return 'Pas urgent';
      default: return 'Normal';
    }
  };

  if (showPayment && selectedProvider) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowPayment(false)}>
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Paiement</Text>
          <SafetyButton />
        </View>
        
        <ScrollView style={styles.content}>
          <View style={styles.providerSummary}>
            <Image source={{ uri: selectedProvider.avatar }} style={styles.providerAvatar} />
            <View style={styles.providerInfo}>
              <Text style={styles.providerName}>{selectedProvider.name}</Text>
              <Text style={styles.servicePrice}>{selectedProvider.price} FCFA</Text>
            </View>
          </View>
          
          <PaymentSelector
            amount={parseInt(selectedProvider.price)}
            onPaymentMethodSelect={handlePaymentMethodSelect}
          />
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
        <Text style={styles.headerTitle}>Détails de la tâche</Text>
        <SafetyButton />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.taskCard}>
          <View style={styles.taskHeader}>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <View style={[
              styles.urgencyBadge,
              { backgroundColor: getUrgencyColor(task.urgency) }
            ]}>
              <Clock size={12} color="#FFFFFF" />
              <Text style={styles.urgencyText}>{getUrgencyText(task.urgency)}</Text>
            </View>
          </View>

          <Text style={styles.taskDescription}>{task.description}</Text>

          <View style={styles.taskMeta}>
            <View style={styles.metaItem}>
              <MapPin size={16} color="#666" />
              <Text style={styles.metaText}>{task.location}</Text>
            </View>
            <View style={styles.metaItem}>
              <DollarSign size={16} color="#666" />
              <Text style={styles.metaText}>Budget: {task.budget} FCFA</Text>
            </View>
            <View style={styles.metaItem}>
              <User size={16} color="#666" />
              <Text style={styles.metaText}>{task.applicants} candidatures</Text>
            </View>
          </View>

          {task.images.length > 0 && (
            <View style={styles.imagesContainer}>
              <Text style={styles.imagesTitle}>Photos</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {task.images.map((image, index) => (
                  <Image key={index} source={{ uri: image }} style={styles.taskImage} />
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        <View style={styles.providersSection}>
          <Text style={styles.sectionTitle}>Prestataires disponibles</Text>
          
          {providers.map((provider) => (
            <View key={provider.id} style={styles.providerCard}>
              <View style={styles.providerHeader}>
                <Image source={{ uri: provider.avatar }} style={styles.avatar} />
                <View style={styles.providerDetails}>
                  <View style={styles.providerNameRow}>
                    <Text style={styles.providerName}>{provider.name}</Text>
                    <TrustBadge
                      trustScore={provider.trustScore}
                      verificationLevel={provider.verificationLevel as any}
                      isVerified={provider.isVerified}
                      size="small"
                    />
                  </View>
                  <Text style={styles.experience}>{provider.experience}</Text>
                  <View style={styles.rating}>
                    <Star size={14} color="#FFD700" fill="#FFD700" />
                    <Text style={styles.ratingText}>{provider.rating}</Text>
                    <Text style={styles.reviewsText}>({provider.reviews} avis)</Text>
                  </View>
                </View>
              </View>

              <View style={styles.providerInfo}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Prix proposé:</Text>
                  <Text style={styles.price}>{provider.price} FCFA</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Temps estimé:</Text>
                  <Text style={styles.infoValue}>{provider.estimatedTime}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Temps de réponse:</Text>
                  <Text style={styles.infoValue}>{provider.responseTime}</Text>
                </View>
              </View>

              <View style={styles.specialties}>
                {provider.specialties.map((specialty, index) => (
                  <View key={index} style={styles.specialtyTag}>
                    <Text style={styles.specialtyText}>{specialty}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.providerActions}>
                <TouchableOpacity style={styles.contactButton}>
                  <MessageCircle size={16} color="#666" />
                  <Text style={styles.contactButtonText}>Message</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.callButton}>
                  <Phone size={16} color="#666" />
                  <Text style={styles.callButtonText}>Appeler</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.selectButton}
                  onPress={() => handleSelectProvider(provider)}
                >
                  <Text style={styles.selectButtonText}>Sélectionner</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
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
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  taskTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgencyText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  taskDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  taskMeta: {
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginLeft: 8,
  },
  imagesContainer: {
    marginTop: 16,
  },
  imagesTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 12,
  },
  taskImage: {
    width: 120,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  providersSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  providerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  providerHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  providerDetails: {
    flex: 1,
  },
  providerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  providerName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginRight: 8,
  },
  experience: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 4,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#333',
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginLeft: 4,
  },
  providerInfo: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  price: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#FF7A00',
  },
  infoValue: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#333',
  },
  specialties: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  specialtyTag: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  specialtyText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  providerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    justifyContent: 'center',
  },
  contactButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginLeft: 4,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    justifyContent: 'center',
  },
  callButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginLeft: 4,
  },
  selectButton: {
    backgroundColor: '#FF7A00',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  providerSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    marginTop: 20,
  },
  providerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  servicePrice: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FF7A00',
  },
});