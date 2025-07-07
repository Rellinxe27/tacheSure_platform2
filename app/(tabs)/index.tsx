import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Shield, Star, MapPin, Clock, TriangleAlert as AlertTriangle, TrendingUp, Award, Zap } from 'lucide-react-native';
import TrustBadge from '@/components/TrustBadge';
import SafetyButton from '@/components/SafetyButton';

export default function HomeScreen() {
  const router = useRouter();

  const categories = [
    { id: 1, name: 'Nettoyage', icon: '🧹', color: '#4CAF50', tasks: 45, trending: true },
    { id: 2, name: 'Réparation', icon: '🔧', color: '#FF9800', tasks: 67, trending: false },
    { id: 3, name: 'Livraison', icon: '🚚', color: '#2196F3', tasks: 23, trending: true },
    { id: 4, name: 'Tutorat', icon: '📚', color: '#9C27B0', tasks: 34, trending: false },
    { id: 5, name: 'Jardinage', icon: '🌱', color: '#4CAF50', tasks: 19, trending: false },
    { id: 6, name: 'Cuisine', icon: '👨‍🍳', color: '#FF5722', tasks: 28, trending: true },
  ];

  const featuredProviders = [
    {
      id: 1,
      name: 'Kouadio Jean',
      service: 'Plomberie',
      rating: 4.8,
      reviews: 45,
      location: 'Cocody',
      price: '15,000 FCFA',
      verified: true,
      trustScore: 92,
      verificationLevel: 'enhanced',
      responseTime: '15 min',
      completedTasks: 156,
      avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      specialties: ['Urgences', 'Installation'],
      available: true,
      featured: true
    },
    {
      id: 2,
      name: 'Aminata Traoré',
      service: 'Nettoyage',
      rating: 4.9,
      reviews: 67,
      location: 'Plateau',
      price: '12,000 FCFA',
      verified: true,
      trustScore: 95,
      verificationLevel: 'community',
      responseTime: '8 min',
      completedTasks: 203,
      avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      specialties: ['Résidentiel', 'Commercial'],
      available: true,
      featured: true
    },
  ];

  const urgentTasks = [
    {
      id: 1,
      title: 'Réparation de fuite urgente',
      location: 'Cocody',
      budget: '25,000 FCFA',
      timePosted: '5 min',
      applicants: 3,
      priority: 'high'
    },
    {
      id: 2,
      title: 'Livraison express documents',
      location: 'Plateau',
      budget: '8,000 FCFA',
      timePosted: '12 min',
      applicants: 7,
      priority: 'medium'
    }
  ];

  const platformStats = {
    totalTasks: 1247,
    activePlatform: '24/7',
    safetyScore: 98.5,
    averageResponse: '12 min',
    verifiedProviders: 89,
    successRate: 96.8
  };

  const quickActions = [
    { id: 'emergency', title: 'Centre d\'urgence', icon: AlertTriangle, color: '#FF5722', route: '/emergency-center' },
    { id: 'advanced_search', title: 'Recherche avancée', icon: Search, color: '#2196F3', route: '/advanced-search' },
    { id: 'post_urgent', title: 'Tâche urgente', icon: Zap, color: '#FF9800', route: '/post-task' }
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#FF7A00', '#FF9500']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Bonjour!</Text>
              <Text style={styles.location}>📍 Abidjan, Côte d'Ivoire</Text>
            </View>
            <SafetyButton />
          </View>

          <TouchableOpacity
            style={styles.searchContainer}
            onPress={() => router.push('/(tabs)/search')}
          >
            <Search size={20} color="#666" />
            <Text style={styles.searchPlaceholder}>Rechercher un service...</Text>
          </TouchableOpacity>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{platformStats.safetyScore}%</Text>
              <Text style={styles.statLabel}>Sécurité</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{platformStats.totalTasks}</Text>
              <Text style={styles.statLabel}>Tâches actives</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{platformStats.averageResponse}</Text>
              <Text style={styles.statLabel}>Réponse moy.</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{platformStats.successRate}%</Text>
              <Text style={styles.statLabel}>Succès</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionCard}
                onPress={() => router.push(action.route as any)}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
                  <action.icon size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.quickActionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Catégories populaires</Text>
            <TouchableOpacity>
              <TrendingUp size={20} color="#FF7A00" />
            </TouchableOpacity>
          </View>
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <TouchableOpacity key={category.id} style={styles.categoryCard}>
                <View style={styles.categoryHeader}>
                  <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                    <Text style={styles.categoryEmoji}>{category.icon}</Text>
                  </View>
                  {category.trending && (
                    <View style={styles.trendingBadge}>
                      <TrendingUp size={10} color="#FFFFFF" />
                    </View>
                  )}
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryTasks}>{category.tasks} tâches</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tâches urgentes</Text>
            <TouchableOpacity>
              <AlertTriangle size={20} color="#FF5722" />
            </TouchableOpacity>
          </View>
          {urgentTasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={styles.urgentTaskCard}
              onPress={() => router.push(`/task-status?taskId=${task.id}`)}
            >
              <View style={styles.urgentHeader}>
                <Text style={styles.urgentTitle}>{task.title}</Text>
                <View style={[
                  styles.urgentBadge,
                  { backgroundColor: task.priority === 'high' ? '#FF5722' : '#FF9800' }
                ]}>
                  <AlertTriangle size={12} color="#FFFFFF" />
                  <Text style={styles.urgentText}>
                    {task.priority === 'high' ? 'URGENT' : 'PRIORITÉ'}
                  </Text>
                </View>
              </View>
              <View style={styles.urgentMeta}>
                <View style={styles.urgentMetaItem}>
                  <MapPin size={14} color="#666" />
                  <Text style={styles.urgentMetaText}>{task.location}</Text>
                </View>
                <View style={styles.urgentMetaItem}>
                  <Clock size={14} color="#666" />
                  <Text style={styles.urgentMetaText}>Il y a {task.timePosted}</Text>
                </View>
              </View>
              <View style={styles.urgentFooter}>
                <Text style={styles.urgentBudget}>{task.budget}</Text>
                <Text style={styles.urgentApplicants}>{task.applicants} candidatures</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Prestataires recommandés</Text>
            <TouchableOpacity>
              <Award size={20} color="#FFD700" />
            </TouchableOpacity>
          </View>
          {featuredProviders.map((provider) => (
            <TouchableOpacity
              key={provider.id}
              style={styles.providerCard}
              onPress={() => router.push('/provider-profile')}
            >
              <View style={styles.providerHeader}>
                <Image source={{ uri: provider.avatar }} style={styles.providerAvatar} />
                <View style={styles.providerInfo}>
                  <View style={styles.providerNameRow}>
                    <Text style={styles.providerNameText}>{provider.name}</Text>
                    <TrustBadge
                      trustScore={provider.trustScore}
                      verificationLevel={provider.verificationLevel as any}
                      isVerified={provider.verified}
                      size="small"
                    />
                  </View>
                  <Text style={styles.providerService}>{provider.service}</Text>
                  <View style={styles.providerMeta}>
                    <View style={styles.rating}>
                      <Star size={12} color="#FFD700" fill="#FFD700" />
                      <Text style={styles.ratingText}>{provider.rating}</Text>
                      <Text style={styles.reviewsText}>({provider.reviews})</Text>
                    </View>
                    <View style={styles.location}>
                      <MapPin size={12} color="#666" />
                      <Text style={styles.locationText}>{provider.location}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.providerPricing}>
                  <Text style={styles.providerPrice}>{provider.price}</Text>
                  <View style={styles.availabilityIndicator}>
                    <View style={[
                      styles.availabilityDot,
                      { backgroundColor: provider.available ? '#4CAF50' : '#FF5722' }
                    ]} />
                    <Text style={styles.availabilityText}>
                      {provider.available ? 'Disponible' : 'Occupé'}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.providerDetails}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Temps de réponse:</Text>
                  <Text style={styles.detailValue}>{provider.responseTime}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Tâches complétées:</Text>
                  <Text style={styles.detailValue}>{provider.completedTasks}</Text>
                </View>
              </View>

              <View style={styles.specialtiesContainer}>
                {provider.specialties.map((specialty, index) => (
                  <View key={index} style={styles.specialtyTag}>
                    <Text style={styles.specialtyText}>{specialty}</Text>
                  </View>
                ))}
                {provider.featured && (
                  <View style={styles.featuredBadge}>
                    <Award size={10} color="#FFD700" />
                    <Text style={styles.featuredText}>Recommandé</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.safetySection}>
          <View style={styles.safetyHeader}>
            <Shield size={24} color="#4CAF50" />
            <Text style={styles.safetyTitle}>Sécurité TâcheSûre</Text>
          </View>
          <Text style={styles.safetyText}>
            Tous nos prestataires sont vérifiés et assurés. Votre sécurité est notre priorité absolue avec un système de monitoring 24/7.
          </Text>
          <View style={styles.safetyFeatures}>
            <View style={styles.safetyFeature}>
              <Text style={styles.safetyFeatureIcon}>🔒</Text>
              <Text style={styles.safetyFeatureText}>Paiements sécurisés</Text>
            </View>
            <View style={styles.safetyFeature}>
              <Text style={styles.safetyFeatureIcon}>📍</Text>
              <Text style={styles.safetyFeatureText}>Suivi GPS en temps réel</Text>
            </View>
            <View style={styles.safetyFeature}>
              <Text style={styles.safetyFeatureIcon}>🆘</Text>
              <Text style={styles.safetyFeatureText}>Bouton d'urgence</Text>
            </View>
            <View style={styles.safetyFeature}>
              <Text style={styles.safetyFeatureIcon}>🛡️</Text>
              <Text style={styles.safetyFeatureText}>Vérification d'identité</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.emergencyButton}
            onPress={() => router.push('/emergency-center')}
          >
            <AlertTriangle size={16} color="#FFFFFF" />
            <Text style={styles.emergencyButtonText}>Centre d'urgence</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  location: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 9,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  quickActionsSection: {
    marginBottom: 30,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    flex: 1,
    alignItems: 'center',
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
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#333',
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryHeader: {
    position: 'relative',
    marginBottom: 8,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryEmoji: {
    fontSize: 20,
  },
  trendingBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF5722',
    borderRadius: 8,
    padding: 2,
  },
  categoryName: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  categoryTasks: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
  },
  urgentTaskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF5722',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  urgentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  urgentTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  urgentText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  urgentMeta: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  urgentMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  urgentMetaText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginLeft: 4,
  },
  urgentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  urgentBudget: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#FF7A00',
  },
  urgentApplicants: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  providerCard: {
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
  providerHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  providerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  providerInfo: {
    flex: 1,
  },
  providerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  providerNameText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginRight: 8,
  },
  providerService: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 8,
  },
  providerMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  location: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginLeft: 4,
  },
  providerPricing: {
    alignItems: 'flex-end',
  },
  providerPrice: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FF7A00',
    marginBottom: 4,
  },
  availabilityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  availabilityText: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  providerDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  detailValue: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginTop: 2,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  specialtyTag: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  specialtyText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  featuredText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginLeft: 4,
  },
  safetySection: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  safetyTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginLeft: 8,
  },
  safetyText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  safetyFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  safetyFeature: {
    alignItems: 'center',
    width: '48%',
    marginBottom: 8,
  },
  safetyFeatureIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  safetyFeatureText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#333',
    textAlign: 'center',
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF5722',
    paddingVertical: 12,
    borderRadius: 8,
  },
  emergencyButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});