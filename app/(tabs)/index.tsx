// app/(tabs)/index.tsx - Updated with role-based logic
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Shield, Star, MapPin, Clock, TriangleAlert as AlertTriangle, TrendingUp, Award, Zap, Briefcase, Calendar, DollarSign } from 'lucide-react-native';
import TrustBadge from '@/components/TrustBadge';
import SafetyButton from '@/components/SafetyButton';
import { useAuth } from '@/app/contexts/AuthContext';
import RoleBasedAccess from '@/components/RoleBasedAccess';
import { useTasks } from '@/hooks/useTasks';
import { useServices } from '@/hooks/useServices';
import { useCategories } from '@/hooks/useCategories';
import { useNotifications } from '@/hooks/useNotifications';
import { useEffect, useState } from 'react';

export default function HomeScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const { categories } = useCategories();
  const { unreadCount } = useNotifications();
  const [recentTasks, setRecentTasks] = useState([]);
  const [featuredProviders, setFeaturedProviders] = useState([]);
  const [platformStats, setPlatformStats] = useState({
    totalTasks: 0,
    activePlatform: '24/7',
    safetyScore: 98.5,
    averageResponse: '12 min',
    verifiedProviders: 0,
    successRate: 96.8
  });

  // Fetch recent urgent tasks
  const { tasks: urgentTasks, loading: tasksLoading } = useTasks({
    status: 'posted',
    urgency: 'high',
    limit: 5
  });

  // Fetch featured services/providers
  const { services: featuredServices, loading: servicesLoading } = useServices();

  useEffect(() => {
    const fetchPlatformStats = async () => {
      setPlatformStats({
        totalTasks: 1247,
        activePlatform: '24/7',
        safetyScore: 98.5,
        averageResponse: '12 min',
        verifiedProviders: 89,
        successRate: 96.8
      });
    };

    fetchPlatformStats();
  }, []);

  const clientQuickActions = [
    { id: 'emergency', title: 'Centre d\'urgence', icon: AlertTriangle, color: '#FF5722', route: '/emergency-center' },
    { id: 'advanced_search', title: 'Recherche avancée', icon: Search, color: '#2196F3', route: '/advanced-search' },
    { id: 'post_urgent', title: 'Tâche urgente', icon: Zap, color: '#FF9800', route: '/post-task' }
  ];

  const providerQuickActions = [
    { id: 'task_requests', title: 'Nouvelles demandes', icon: Briefcase, color: '#FF7A00', route: '/task-requests' },
    { id: 'calendar', title: 'Mon planning', icon: Calendar, color: '#4CAF50', route: '/availability-calendar' },
    { id: 'earnings', title: 'Mes revenus', icon: DollarSign, color: '#2196F3', route: '/earnings' }
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const renderCategoryCard = (category: any, index: number) => (
    <TouchableOpacity
      key={category.id}
      style={styles.categoryCard}
      onPress={() => router.push(`/search?category=${category.id}`)}
    >
      <View style={styles.categoryHeader}>
        <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor(index) }]}>
          <Text style={styles.categoryEmoji}>{category.icon || '🔧'}</Text>
        </View>
      </View>
      <Text style={styles.categoryName}>{category.name_fr}</Text>
      <Text style={styles.categoryTasks}>Active</Text>
    </TouchableOpacity>
  );

  const getCategoryColor = (index: number) => {
    const colors = ['#4CAF50', '#FF9800', '#2196F3', '#9C27B0', '#4CAF50', '#FF5722'];
    return colors[index % colors.length];
  };

  const renderUrgentTask = (task: any) => (
    <TouchableOpacity
      key={task.id}
      style={styles.urgentTaskCard}
      onPress={() => router.push(`/task/${task.id}`)}
    >
      <View style={styles.urgentHeader}>
        <Text style={styles.urgentTitle}>{task.title}</Text>
        <View style={[
          styles.urgentBadge,
          { backgroundColor: task.urgency === 'emergency' ? '#FF5722' : '#FF9800' }
        ]}>
          <AlertTriangle size={12} color="#FFFFFF" />
          <Text style={styles.urgentText}>
            {task.urgency === 'emergency' ? 'URGENCE' : 'PRIORITÉ'}
          </Text>
        </View>
      </View>
      <View style={styles.urgentMeta}>
        <View style={styles.urgentMetaItem}>
          <MapPin size={14} color="#666" />
          <Text style={styles.urgentMetaText}>
            {task.address?.city || 'Abidjan'}
          </Text>
        </View>
        <View style={styles.urgentMetaItem}>
          <Clock size={14} color="#666" />
          <Text style={styles.urgentMetaText}>
            Il y a {getTimeAgo(task.created_at)}
          </Text>
        </View>
      </View>
      <View style={styles.urgentFooter}>
        <Text style={styles.urgentBudget}>
          {task.budget_min && task.budget_max
            ? `${task.budget_min.toLocaleString()} - ${task.budget_max.toLocaleString()} FCFA`
            : 'Budget à négocier'
          }
        </Text>
        <Text style={styles.urgentApplicants}>
          {task.applicant_count || 0} candidatures
        </Text>
      </View>
    </TouchableOpacity>
  );

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) return `${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} h`;
    return `${Math.floor(diffInMinutes / 1440)} j`;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#FF7A00', '#FF9500']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>
                {getGreeting()}{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}!
              </Text>
              <Text style={styles.location}>📍 Abidjan, Côte d'Ivoire</Text>
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationText}>
                    {unreadCount} nouvelle{unreadCount > 1 ? 's' : ''} notification{unreadCount > 1 ? 's' : ''}
                  </Text>
                </View>
              )}
            </View>
            <SafetyButton />
          </View>

          {/* Search bar - Only for clients */}
          <RoleBasedAccess allowedRoles={['client']}>
            <TouchableOpacity
              style={styles.searchContainer}
              onPress={() => router.push('/(tabs)/search')}
            >
              <Search size={20} color="#666" />
              <Text style={styles.searchPlaceholder}>Rechercher un service...</Text>
            </TouchableOpacity>
          </RoleBasedAccess>

          {/* Provider stats */}
          <RoleBasedAccess allowedRoles={['provider']}>
            <View style={styles.providerStatsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>12</Text>
                <Text style={styles.statLabel}>Demandes</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>8</Text>
                <Text style={styles.statLabel}>Actives</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>4.8</Text>
                <Text style={styles.statLabel}>Note</Text>
              </View>
            </View>
          </RoleBasedAccess>

          {/* Platform stats - Only for clients */}
          <RoleBasedAccess allowedRoles={['client']}>
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
          </RoleBasedAccess>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.quickActionsGrid}>
            <RoleBasedAccess allowedRoles={['client']}>
              <>
                {clientQuickActions.map((action) => (
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
              </>
            </RoleBasedAccess>

            <RoleBasedAccess allowedRoles={['provider']}>
              <>
                {providerQuickActions.map((action) => (
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
              </>
            </RoleBasedAccess>
          </View>
        </View>

        {/* Categories - Only for clients */}
        <RoleBasedAccess allowedRoles={['client']}>
          {categories.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Catégories populaires</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
                  <TrendingUp size={20} color="#FF7A00" />
                </TouchableOpacity>
              </View>
              <View style={styles.categoriesGrid}>
                {categories.slice(0, 6).map((category, index) => renderCategoryCard(category, index))}
              </View>
            </View>
          )}
        </RoleBasedAccess>

        {/* Urgent tasks */}
        {urgentTasks.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                <RoleBasedAccess allowedRoles={['client']} fallback="Opportunités urgentes">
                  Tâches urgentes
                </RoleBasedAccess>
              </Text>
              <TouchableOpacity onPress={() => router.push('/tasks?urgency=high')}>
                <AlertTriangle size={20} color="#FF5722" />
              </TouchableOpacity>
            </View>
            {urgentTasks.slice(0, 3).map(renderUrgentTask)}
          </View>
        )}

        {/* Client-specific sections */}
        <RoleBasedAccess allowedRoles={['client']}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Prestataires recommandés</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
                <Award size={20} color="#FFD700" />
              </TouchableOpacity>
            </View>
            <Text style={styles.placeholderText}>
              Prestataires recommandés basés sur vos préférences - En cours de développement
            </Text>
          </View>
        </RoleBasedAccess>

        {/* Provider-specific sections */}
        <RoleBasedAccess allowedRoles={['provider']}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Mes performances</Text>
              <TouchableOpacity onPress={() => router.push('/provider-dashboard')}>
                <TrendingUp size={20} color="#4CAF50" />
              </TouchableOpacity>
            </View>
            <Text style={styles.placeholderText}>
              Statistiques détaillées disponibles dans le tableau de bord
            </Text>
          </View>
        </RoleBasedAccess>

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
    alignItems: 'flex-start',
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
  notificationBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 8,
  },
  notificationText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
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
  providerStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 20,
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
  placeholderText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
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