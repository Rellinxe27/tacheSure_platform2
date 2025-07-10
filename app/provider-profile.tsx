// app/provider-profile.tsx (Enhanced with real data persistence)
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Star, MapPin, Clock, Shield, Award, MessageCircle, Phone, Calendar, Heart } from 'lucide-react-native';
import TrustBadge from '@/components/TrustBadge';
import SafetyButton from '@/components/SafetyButton';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/app/contexts/AuthContext';
import { formatCurrency, formatDistance, formatTimeAgo } from '@/utils/formatting';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ProviderProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  location: any;
  address: any;
  trust_score: number;
  is_verified: boolean;
  verification_level: string;
  languages: string[];
  created_at: string;
  last_seen_at?: string;
  services: {
    id: string;
    name: string;
    description: string;
    price_min: number;
    price_max: number;
    price_unit?: string;
    duration_estimate?: string;
    is_emergency_available: boolean;
    category: {
      name_fr: string;
      icon: string;
    };
  }[];
  reviews: {
    id: string;
    rating: number;
    title?: string;
    comment?: string;
    reviewer_name: string;
    created_at: string;
    task_title?: string;
  }[];
  stats: {
    averageRating: number;
    totalReviews: number;
    completedTasks: number;
    responseTime: number;
    joinedDate: string;
  };
  availability: {
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_available: boolean;
  }[];
  certifications: {
    name: string;
    year: string;
  }[];
  portfolio: string[];
}

export default function ProviderProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user, profile: currentUserProfile } = useAuth();

  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProviderProfile();
      checkUserRelations();
    }
  }, [id]);

  const fetchProviderProfile = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Fetch provider profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          avatar_url,
          phone,
          location,
          address,
          trust_score,
          is_verified,
          verification_level,
          languages,
          created_at,
          last_seen_at
        `)
        .eq('id', id)
        .eq('role', 'provider')
        .single();

      if (profileError) throw profileError;

      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select(`
          id,
          name,
          description,
          price_min,
          price_max,
          price_unit,
          duration_estimate,
          is_emergency_available,
          categories (
            name_fr,
            icon
          )
        `)
        .eq('provider_id', id)
        .eq('is_active', true);

      if (servicesError) throw servicesError;

      // Fetch reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          title,
          comment,
          created_at,
          task_id,
          reviewer:profiles!reviewer_id (
            full_name
          ),
          task:tasks (
            title
          )
        `)
        .eq('reviewee_id', id)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (reviewsError) throw reviewsError;

      // Fetch availability schedule
      const { data: availabilityData, error: availabilityError } = await supabase
        .from('availability_schedules')
        .select('*')
        .eq('provider_id', id);

      if (availabilityError) throw availabilityError;

      // Fetch completed tasks count
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('id')
        .eq('provider_id', id)
        .eq('status', 'completed');

      if (tasksError) throw tasksError;

      // Calculate stats
      const totalReviews = reviewsData?.length || 0;
      const averageRating = totalReviews > 0
        ? reviewsData!.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;

      // Process data
      const processedProvider: ProviderProfile = {
        ...profileData,
        services: servicesData?.map(service => ({
          ...service,
          category: service.categories
        })) || [],
        reviews: reviewsData?.map(review => ({
          id: review.id,
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          reviewer_name: (review.reviewer as any)?.full_name || 'Utilisateur anonyme',
          created_at: review.created_at,
          task_title: (review.task as any)?.title
        })) || [],
        stats: {
          averageRating: Math.round(averageRating * 10) / 10,
          totalReviews,
          completedTasks: tasksData?.length || 0,
          responseTime: Math.floor(Math.random() * 30) + 5, // Mock data
          joinedDate: profileData.created_at
        },
        availability: availabilityData || [],
        certifications: [
          // Mock data - would come from a certifications table
          { name: 'Certification professionnelle', year: '2023' },
          { name: 'Formation sécurité', year: '2022' }
        ],
        portfolio: [
          // Mock data - would come from a portfolio table
          'https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop'
        ]
      };

      setProvider(processedProvider);

      // Save to cache
      await AsyncStorage.setItem(`provider_profile_${id}`, JSON.stringify(processedProvider));

    } catch (error) {
      console.error('Error fetching provider profile:', error);

      // Try to load from cache
      try {
        const cachedData = await AsyncStorage.getItem(`provider_profile_${id}`);
        if (cachedData) {
          setProvider(JSON.parse(cachedData));
        }
      } catch (cacheError) {
        console.error('Error loading cached data:', cacheError);
        Alert.alert('Erreur', 'Impossible de charger le profil du prestataire');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const checkUserRelations = async () => {
    if (!user) return;

    try {
      // Check if provider is in favorites (would implement favorites table)
      const favoritesData = await AsyncStorage.getItem(`favorites_${user.id}`);
      if (favoritesData) {
        const favorites = JSON.parse(favoritesData);
        setIsFavorite(favorites.includes(id));
      }

      // Check if provider is blocked (would implement blocks table)
      const blockedData = await AsyncStorage.getItem(`blocked_${user.id}`);
      if (blockedData) {
        const blocked = JSON.parse(blockedData);
        setIsBlocked(blocked.includes(id));
      }
    } catch (error) {
      console.error('Error checking user relations:', error);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!user) return;

    try {
      const favoritesKey = `favorites_${user.id}`;
      const favoritesData = await AsyncStorage.getItem(favoritesKey);
      let favorites = favoritesData ? JSON.parse(favoritesData) : [];

      if (isFavorite) {
        favorites = favorites.filter((fav: string) => fav !== id);
      } else {
        favorites.push(id);
      }

      await AsyncStorage.setItem(favoritesKey, JSON.stringify(favorites));
      setIsFavorite(!isFavorite);

      // In production, would also update database
      Alert.alert(
        'Favoris',
        isFavorite ? 'Prestataire retiré des favoris' : 'Prestataire ajouté aux favoris'
      );
    } catch (error) {
      console.error('Error updating favorites:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour les favoris');
    }
  };

  const handleContact = async (method: 'call' | 'message' | 'book') => {
    if (!provider) return;

    switch (method) {
      case 'call':
        if (provider.phone) {
          // Would implement phone call
          Alert.alert('Appel', `Appeler ${provider.full_name} au ${provider.phone}?`);
        } else {
          Alert.alert('Erreur', 'Numéro de téléphone non disponible');
        }
        break;
      case 'message':
        router.push(`/chat?providerId=${provider.id}`);
        break;
      case 'book':
        router.push(`/book-service?providerId=${provider.id}`);
        break;
    }
  };

  const handleReportUser = () => {
    router.push(`/report-user?userId=${id}`);
  };

  const handleBlockUser = async () => {
    Alert.alert(
      'Bloquer cet utilisateur',
      'Vous ne recevrez plus de notifications de ce prestataire. Cette action peut être annulée.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Bloquer',
          style: 'destructive',
          onPress: async () => {
            try {
              const blockedKey = `blocked_${user?.id}`;
              const blockedData = await AsyncStorage.getItem(blockedKey);
              let blocked = blockedData ? JSON.parse(blockedData) : [];

              if (!blocked.includes(id)) {
                blocked.push(id);
                await AsyncStorage.setItem(blockedKey, JSON.stringify(blocked));
                setIsBlocked(true);
                Alert.alert('Succès', 'Utilisateur bloqué');
              }
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de bloquer cet utilisateur');
            }
          }
        }
      ]
    );
  };

  const renderOverview = () => (
    <View style={styles.tabContent}>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{provider!.stats.completedTasks}</Text>
          <Text style={styles.statLabel}>Tâches réalisées</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{provider!.stats.averageRating}</Text>
          <Text style={styles.statLabel}>Note moyenne</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{provider!.stats.responseTime} min</Text>
          <Text style={styles.statLabel}>Temps de réponse</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Langues parlées</Text>
        <View style={styles.languagesContainer}>
          {provider!.languages.map((language, index) => (
            <View key={index} style={styles.languageTag}>
              <Text style={styles.languageText}>{language}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations</Text>
        <Text style={styles.infoText}>
          Membre depuis {formatTimeAgo(provider!.stats.joinedDate)}
        </Text>
        {provider!.last_seen_at && (
          <Text style={styles.infoText}>
            Dernière activité: {formatTimeAgo(provider!.last_seen_at)}
          </Text>
        )}
      </View>

      {provider!.certifications.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certifications</Text>
          {provider!.certifications.map((cert, index) => (
            <View key={index} style={styles.certificationItem}>
              <Award size={16} color="#FF7A00" />
              <View style={styles.certificationInfo}>
                <Text style={styles.certificationName}>{cert.name}</Text>
                <Text style={styles.certificationYear}>Obtenue en {cert.year}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderServices = () => (
    <View style={styles.tabContent}>
      {provider!.services.map((service, index) => (
        <View key={index} style={styles.serviceCard}>
          <View style={styles.serviceHeader}>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={styles.serviceCategory}>{service.category?.name_fr}</Text>
            </View>
            <View style={styles.servicePricing}>
              <Text style={styles.servicePrice}>
                {formatCurrency(service.price_min)} - {formatCurrency(service.price_max)}
              </Text>
              {service.price_unit && (
                <Text style={styles.servicePriceUnit}>par {service.price_unit}</Text>
              )}
            </View>
          </View>

          <Text style={styles.serviceDescription}>{service.description}</Text>

          <View style={styles.serviceDetails}>
            {service.duration_estimate && (
              <View style={styles.serviceDetailItem}>
                <Clock size={14} color="#666" />
                <Text style={styles.serviceDetailText}>Durée: {service.duration_estimate}</Text>
              </View>
            )}
            {service.is_emergency_available && (
              <View style={styles.serviceDetailItem}>
                <Shield size={14} color="#FF5722" />
                <Text style={styles.serviceDetailText}>Disponible en urgence</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.bookServiceButton}
            onPress={() => router.push(`/book-service?serviceId=${service.id}`)}
          >
            <Text style={styles.bookServiceButtonText}>Réserver ce service</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  const renderReviews = () => (
    <View style={styles.tabContent}>
      {provider!.reviews.length === 0 ? (
        <View style={styles.emptyReviews}>
          <Text style={styles.emptyReviewsText}>Aucun avis pour le moment</Text>
        </View>
      ) : (
        provider!.reviews.map((review) => (
          <View key={review.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.reviewerInfo}>
                <Text style={styles.reviewerName}>{review.reviewer_name}</Text>
                <Text style={styles.reviewDate}>{formatTimeAgo(review.created_at)}</Text>
              </View>
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

            {review.title && (
              <Text style={styles.reviewTitle}>{review.title}</Text>
            )}

            {review.comment && (
              <Text style={styles.reviewComment}>{review.comment}</Text>
            )}

            {review.task_title && (
              <Text style={styles.reviewTaskTitle}>Tâche: {review.task_title}</Text>
            )}
          </View>
        ))
      )}
    </View>
  );

  const renderAvailability = () => (
    <View style={styles.tabContent}>
      <Text style={styles.availabilityTitle}>Horaires de disponibilité</Text>
      {provider!.availability.length === 0 ? (
        <Text style={styles.noAvailabilityText}>
          Horaires non configurés - Contactez le prestataire directement
        </Text>
      ) : (
        provider!.availability.map((schedule, index) => {
          const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
          return (
            <View key={index} style={styles.availabilityRow}>
              <Text style={styles.dayName}>{dayNames[schedule.day_of_week]}</Text>
              <Text style={styles.dayHours}>
                {schedule.is_available
                  ? `${schedule.start_time} - ${schedule.end_time}`
                  : 'Non disponible'
                }
              </Text>
            </View>
          );
        })
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF7A00" />
        <Text style={styles.loadingText}>Chargement du profil...</Text>
      </View>
    );
  }

  if (!provider) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Prestataire introuvable</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil Prestataire</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerAction}
            onPress={handleFavoriteToggle}
          >
            <Heart
              size={20}
              color={isFavorite ? "#FF5722" : "#FFFFFF"}
              fill={isFavorite ? "#FF5722" : "none"}
            />
          </TouchableOpacity>
          <SafetyButton onEmergency={handleReportUser} />
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchProviderProfile(true)} />
        }
      >
        <View style={styles.profileHeader}>
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri: provider.avatar_url || 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop'
                }}
                style={styles.avatar}
              />
            </View>

            <View style={styles.basicInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.providerName}>{provider.full_name}</Text>
                <TrustBadge
                  trustScore={provider.trust_score}
                  verificationLevel={provider.verification_level as any}
                  isVerified={provider.is_verified}
                />
              </View>

              <View style={styles.locationRow}>
                <MapPin size={14} color="#666" />
                <Text style={styles.location}>
                  {provider.address?.city || 'Abidjan'}
                </Text>
              </View>

              <View style={styles.ratingRow}>
                <Star size={16} color="#FFD700" fill="#FFD700" />
                <Text style={styles.rating}>{provider.stats.averageRating}</Text>
                <Text style={styles.reviewCount}>({provider.stats.totalReviews} avis)</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.messageButton}
            onPress={() => handleContact('message')}
          >
            <MessageCircle size={18} color="#FFFFFF" />
            <Text style={styles.messageButtonText}>Message</Text>
          </TouchableOpacity>

          {provider.phone && (
            <TouchableOpacity
              style={styles.callButton}
              onPress={() => handleContact('call')}
            >
              <Phone size={18} color="#FF7A00" />
              <Text style={styles.callButtonText}>Appeler</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.bookButton}
            onPress={() => handleContact('book')}
          >
            <Calendar size={18} color="#FFFFFF" />
            <Text style={styles.bookButtonText}>Réserver</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { id: 'overview', label: 'Aperçu' },
              { id: 'services', label: 'Services' },
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
        {selectedTab === 'reviews' && renderReviews()}
        {selectedTab === 'availability' && renderAvailability()}

        {/* Admin Actions for current user */}
        {currentUserProfile?.role === 'admin' && (
          <View style={styles.adminActions}>
            <TouchableOpacity
              style={styles.reportButton}
              onPress={handleReportUser}
            >
              <Text style={styles.reportButtonText}>Signaler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.blockButton}
              onPress={handleBlockUser}
            >
              <Text style={styles.blockButtonText}>Bloquer</Text>
            </TouchableOpacity>
          </View>
        )}
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
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FF5722',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#FF7A00',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAction: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
  },
  profileInfo: {
    flexDirection: 'row',
    padding: 20,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  basicInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  providerName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginRight: 12,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    marginBottom: 12,
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
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 8,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  serviceInfo: {
    flex: 1,
    marginRight: 12,
  },
  serviceName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 2,
  },
  serviceCategory: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FF7A00',
  },
  servicePricing: {
    alignItems: 'flex-end',
  },
  servicePrice: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#333',
  },
  servicePriceUnit: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  serviceDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 18,
    marginBottom: 12,
  },
  serviceDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  serviceDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  serviceDetailText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginLeft: 4,
  },
  bookServiceButton: {
    backgroundColor: '#FF7A00',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookServiceButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  emptyReviews: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyReviewsText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  reviewDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 2,
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  reviewComment: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  reviewTaskTitle: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FF7A00',
  },
  availabilityTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  noAvailabilityText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  availabilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
  adminActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  reportButton: {
    flex: 1,
    backgroundColor: '#FF9800',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  reportButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  blockButton: {
    flex: 1,
    backgroundColor: '#FF5722',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  blockButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});