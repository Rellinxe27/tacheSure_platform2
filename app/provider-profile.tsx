import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Star, MapPin, Clock, Shield, Award, MessageCircle, Phone, Calendar } from 'lucide-react-native';
import TrustBadge from '@/components/TrustBadge';
import SafetyButton from '@/components/SafetyButton';

export default function ProviderProfileScreen() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState('overview');

  const provider = {
    id: '1',
    name: 'Kouadio Jean',
    title: 'Plombier Expert',
    rating: 4.8,
    reviews: 45,
    trustScore: 92,
    verificationLevel: 'enhanced',
    isVerified: true,
    location: 'Cocody, Abidjan',
    experience: '8 ans d\'expérience',
    completedTasks: 156,
    responseTime: '15 minutes',
    languages: ['Français', 'Anglais', 'Baoulé'],
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
    coverImage: 'https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
    bio: 'Plombier professionnel avec plus de 8 ans d\'expérience. Spécialisé dans les réparations d\'urgence, installations sanitaires et maintenance préventive. Disponible 7j/7 pour les urgences.',
    services: [
      { name: 'Réparation de fuite', price: '15000-25000 FCFA', duration: '1-2h' },
      { name: 'Installation sanitaire', price: '50000-100000 FCFA', duration: '4-6h' },
      { name: 'Débouchage canalisation', price: '10000-20000 FCFA', duration: '30min-1h' },
      { name: 'Maintenance préventive', price: '20000-30000 FCFA', duration: '2-3h' }
    ],
    certifications: [
      { name: 'Certification Plomberie CFPA', year: '2020' },
      { name: 'Formation Sécurité Chantier', year: '2021' },
      { name: 'Habilitation Gaz', year: '2022' }
    ],
    portfolio: [
      'https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      'https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      'https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop'
    ],
    availability: {
      monday: '08:00-18:00',
      tuesday: '08:00-18:00',
      wednesday: '08:00-18:00',
      thursday: '08:00-18:00',
      friday: '08:00-18:00',
      saturday: '09:00-15:00',
      sunday: 'Urgences uniquement'
    }
  };

  const recentReviews = [
    {
      id: '1',
      client: 'Marie K.',
      rating: 5,
      comment: 'Excellent travail, très professionnel et ponctuel. Je recommande vivement!',
      date: '2024-01-10',
      service: 'Réparation de fuite'
    },
    {
      id: '2',
      client: 'Yves T.',
      rating: 5,
      comment: 'Intervention rapide et efficace. Prix correct et travail de qualité.',
      date: '2024-01-08',
      service: 'Installation sanitaire'
    },
    {
      id: '3',
      client: 'Fatou D.',
      rating: 4,
      comment: 'Bon travail, mais un peu de retard sur l\'horaire prévu.',
      date: '2024-01-05',
      service: 'Débouchage canalisation'
    }
  ];

  const renderOverview = () => (
    <View style={styles.tabContent}>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{provider.completedTasks}</Text>
          <Text style={styles.statLabel}>Tâches réalisées</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{provider.rating}</Text>
          <Text style={styles.statLabel}>Note moyenne</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{provider.responseTime}</Text>
          <Text style={styles.statLabel}>Temps de réponse</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>À propos</Text>
        <Text style={styles.bio}>{provider.bio}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Langues parlées</Text>
        <View style={styles.languagesContainer}>
          {provider.languages.map((language, index) => (
            <View key={index} style={styles.languageTag}>
              <Text style={styles.languageText}>{language}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Certifications</Text>
        {provider.certifications.map((cert, index) => (
          <View key={index} style={styles.certificationItem}>
            <Award size={16} color="#FF7A00" />
            <View style={styles.certificationInfo}>
              <Text style={styles.certificationName}>{cert.name}</Text>
              <Text style={styles.certificationYear}>Obtenue en {cert.year}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderServices = () => (
    <View style={styles.tabContent}>
      {provider.services.map((service, index) => (
        <View key={index} style={styles.serviceCard}>
          <View style={styles.serviceHeader}>
            <Text style={styles.serviceName}>{service.name}</Text>
            <Text style={styles.servicePrice}>{service.price}</Text>
          </View>
          <View style={styles.serviceDetails}>
            <Clock size={14} color="#666" />
            <Text style={styles.serviceDuration}>Durée: {service.duration}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderPortfolio = () => (
    <View style={styles.tabContent}>
      <View style={styles.portfolioGrid}>
        {provider.portfolio.map((image, index) => (
          <TouchableOpacity key={index} style={styles.portfolioItem}>
            <Image source={{ uri: image }} style={styles.portfolioImage} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderReviews = () => (
    <View style={styles.tabContent}>
      {recentReviews.map((review) => (
        <View key={review.id} style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <Text style={styles.reviewClient}>{review.client}</Text>
            <View style={styles.reviewRating}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  color={i < review.rating ? "#FFD700" : "#E0E0E0"}
                  fill={i < review.rating ? "#FFD700" : "#E0E0E0"}
                />
              ))}
            </View>
          </View>
          <Text style={styles.reviewComment}>{review.comment}</Text>
          <View style={styles.reviewMeta}>
            <Text style={styles.reviewService}>{review.service}</Text>
            <Text style={styles.reviewDate}>{review.date}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderAvailability = () => (
    <View style={styles.tabContent}>
      <Text style={styles.availabilityTitle}>Horaires de disponibilité</Text>
      {Object.entries(provider.availability).map(([day, hours]) => (
        <View key={day} style={styles.availabilityRow}>
          <Text style={styles.dayName}>
            {day.charAt(0).toUpperCase() + day.slice(1)}
          </Text>
          <Text style={styles.dayHours}>{hours}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil Prestataire</Text>
        <SafetyButton />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <Image source={{ uri: provider.coverImage }} style={styles.coverImage} />
          <View style={styles.profileInfo}>
            <Image source={{ uri: provider.avatar }} style={styles.avatar} />
            <View style={styles.basicInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.providerName}>{provider.name}</Text>
                <TrustBadge
                  trustScore={provider.trustScore}
                  verificationLevel={provider.verificationLevel as any}
                  isVerified={provider.isVerified}
                />
              </View>
              <Text style={styles.providerTitle}>{provider.title}</Text>
              <View style={styles.locationRow}>
                <MapPin size={14} color="#666" />
                <Text style={styles.location}>{provider.location}</Text>
              </View>
              <View style={styles.ratingRow}>
                <Star size={16} color="#FFD700" fill="#FFD700" />
                <Text style={styles.rating}>{provider.rating}</Text>
                <Text style={styles.reviewCount}>({provider.reviews} avis)</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.messageButton}>
            <MessageCircle size={18} color="#FFFFFF" />
            <Text style={styles.messageButtonText}>Message</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.callButton}>
            <Phone size={18} color="#FF7A00" />
            <Text style={styles.callButtonText}>Appeler</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bookButton}>
            <Calendar size={18} color="#FFFFFF" />
            <Text style={styles.bookButtonText}>Réserver</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { id: 'overview', label: 'Aperçu' },
              { id: 'services', label: 'Services' },
              { id: 'portfolio', label: 'Portfolio' },
              { id: 'reviews', label: 'Avis' },
              { id: 'availability', label: 'Disponibilité' }
            ].map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tab,
                  selectedTab === tab.id && styles.activeTab
                ]}
                onPress={() => setSelectedTab(tab.id)}
              >
                <Text style={[
                  styles.tabText,
                  selectedTab === tab.id && styles.activeTabText
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {selectedTab === 'overview' && renderOverview()}
        {selectedTab === 'services' && renderServices()}
        {selectedTab === 'portfolio' && renderPortfolio()}
        {selectedTab === 'reviews' && renderReviews()}
        {selectedTab === 'availability' && renderAvailability()}
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
    backgroundColor: '#FF7A00',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
  },
  coverImage: {
    width: '100%',
    height: 120,
  },
  profileInfo: {
    flexDirection: 'row',
    padding: 20,
    marginTop: -30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    marginRight: 16,
  },
  basicInfo: {
    flex: 1,
    marginTop: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  providerName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginRight: 12,
  },
  providerTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FF7A00',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  location: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginLeft: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF7A00',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  messageButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FF7A00',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  callButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FF7A00',
    marginLeft: 8,
  },
  bookButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
  },
  bookButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  tabsContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    marginBottom: 20,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#FF7A00',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  tabContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 12,
  },
  bio: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 20,
  },
  languagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  languageTag: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  languageText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  certificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  certificationInfo: {
    marginLeft: 12,
  },
  certificationName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333',
  },
  certificationYear: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    flex: 1,
  },
  servicePrice: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#FF7A00',
  },
  serviceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceDuration: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginLeft: 8,
  },
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  portfolioItem: {
    width: '48%',
    marginBottom: 16,
  },
  portfolioImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewClient: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewComment: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  reviewMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reviewService: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FF7A00',
  },
  reviewDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  availabilityTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  availabilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  dayName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333',
  },
  dayHours: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
});