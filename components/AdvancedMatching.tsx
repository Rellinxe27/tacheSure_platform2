// components/AdvancedMatching.tsx (Enhanced with real data persistence)
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { Star, MapPin, Clock, Shield, Award, TrendingUp, Phone, MessageCircle, Calendar } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatDistance } from '@/utils/formatting';
import { useAuth } from '@/app/contexts/AuthContext';

interface Provider {
  id: string;
  full_name: string;
  avatar_url?: string;
  trust_score: number;
  is_verified: boolean;
  verification_level: string;
  location: any;
  address: any;
  phone?: string;
  languages: string[];
  services: {
    id: string;
    name: string;
    description: string;
    price_min: number;
    price_max: number;
    category: {
      name_fr: string;
      icon: string;
    };
    is_emergency_available: boolean;
  }[];
  reviews: {
    rating: number;
    count: number;
  };
  distance?: number;
  responseTime: number;
  completedTasks: number;
  availability: 'available' | 'busy' | 'offline';
  matchScore: number;
  lastSeen?: string;
}

interface MatchingCriteria {
  location: { lat: number; lng: number; address: string };
  radius: number;
  budget: { min: number; max: number };
  urgency: 'low' | 'normal' | 'high';
  skills: string[];
  language: string;
  timePreference: 'morning' | 'afternoon' | 'evening' | 'anytime';
  minRating: number;
  minTrustScore: number;
  verificationLevel: 'any' | 'basic' | 'government' | 'enhanced';
  availability: 'any' | 'available' | 'busy';
  selectedCategories: string[];
  emergencyOnly: boolean;
  insuranceRequired: boolean;
}

interface AdvancedMatchingProps {
  criteria: MatchingCriteria;
  searchQuery?: string;
  onProviderSelect: (provider: Provider) => void;
  onResultsFound?: (count: number) => void;
}

export default function AdvancedMatching({
                                           criteria,
                                           searchQuery = '',
                                           onProviderSelect,
                                           onResultsFound
                                         }: AdvancedMatchingProps) {
  const { user } = useAuth();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [sortBy, setSortBy] = useState<'match' | 'price' | 'rating' | 'distance'>('match');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProviders();
  }, [criteria]);

  const fetchProviders = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Build the query based on criteria
      let query = supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          avatar_url,
          trust_score,
          is_verified,
          verification_level,
          location,
          address,
          phone,
          languages,
          last_seen_at,
          services (
            id,
            name,
            description,
            price_min,
            price_max,
            is_emergency_available,
            is_active,
            categories (
              name_fr,
              icon
            )
          )
        `)
        .eq('role', 'provider')
        .eq('is_active', true);

      // Apply verification level filter
      if (criteria.verificationLevel !== 'any') {
        query = query.eq('verification_level', criteria.verificationLevel);
      }

      // Apply trust score filter
      if (criteria.minTrustScore > 0) {
        query = query.gte('trust_score', criteria.minTrustScore);
      }

      // Apply language filter
      if (criteria.language !== 'Tous') {
        query = query.contains('languages', [criteria.language]);
      }

      const { data: profilesData, error: profilesError } = await query;

      if (profilesError) {
        throw profilesError;
      }

      if (!profilesData) {
        setProviders([]);
        onResultsFound?.(0);
        return;
      }

      // Get reviews data for each provider
      const providerIds = profilesData.map(p => p.id);
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('reviewee_id, rating')
        .in('reviewee_id', providerIds)
        .eq('is_public', true);

      // Get completed tasks count
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('provider_id')
        .in('provider_id', providerIds)
        .eq('status', 'completed');

      // Process and filter providers
      const processedProviders = profilesData
        .map(profile => {
          // Filter services based on criteria
          const filteredServices = (profile.services || []).filter(service => {
            if (!service.is_active) return false;

            // Category filter
            if (criteria.selectedCategories.length > 0) {
              // This would need proper category matching logic
            }

            // Budget filter
            if (criteria.budget.min > 0 || criteria.budget.max > 0) {
              const serviceInBudget =
                service.price_min <= criteria.budget.max &&
                service.price_max >= criteria.budget.min;
              if (!serviceInBudget) return false;
            }

            // Emergency filter
            if (criteria.emergencyOnly && !service.is_emergency_available) {
              return false;
            }

            // Skills/search query filter
            if (searchQuery || criteria.skills.length > 0) {
              const searchTerms = [
                ...criteria.skills,
                ...(searchQuery ? searchQuery.toLowerCase().split(' ') : [])
              ];

              const serviceText = `${service.name} ${service.description}`.toLowerCase();
              const hasMatchingSkill = searchTerms.some(term =>
                serviceText.includes(term.toLowerCase())
              );

              if (!hasMatchingSkill) return false;
            }

            return true;
          });

          // Skip providers with no matching services
          if (filteredServices.length === 0) return null;

          // Calculate reviews stats
          const providerReviews = (reviewsData || []).filter(r => r.reviewee_id === profile.id);
          const averageRating = providerReviews.length > 0
            ? providerReviews.reduce((sum, r) => sum + r.rating, 0) / providerReviews.length
            : 0;

          // Apply rating filter
          if (averageRating < criteria.minRating) return null;

          // Calculate completed tasks
          const completedTasks = (tasksData || []).filter(t => t.provider_id === profile.id).length;

          // Calculate distance (simplified - would use PostGIS in production)
          const distance = calculateDistance(
            criteria.location.lat,
            criteria.location.lng,
            // Would extract from profile.location POINT
            5.3600, // Mock coordinates
            -4.0083
          );

          // Apply radius filter
          if (distance > criteria.radius) return null;

          // Determine availability (simplified logic)
          const lastSeen = profile.last_seen_at ? new Date(profile.last_seen_at) : null;
          const minutesSinceLastSeen = lastSeen
            ? (Date.now() - lastSeen.getTime()) / (1000 * 60)
            : Infinity;

          let availability: 'available' | 'busy' | 'offline' = 'offline';
          if (minutesSinceLastSeen < 5) availability = 'available';
          else if (minutesSinceLastSeen < 30) availability = 'busy';

          // Apply availability filter
          if (criteria.availability !== 'any' && availability !== criteria.availability) {
            return null;
          }

          const provider: Provider = {
            id: profile.id,
            full_name: profile.full_name || 'Prestataire',
            avatar_url: profile.avatar_url,
            trust_score: profile.trust_score || 0,
            is_verified: profile.is_verified || false,
            verification_level: profile.verification_level || 'basic',
            location: profile.location,
            address: profile.address,
            phone: profile.phone,
            languages: profile.languages || ['Français'],
            services: filteredServices,
            reviews: {
              rating: Math.round(averageRating * 10) / 10,
              count: providerReviews.length
            },
            distance: Math.round(distance * 10) / 10,
            responseTime: Math.floor(Math.random() * 30) + 5, // Mock data
            completedTasks,
            availability,
            matchScore: 0, // Will be calculated
            lastSeen: profile.last_seen_at
          };

          // Calculate match score
          provider.matchScore = calculateMatchScore(provider, criteria);

          return provider;
        })
        .filter(Boolean) as Provider[];

      // Sort providers
      const sortedProviders = sortProviders(processedProviders, sortBy);

      setProviders(sortedProviders);
      onResultsFound?.(sortedProviders.length);

    } catch (err) {
      console.error('Error fetching providers:', err);
      setError('Erreur lors de la recherche des prestataires');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const calculateMatchScore = (provider: Provider, criteria: MatchingCriteria): number => {
    let score = 0;

    // Distance factor (25%)
    const distanceScore = Math.max(0, (criteria.radius - provider.distance!) / criteria.radius);
    score += distanceScore * 0.25;

    // Trust score factor (20%)
    score += (provider.trust_score / 100) * 0.20;

    // Rating factor (20%)
    score += (provider.reviews.rating / 5) * 0.20;

    // Price factor (15%) - check if any service is in budget
    const serviceInBudget = provider.services.some(service =>
      service.price_min <= criteria.budget.max && service.price_max >= criteria.budget.min
    );
    score += serviceInBudget ? 0.15 : 0;

    // Skills match factor (10%)
    const allSkills = [...criteria.skills];
    if (searchQuery) {
      allSkills.push(...searchQuery.split(' ').filter(term => term.length > 2));
    }

    if (allSkills.length > 0) {
      const serviceTexts = provider.services.map(s => `${s.name} ${s.description}`.toLowerCase());
      const matchingSkills = allSkills.filter(skill =>
        serviceTexts.some(text => text.includes(skill.toLowerCase()))
      );
      const skillsMatch = matchingSkills.length / allSkills.length;
      score += skillsMatch * 0.10;
    } else {
      score += 0.10; // Full score if no specific skills required
    }

    // Language factor (5%)
    const languageMatch = provider.languages.includes(criteria.language);
    score += languageMatch ? 0.05 : 0;

    // Availability factor (5%)
    const availabilityScore = provider.availability === 'available' ? 1 :
      provider.availability === 'busy' ? 0.5 : 0;
    score += availabilityScore * 0.05;

    return Math.round(score * 100);
  };

  const sortProviders = (providers: Provider[], sortBy: string): Provider[] => {
    return [...providers].sort((a, b) => {
      switch (sortBy) {
        case 'match':
          return b.matchScore - a.matchScore;
        case 'price':
          const aMinPrice = Math.min(...a.services.map(s => s.price_min));
          const bMinPrice = Math.min(...b.services.map(s => s.price_min));
          return aMinPrice - bMinPrice;
        case 'rating':
          return b.reviews.rating - a.reviews.rating;
        case 'distance':
          return (a.distance || 0) - (b.distance || 0);
        default:
          return 0;
      }
    });
  };

  const getAvailabilityColor = (availability: string): string => {
    switch (availability) {
      case 'available': return '#4CAF50';
      case 'busy': return '#FF9800';
      case 'offline': return '#FF5722';
      default: return '#666';
    }
  };

  const getAvailabilityText = (availability: string): string => {
    switch (availability) {
      case 'available': return 'Disponible';
      case 'busy': return 'Occupé';
      case 'offline': return 'Hors ligne';
      default: return 'Inconnu';
    }
  };

  const handleRefresh = () => {
    fetchProviders(true);
  };

  const handleProviderContact = async (provider: Provider, method: 'call' | 'message' | 'book') => {
    switch (method) {
      case 'call':
        // Would implement phone call functionality
        break;
      case 'message':
        // Would navigate to messaging
        break;
      case 'book':
        // Would navigate to booking
        break;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <TrendingUp size={40} color="#FF7A00" />
        <Text style={styles.loadingText}>Recherche des meilleurs prestataires...</Text>
        <Text style={styles.loadingSubtext}>Analyse en cours avec IA avancée</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchProviders()}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Prestataires recommandés</Text>
        <Text style={styles.subtitle}>{providers.length} correspondances trouvées</Text>
      </View>

      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Trier par:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'match', label: 'Correspondance' },
            { key: 'price', label: 'Prix' },
            { key: 'rating', label: 'Note' },
            { key: 'distance', label: 'Distance' }
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.sortButton,
                sortBy === option.key && styles.sortButtonActive
              ]}
              onPress={() => {
                setSortBy(option.key as any);
                setProviders(prev => sortProviders(prev, option.key));
              }}
            >
              <Text style={[
                styles.sortButtonText,
                sortBy === option.key && styles.sortButtonTextActive
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.providersList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {providers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Aucun prestataire trouvé</Text>
            <Text style={styles.emptySubtitle}>
              Essayez d'élargir vos critères de recherche
            </Text>
          </View>
        ) : (
          providers.map((provider) => (
            <TouchableOpacity
              key={provider.id}
              style={styles.providerCard}
              onPress={() => onProviderSelect(provider)}
            >
              <View style={styles.providerHeader}>
                <View style={styles.providerInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.providerName}>{provider.full_name}</Text>
                    {provider.is_verified && (
                      <Shield size={16} color="#4CAF50" />
                    )}
                  </View>
                  <View style={styles.matchScore}>
                    <Award size={14} color="#FFD700" />
                    <Text style={styles.matchScoreText}>{provider.matchScore}% match</Text>
                  </View>
                </View>
                <View style={styles.providerMeta}>
                  <Text style={styles.providerPrice}>
                    {formatCurrency(Math.min(...provider.services.map(s => s.price_min)))}+
                  </Text>
                  <View style={[
                    styles.availabilityDot,
                    { backgroundColor: getAvailabilityColor(provider.availability) }
                  ]} />
                  <Text style={styles.availabilityText}>
                    {getAvailabilityText(provider.availability)}
                  </Text>
                </View>
              </View>

              <View style={styles.providerStats}>
                <View style={styles.statItem}>
                  <Star size={12} color="#FFD700" fill="#FFD700" />
                  <Text style={styles.statText}>{provider.reviews.rating || 'N/A'}</Text>
                  <Text style={styles.statSubtext}>({provider.reviews.count})</Text>
                </View>
                <View style={styles.statItem}>
                  <MapPin size={12} color="#666" />
                  <Text style={styles.statText}>{formatDistance(provider.distance || 0)}</Text>
                </View>
                <View style={styles.statItem}>
                  <Clock size={12} color="#666" />
                  <Text style={styles.statText}>{provider.responseTime} min</Text>
                </View>
                <View style={styles.statItem}>
                  <Shield size={12} color="#4CAF50" />
                  <Text style={styles.statText}>{provider.trust_score}%</Text>
                </View>
              </View>

              <View style={styles.servicesContainer}>
                <Text style={styles.servicesLabel}>Services:</Text>
                <View style={styles.servicesList}>
                  {provider.services.slice(0, 3).map((service, index) => (
                    <View key={index} style={styles.serviceTag}>
                      <Text style={styles.serviceText}>{service.name}</Text>
                      {service.is_emergency_available && (
                        <Text style={styles.emergencyIndicator}>⚡</Text>
                      )}
                    </View>
                  ))}
                  {provider.services.length > 3 && (
                    <Text style={styles.moreServices}>+{provider.services.length - 3}</Text>
                  )}
                </View>
              </View>

              <View style={styles.languagesContainer}>
                <Text style={styles.languagesLabel}>Langues:</Text>
                {provider.languages.slice(0, 3).map((language, index) => (
                  <Text key={index} style={styles.languageText}>
                    {language}{index < Math.min(provider.languages.length, 3) - 1 ? ', ' : ''}
                  </Text>
                ))}
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleProviderContact(provider, 'message')}
                >
                  <MessageCircle size={16} color="#FF7A00" />
                  <Text style={styles.actionButtonText}>Message</Text>
                </TouchableOpacity>

                {provider.phone && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleProviderContact(provider, 'call')}
                  >
                    <Phone size={16} color="#FF7A00" />
                    <Text style={styles.actionButtonText}>Appeler</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.actionButton, styles.bookButton]}
                  onPress={() => handleProviderContact(provider, 'book')}
                >
                  <Calendar size={16} color="#FFFFFF" />
                  <Text style={[styles.actionButtonText, styles.bookButtonText]}>Réserver</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
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
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginTop: 16,
  },
  loadingSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FF5722',
    textAlign: 'center',
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
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 4,
  },
  sortContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sortLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginBottom: 8,
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  sortButtonActive: {
    backgroundColor: '#FF7A00',
  },
  sortButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  sortButtonTextActive: {
    color: '#FFFFFF',
  },
  providersList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
  },
  providerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  providerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  providerInfo: {
    flex: 1,
  },
  nameRow: {
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
  matchScore: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  matchScoreText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFD700',
    marginLeft: 4,
  },
  providerMeta: {
    alignItems: 'flex-end',
  },
  providerPrice: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#FF7A00',
    marginBottom: 4,
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 2,
  },
  availabilityText: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  providerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#333',
    marginLeft: 4,
  },
  statSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginLeft: 2,
  },
  servicesContainer: {
    marginBottom: 8,
  },
  servicesLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginBottom: 4,
  },
  servicesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  serviceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  serviceText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  emergencyIndicator: {
    fontSize: 10,
    marginLeft: 4,
  },
  moreServices: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  languagesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  languagesLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginRight: 8,
  },
  languageText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  actionButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FF7A00',
    marginLeft: 4,
  },
  bookButton: {
    backgroundColor: '#FF7A00',
  },
  bookButtonText: {
    color: '#FFFFFF',
  },
});