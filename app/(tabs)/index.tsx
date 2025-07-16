// app/(tabs)/index.tsx - Enhanced with additional features and sections
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Shield, Star, MapPin, Clock, TriangleAlert as AlertTriangle, TrendingUp, Award, Zap, Briefcase, Calendar, DollarSign, CheckCircle, MessageCircle, Bell, Eye, Heart, Users, Target, Gift, Sparkles, Timer, PhoneCall } from 'lucide-react-native';
import TrustBadge from '@/components/TrustBadge';
import SafetyButton from '@/components/SafetyButton';
import { useAuth } from '@/app/contexts/AuthContext';
import RoleBasedAccess from '@/components/RoleBasedAccess';
import { useTasks } from '@/hooks/useTasks';
import { useServices } from '@/hooks/useServices';
import { useCategories } from '@/hooks/useCategories';
import { useNotifications } from '@/hooks/useNotifications';
import { useVerification } from '@/hooks/useVerification';
import { useEffect, useState } from 'react';

export default function HomeScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const { categories } = useCategories();
  const { unreadCount } = useNotifications();
  const { stats: verificationStats, getRequiredSteps, loading: verificationLoading } = useVerification();
  const [refreshing, setRefreshing] = useState(false);
  const [recentTasks, setRecentTasks] = useState([]);
  const [featuredProviders, setFeaturedProviders] = useState([]);
  const [platformStats, setPlatformStats] = useState({
    totalTasks: 1247,
    activePlatform: '24/7',
    safetyScore: 98.5,
    averageResponse: '12 min',
    verifiedProviders: 89,
    successRate: 96.8,
    totalUsers: 12450,
    completedTasksToday: 84
  });

  // Fetch recent urgent tasks
  const { tasks: allUrgentTasks, loading: tasksLoading } = useTasks({
    urgency: 'high',
    limit: 10
  });

  // Filter to show active urgent tasks (not completed/cancelled)
  const urgentTasks = allUrgentTasks.filter(task =>
    ['posted', 'applications', 'selected'].includes(task.status)
  ).slice(0, 5);

  // Fetch featured services/providers
  const { services: featuredServices, loading: servicesLoading } = useServices();

  const fetchPlatformStats = async () => {
    setPlatformStats({
      totalTasks: 1247 + Math.floor(Math.random() * 100),
      activePlatform: '24/7',
      safetyScore: 98.5,
      averageResponse: '12 min',
      verifiedProviders: 89,
      successRate: 96.8,
      totalUsers: 12450,
      completedTasksToday: 84 + Math.floor(Math.random() * 20)
    });
  };

  useEffect(() => {
    fetchPlatformStats();
  }, []);


const onRefresh = async () => {
  setRefreshing(true);
  await fetchPlatformStats();
  setTimeout(() => setRefreshing(false), 1000);
};

const clientQuickActions = [
  { id: 'emergency', title: 'Centre d\'urgence', icon: AlertTriangle, color: '#FF5722', route: '/emergency-center' },
  { id: 'advanced_search', title: 'Recherche avancée', icon: Search, color: '#2196F3', route: '/advanced-search' },
  { id: 'post_urgent', title: 'Tâche urgente', icon: Zap, color: '#FF9800', route: '/post-task' },
  { id: 'favorites', title: 'Mes favoris', icon: Heart, color: '#E91E63', route: '/favorites' }
];

const providerQuickActions = [
  { id: 'task_requests', title: 'Nouvelles demandes', icon: Briefcase, color: '#FF7A00', route: '/task-requests' },
  { id: 'calendar', title: 'Mon planning', icon: Calendar, color: '#4CAF50', route: '/availability-calendar' },
  { id: 'earnings', title: 'Mes revenus', icon: DollarSign, color: '#2196F3', route: '/earnings' },
  { id: 'messages', title: 'Messages', icon: MessageCircle, color: '#9C27B0', route: '/messages' }
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bonjour';
  if (hour < 18) return 'Bon après-midi';
  return 'Bonsoir';
};

const getVerificationStatusMessage = () => {
  if (verificationLoading) return null;

  const requiredSteps = getRequiredSteps();
  if (requiredSteps.length > 0) {
    return {
      type: 'warning',
      title: 'Vérification incomplète',
      message: `${requiredSteps.length} étape(s) requise(s) pour être pleinement vérifié`,
      action: () => router.push('/verification-status')
    };
  }

  if (verificationStats.trustScore >= 80) {
    return {
      type: 'success',
      title: 'Profil vérifié',
      message: `Score de confiance: ${verificationStats.trustScore}%`,
      action: () => router.push('/verification-status')
    };
  }

  return {
    type: 'info',
    title: 'Améliorez votre profil',
    message: 'Ajoutez plus de vérifications pour augmenter votre score',
    action: () => router.push('/verification-status')
  };
};

const mockTrendingServices = [
  { name: 'Plomberie d\'urgence', requests: 45, icon: '🔧' },
  { name: 'Ménage à domicile', requests: 38, icon: '🧹' },
  { name: 'Jardinage', requests: 29, icon: '🌱' },
  { name: 'Réparation électrique', requests: 24, icon: '⚡' }
];

const mockRecentActivity = [
  { action: 'Nouvelle tâche de plomberie postée', time: '5 min', location: 'Cocody' },
  { action: 'Prestataire vérifié rejoint', time: '12 min', location: 'Plateau' },
  { action: 'Tâche de ménage complétée', time: '18 min', location: 'Marcory' },
  { action: '3 nouvelles candidatures', time: '25 min', location: 'Yopougon' }
];

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
  const colors = ['#4CAF50', '#FF9800', '#2196F3', '#9C27B0', '#FF5722', '#00BCD4'];
  return colors[index % colors.length];
};

const renderUrgentTask = (task: any) => (
  <TouchableOpacity
    key={task.id}
    style={styles.urgentTaskCard}
    onPress={() => router.push(`/task-details?taskId=${task.id}`)}
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

const verificationMessage = getVerificationStatusMessage();

return (
  <ScrollView
    style={styles.container}
    showsVerticalScrollIndicator={false}
    refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
    }
  >
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
              <TouchableOpacity style={styles.notificationBadge} onPress={() => router.push('/notifications')}>
                <Bell size={12} color="#FFFFFF" />
                <Text style={styles.notificationText}>
                  {unreadCount} nouvelle{unreadCount > 1 ? 's' : ''}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <SafetyButton />
        </View>

        {/* Verification Status Alert */}
        {verificationMessage && (
          <TouchableOpacity
            style={[
              styles.verificationAlert,
              { backgroundColor: verificationMessage.type === 'success' ? 'rgba(76, 175, 80, 0.2)' :
                  verificationMessage.type === 'warning' ? 'rgba(255, 152, 0, 0.2)' : 'rgba(33, 150, 243, 0.2)' }
            ]}
            onPress={verificationMessage.action}
          >
            <View style={styles.verificationContent}>
              {verificationMessage.type === 'success' && <CheckCircle size={16} color="#4CAF50" />}
              {verificationMessage.type === 'warning' && <AlertTriangle size={16} color="#FF9800" />}
              {verificationMessage.type === 'info' && <Shield size={16} color="#2196F3" />}
              <View style={styles.verificationTextContainer}>
                <Text style={styles.verificationTitle}>{verificationMessage.title}</Text>
                <Text style={styles.verificationMessage}>{verificationMessage.message}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

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
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{verificationStats.trustScore}%</Text>
              <Text style={styles.statLabel}>Confiance</Text>
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
      {/* Live Activity Banner */}
      <View style={styles.liveActivityBanner}>
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>EN DIRECT</Text>
        </View>
        <Text style={styles.liveActivity}>
          {platformStats.completedTasksToday} tâches complétées aujourd'hui • {platformStats.totalUsers} utilisateurs actifs
        </Text>
      </View>

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

      {/* Trending Services - Only for clients */}
      <RoleBasedAccess allowedRoles={['client']}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔥 Services tendance</Text>
            <TouchableOpacity onPress={() => router.push('/trending')}>
              <TrendingUp size={20} color="#FF7A00" />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {mockTrendingServices.map((service, index) => (
              <TouchableOpacity key={index} style={styles.trendingServiceCard}>
                <Text style={styles.trendingIcon}>{service.icon}</Text>
                <Text style={styles.trendingName}>{service.name}</Text>
                <Text style={styles.trendingRequests}>{service.requests} demandes</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </RoleBasedAccess>

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

      {/* Recent Activity Feed */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Activité récente</Text>
          <TouchableOpacity onPress={() => router.push('/activity')}>
            <Eye size={20} color="#666" />
          </TouchableOpacity>
        </View>
        <View style={styles.activityFeed}>
          {mockRecentActivity.map((activity, index) => (
            <View key={index} style={styles.activityItem}>
              <View style={styles.activityDot} />
              <View style={styles.activityContent}>
                <Text style={styles.activityAction}>{activity.action}</Text>
                <View style={styles.activityMeta}>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                  <Text style={styles.activityLocation}>• {activity.location}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Provider-specific sections */}
      <RoleBasedAccess allowedRoles={['provider']}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mes performances</Text>
            <TouchableOpacity onPress={() => router.push('/provider-dashboard')}>
              <TrendingUp size={20} color="#4CAF50" />
            </TouchableOpacity>
          </View>
          <View style={styles.performanceCard}>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>Score de confiance</Text>
              <Text style={styles.performanceValue}>{verificationStats.trustScore}%</Text>
            </View>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>Niveau de vérification</Text>
              <Text style={styles.performanceValue}>Niveau {verificationStats.currentLevel}</Text>
            </View>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>Étapes complétées</Text>
              <Text style={styles.performanceValue}>{verificationStats.completedSteps}/{verificationStats.totalSteps}</Text>
            </View>
          </View>
        </View>

        {/* Growth Tips for Providers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>💡 Conseils de croissance</Text>
            <TouchableOpacity onPress={() => router.push('/growth-tips')}>
              <Target size={20} color="#FF7A00" />
            </TouchableOpacity>
          </View>
          <View style={styles.tipsCard}>
            <View style={styles.tipItem}>
              <Sparkles size={16} color="#FFD700" />
              <Text style={styles.tipText}>Complétez votre vérification pour +30% de demandes</Text>
            </View>
            <View style={styles.tipItem}>
              <Timer size={16} color="#4CAF50" />
              <Text style={styles.tipText}>Répondez sous 15min pour améliorer votre classement</Text>
            </View>
            <View style={styles.tipItem}>
              <Star size={16} color="#FF9800" />
              <Text style={styles.tipText}>Maintenez une note 4.5+ pour les recommandations</Text>
            </View>
          </View>
        </View>
      </RoleBasedAccess>

      {/* Rewards & Loyalty Program */}
      <RoleBasedAccess allowedRoles={['client']}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎁 Programme de fidélité</Text>
            <TouchableOpacity onPress={() => router.push('/rewards')}>
              <Gift size={20} color="#9C27B0" />
            </TouchableOpacity>
          </View>
          <View style={styles.rewardsCard}>
            <Text style={styles.rewardsTitle}>Points TâcheSûre</Text>
            <Text style={styles.rewardsBalance}>1,247 points</Text>
            <Text style={styles.rewardsSubtext}>
              Gagnez des points à chaque tâche et débloquez des réductions exclusives
            </Text>
            <TouchableOpacity style={styles.rewardsButton} onPress={() => router.push('/rewards')}>
              <Text style={styles.rewardsButtonText}>Voir mes récompenses</Text>
            </TouchableOpacity>
          </View>
        </View>
      </RoleBasedAccess>

      {/* Customer Support Quick Access */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🛟 Support client</Text>
          <TouchableOpacity onPress={() => router.push('/support')}>
            <PhoneCall size={20} color="#2196F3" />
          </TouchableOpacity>
        </View>
        <View style={styles.supportOptions}>
          <TouchableOpacity style={styles.supportOption} onPress={() => router.push('/chat-support')}>
            <MessageCircle size={24} color="#4CAF50" />
            <Text style={styles.supportOptionText}>Chat en direct</Text>
            <Text style={styles.supportOptionSubtext}>Réponse en 2min</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.supportOption} onPress={() => router.push('/faq')}>
            <Users size={24} color="#FF9800" />
            <Text style={styles.supportOptionText}>FAQ</Text>
            <Text style={styles.supportOptionSubtext}>Questions fréquentes</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Safety Section */}
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
    flexDirection: 'row',
    alignItems: 'center',
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
    marginLeft: 4,
  },
  verificationAlert: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  verificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verificationTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  verificationTitle: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  verificationMessage: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 2,
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
  liveActivityBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF5722',
    marginRight: 6,
  },
  liveText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#FF5722',
  },
  liveActivity: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    flex: 1,
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
  trendingServiceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trendingIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  trendingName: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  trendingRequests: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#FF7A00',
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
  activityFeed: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF7A00',
    marginTop: 6,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333',
    marginBottom: 4,
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  activityLocation: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  performanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  performanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  performanceLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  performanceValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  tipsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginLeft: 12,
    flex: 1,
  },
  rewardsCard: {
    backgroundColor: 'linear-gradient(135deg, #9C27B0, #673AB7)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  rewardsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  rewardsBalance: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  rewardsSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 16,
  },
  rewardsButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  rewardsButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  supportOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  supportOption: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  supportOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  supportOptionSubtext: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
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