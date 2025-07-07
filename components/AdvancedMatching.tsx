import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Star, MapPin, Clock, Shield, Award, TrendingUp } from 'lucide-react-native';

interface Provider {
  id: string;
  name: string;
  trustScore: number;
  rating: number;
  reviews: number;
  distance: number;
  responseTime: number;
  completedTasks: number;
  skills: string[];
  languages: string[];
  availability: 'available' | 'busy' | 'offline';
  price: number;
  matchScore: number;
}

interface MatchingCriteria {
  location: { lat: number; lng: number };
  budget: { min: number; max: number };
  urgency: 'low' | 'normal' | 'high';
  skills: string[];
  language: string;
  timePreference: 'morning' | 'afternoon' | 'evening' | 'anytime';
}

interface AdvancedMatchingProps {
  criteria: MatchingCriteria;
  onProviderSelect: (provider: Provider) => void;
}

export default function AdvancedMatching({ criteria, onProviderSelect }: AdvancedMatchingProps) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [sortBy, setSortBy] = useState<'match' | 'price' | 'rating' | 'distance'>('match');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate advanced matching algorithm
    setTimeout(() => {
      const mockProviders = generateMatchedProviders(criteria);
      setProviders(mockProviders);
      setLoading(false);
    }, 1500);
  }, [criteria]);

  const calculateMatchScore = (provider: Provider, criteria: MatchingCriteria): number => {
    let score = 0;
    
    // Distance factor (25%)
    const maxDistance = 20; // km
    const distanceScore = Math.max(0, (maxDistance - provider.distance) / maxDistance);
    score += distanceScore * 0.25;
    
    // Trust score factor (20%)
    score += (provider.trustScore / 100) * 0.20;
    
    // Rating factor (20%)
    score += (provider.rating / 5) * 0.20;
    
    // Price factor (15%)
    const priceInRange = provider.price >= criteria.budget.min && provider.price <= criteria.budget.max;
    score += priceInRange ? 0.15 : 0;
    
    // Skills match factor (10%)
    const skillsMatch = criteria.skills.filter(skill => 
      provider.skills.some(pSkill => pSkill.toLowerCase().includes(skill.toLowerCase()))
    ).length / criteria.skills.length;
    score += skillsMatch * 0.10;
    
    // Language factor (5%)
    const languageMatch = provider.languages.includes(criteria.language);
    score += languageMatch ? 0.05 : 0;
    
    // Availability factor (5%)
    const availabilityScore = provider.availability === 'available' ? 1 : 
                             provider.availability === 'busy' ? 0.5 : 0;
    score += availabilityScore * 0.05;
    
    return Math.round(score * 100);
  };

  const generateMatchedProviders = (criteria: MatchingCriteria): Provider[] => {
    const mockProviders: Provider[] = [
      {
        id: '1',
        name: 'Kouadio Jean',
        trustScore: 92,
        rating: 4.8,
        reviews: 45,
        distance: 2.5,
        responseTime: 15,
        completedTasks: 156,
        skills: ['Plomberie', 'Électricité', 'Réparations'],
        languages: ['Français', 'Baoulé'],
        availability: 'available',
        price: 20000,
        matchScore: 0
      },
      {
        id: '2',
        name: 'Aminata Traoré',
        trustScore: 95,
        rating: 4.9,
        reviews: 67,
        distance: 1.8,
        responseTime: 8,
        completedTasks: 203,
        skills: ['Nettoyage', 'Ménage', 'Repassage'],
        languages: ['Français', 'Dioula'],
        availability: 'available',
        price: 15000,
        matchScore: 0
      },
      {
        id: '3',
        name: 'Bakary Koné',
        trustScore: 87,
        rating: 4.6,
        reviews: 32,
        distance: 3.2,
        responseTime: 30,
        completedTasks: 89,
        skills: ['Livraison', 'Transport', 'Déménagement'],
        languages: ['Français', 'Anglais'],
        availability: 'busy',
        price: 12000,
        matchScore: 0
      },
      {
        id: '4',
        name: 'Fatou Diabaté',
        trustScore: 89,
        rating: 4.7,
        reviews: 54,
        distance: 4.1,
        responseTime: 20,
        completedTasks: 127,
        skills: ['Cuisine', 'Pâtisserie', 'Traiteur'],
        languages: ['Français', 'Malinké'],
        availability: 'available',
        price: 25000,
        matchScore: 0
      }
    ];

    // Calculate match scores
    return mockProviders.map(provider => ({
      ...provider,
      matchScore: calculateMatchScore(provider, criteria)
    })).sort((a, b) => b.matchScore - a.matchScore);
  };

  const sortProviders = (providers: Provider[], sortBy: string): Provider[] => {
    return [...providers].sort((a, b) => {
      switch (sortBy) {
        case 'match':
          return b.matchScore - a.matchScore;
        case 'price':
          return a.price - b.price;
        case 'rating':
          return b.rating - a.rating;
        case 'distance':
          return a.distance - b.distance;
        default:
          return 0;
      }
    });
  };

  const sortedProviders = sortProviders(providers, sortBy);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <TrendingUp size={40} color="#FF7A00" />
        <Text style={styles.loadingText}>Recherche des meilleurs prestataires...</Text>
        <Text style={styles.loadingSubtext}>Analyse en cours avec IA avancée</Text>
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
              onPress={() => setSortBy(option.key as any)}
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

      <ScrollView style={styles.providersList} showsVerticalScrollIndicator={false}>
        {sortedProviders.map((provider) => (
          <TouchableOpacity
            key={provider.id}
            style={styles.providerCard}
            onPress={() => onProviderSelect(provider)}
          >
            <View style={styles.providerHeader}>
              <View style={styles.providerInfo}>
                <Text style={styles.providerName}>{provider.name}</Text>
                <View style={styles.matchScore}>
                  <Award size={14} color="#FFD700" />
                  <Text style={styles.matchScoreText}>{provider.matchScore}% match</Text>
                </View>
              </View>
              <View style={styles.providerMeta}>
                <Text style={styles.providerPrice}>{provider.price.toLocaleString()} FCFA</Text>
                <View style={[
                  styles.availabilityDot,
                  { backgroundColor: getAvailabilityColor(provider.availability) }
                ]} />
              </View>
            </View>

            <View style={styles.providerStats}>
              <View style={styles.statItem}>
                <Star size={12} color="#FFD700" fill="#FFD700" />
                <Text style={styles.statText}>{provider.rating}</Text>
                <Text style={styles.statSubtext}>({provider.reviews})</Text>
              </View>
              <View style={styles.statItem}>
                <MapPin size={12} color="#666" />
                <Text style={styles.statText}>{provider.distance} km</Text>
              </View>
              <View style={styles.statItem}>
                <Clock size={12} color="#666" />
                <Text style={styles.statText}>{provider.responseTime} min</Text>
              </View>
              <View style={styles.statItem}>
                <Shield size={12} color="#4CAF50" />
                <Text style={styles.statText}>{provider.trustScore}%</Text>
              </View>
            </View>

            <View style={styles.skillsContainer}>
              {provider.skills.slice(0, 3).map((skill, index) => (
                <View key={index} style={styles.skillTag}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
              {provider.skills.length > 3 && (
                <Text style={styles.moreSkills}>+{provider.skills.length - 3}</Text>
              )}
            </View>

            <View style={styles.languagesContainer}>
              <Text style={styles.languagesLabel}>Langues:</Text>
              {provider.languages.map((language, index) => (
                <Text key={index} style={styles.languageText}>
                  {language}{index < provider.languages.length - 1 ? ', ' : ''}
                </Text>
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

function getAvailabilityColor(availability: string): string {
  switch (availability) {
    case 'available': return '#4CAF50';
    case 'busy': return '#FF9800';
    case 'offline': return '#FF5722';
    default: return '#666';
  }
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
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingTop: 60,
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
  providerName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 4,
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
  skillsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  skillTag: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  skillText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  moreSkills: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  languagesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
});