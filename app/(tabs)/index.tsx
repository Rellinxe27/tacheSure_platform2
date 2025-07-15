// app/(tabs)/index.tsx - Enhanced with comprehensive role-based sections
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Shield, Star, MapPin, Clock, TriangleAlert as AlertTriangle, TrendingUp, Award, Zap, Briefcase, Calendar, DollarSign, Users, CheckCircle, Eye, Heart, MessageCircle, Bell, Target, BarChart3, Wallet, Settings } from 'lucide-react-native';
import TrustBadge from '@/components/TrustBadge';
import SafetyButton from '@/components/SafetyButton';
import { useAuth } from '@/app/contexts/AuthContext';
import RoleBasedAccess from '@/components/RoleBasedAccess';
import { useTasks } from '@/hooks/useTasks';
import { useServices } from '@/hooks/useServices';
import { useCategories } from '@/hooks/useCategories';
import { useNotifications } from '@/hooks/useNotifications';
import React, { useEffect, useState } from 'react';

export default function HomeScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const { categories } = useCategories();
  const { unreadCount } = useNotifications();
  const [recentTasks, setRecentTasks] = useState([]);
  const [featuredProviders, setFeaturedProviders] = useState([]);
  const [platformStats, setPlatformStats] = useState({
    totalTasks: 1247,
    activePlatform: '24/7',
    safetyScore: 98.5,
    averageResponse: '12 min',
    verifiedProviders: 89,
    successRate: 96.8
  });

  // Client-specific data
  const [clientStats, setClientStats] = useState({
    totalTasksPosted: 8,
    completedTasks: 6,
    averageRating: 4.7,
    totalSpent: 45000,
    activeTasks: 2,
    favoriteProviders: 3
  });

  // Provider-specific data
  const [providerStats, setProviderStats] = useState({
    totalEarnings: 125000,
    thisMonthEarnings: 28000,
    completedJobs: 34,
    averageRating: 4.8,
    activeRequests: 12,
    responseRate: 95,
    upcomingTasks: 3,
    repeatClients: 18
  });

  // Fetch recent urgent tasks
  const { tasks: allUrgentTasks, loading: tasksLoading } = useTasks({
    urgency: 'high',
    limit: 10
  });

  // Filter to show active urgent tasks
  const urgentTasks = allUrgentTasks.filter(task =>
    ['posted', 'applications', 'selected'].includes(task.status)
  ).slice(0, 5);

  // Fetch featured services/providers
  const { services: featuredServices, loading: servicesLoading } = useServices();

  useEffect(() => {
    const fetchData = async () => {
      // In real app, fetch actual user stats
      if (profile?.role === 'client') {
        // Fetch client-specific data
      } else if (profile?.role === 'provider') {
        // Fetch provider-specific data
      }
    };
    fetchData();
  }, [profile]);

  const clientQuickActions = [
    { id: 'emergency', title: 'Centre d\'urgence', icon: AlertTriangle, color: '#FF5722', route: '/emergency-center' },
    { id: 'post_task', title: 'Poster une tâche', icon: Zap, color: '#FF9800', route: '/post-task' },
    { id: 'my_tasks', title: 'Mes tâches', icon: Briefcase, color: '#2196F3', route: '/my-tasks' },
    { id: 'favorites', title: 'Favoris', icon: Heart, color: '#E91E63', route: '/favorites' }
  ];

  const providerQuickActions = [
    { id: 'task_requests', title: 'Nouvelles demandes', icon: Briefcase, color: '#FF7A00', route: '/task-requests' },
    { id: 'calendar', title: 'Planning', icon: Calendar, color: '#4CAF50', route: '/availability-calendar' },
    { id: 'earnings', title: 'Revenus', icon: DollarSign, color: '#2196F3', route: '/earnings' },
    { id: 'profile', title: 'Mon profil', icon: Users, color: '#9C27B0', route: '/provider-profile' }
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const renderStatsCard = (title: string, value: string, subtitle: string, icon: any, color: string) => (
    <View style={[styles.statsCard, { borderLeftColor: color }]}>
      <View style={styles.statsCardContent}>
        <View style={styles.statsTextContainer}>
          <Text style={styles.statsValue}>{value}</Text>
          <Text style={styles.statsTitle}>{title}</Text>
          <Text style={styles.statsSubtitle}>{subtitle}</Text>
        </View>
        <View style={[styles.statsIcon, { backgroundColor: color }]}>
          {React.createElement(icon, { size: 20, color: '#FFFFFF' })}
        </View>
      </View>
    </View>
  );

  const renderPerformanceMetric = (label: string, value: string, trend?: 'up' | 'down', trendValue?: string) => (
    <View style={styles.performanceMetric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <View style={styles.metricValueContainer}>
        <Text style={styles.metricValue}>{value}</Text>
        {trend && trendValue && (
          <View style={[styles.trendContainer, { backgroundColor: trend === 'up' ? '#E8F5E8' : '#FFE8E8' }]}>
            <TrendingUp size={12} color={trend === 'up' ? '#4CAF50' : '#FF5722'} />
            <Text style={[styles.trendText, { color: trend === 'up' ? '#4CAF50' : '#FF5722' }]}>
              {trendValue}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

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
                <TouchableOpacity
                  style={styles.notificationBadge}
                  onPress={() => router.push('/notifications')}
                >
                  <Bell size={12} color="#FFFFFF" />
                  <Text style={styles.notificationText}>
                    {unreadCount} notification{unreadCount > 1 ? 's' : ''}
                  </Text>
                </TouchableOpacity>
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

          {/* Provider stats header */}
          <RoleBasedAccess allowedRoles={['provider']}>
            <View style={styles.providerStatsRow}>
              <TouchableOpacity style={styles.statItem} onPress={() => router.push('/task-requests')}>
                <Text style={styles.statValue}>{providerStats.activeRequests}</Text>
                <Text style={styles.statLabel}>Demandes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.statItem} onPress={() => router.push('/my-tasks')}>
                <Text style={styles.statValue}>{providerStats.upcomingTasks}</Text>
                <Text style={styles.statLabel}>À venir</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.statItem} onPress={() => router.push('/earnings')}>
                <Text style={styles.statValue}>{providerStats.averageRating}</Text>
                <Text style={styles.statLabel}>Note</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.statItem} onPress={() => router.push('/earnings')}>
                <Text style={styles.statValue}>{(providerStats.thisMonthEarnings / 1000).toFixed(0)}k</Text>
                <Text style={styles.statLabel}>Ce mois</Text>
              </TouchableOpacity>
            </View>
          </RoleBasedAccess>

          {/* Client stats header */}
          <RoleBasedAccess allowedRoles={['client']}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{platformStats.safetyScore}%</Text>
                <Text style={styles.statLabel}>Sécurité</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{clientStats.activeTasks}</Text>
                <Text style={styles.statLabel}>Actives</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{platformStats.averageResponse}</Text>
                <Text style={styles.statLabel}>Réponse</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{clientStats.averageRating}</Text>
                <Text style={styles.statLabel}>Ma note</Text>
              </View>
            </View>
          </RoleBasedAccess>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Quick Actions */}
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

        {/* Client Performance Dashboard */}
        <RoleBasedAccess allowedRoles={['client']}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Mon activité</Text>
              <TouchableOpacity onPress={() => router.push('/client-dashboard')}>
                <BarChart3 size={20} color="#FF7A00" />
              </TouchableOpacity>
            </View>
            <View style={styles.statsGrid}>
              {renderStatsCard('Tâches postées', clientStats.totalTasksPosted.toString(), 'Total', Briefcase, '#2196F3')}
              {renderStatsCard('Terminées', clientStats.completedTasks.toString(), `${Math.round((clientStats.completedTasks / clientStats.totalTasksPosted) * 100)}% succès`, CheckCircle, '#4CAF50')}
              {renderStatsCard('Dépensé', `${(clientStats.totalSpent / 1000).toFixed(0)}k FCFA`, 'Total', Wallet, '#FF9800')}
              {renderStatsCard('Favoris', clientStats.favoriteProviders.toString(), 'Prestataires', Heart, '#E91E63')}
            </View>
          </View>
        </RoleBasedAccess>

        {/* Provider Performance Dashboard */}
        <RoleBasedAccess allowedRoles={['provider']}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Mes performances</Text>
              <TouchableOpacity onPress={() => router.push('/provider-dashboard')}>
                <TrendingUp size={20} color="#4CAF50" />
              </TouchableOpacity>
            </View>
            <View style={styles.performanceContainer}>
              {renderPerformanceMetric('Revenus ce mois', `${(providerStats.thisMonthEarnings / 1000).toFixed(0)}k FCFA`, 'up', '+12%')}
              {renderPerformanceMetric('Taux de réponse', `${providerStats.responseRate}%`, 'up', '+5%')}
              {renderPerformanceMetric('Note moyenne', `${providerStats.averageRating}/5`, 'up', '+0.2')}
              {renderPerformanceMetric('Clients fidèles', `${providerStats.repeatClients}`, 'up', '+3')}
            </View>

            <View style={styles.statsGrid}>
              {renderStatsCard('Revenus totaux', `${(providerStats.totalEarnings / 1000).toFixed(0)}k`, 'FCFA', DollarSign, '#4CAF50')}
              {renderStatsCard('Tâches terminées', providerStats.completedJobs.toString(), 'Total', CheckCircle, '#2196F3')}
              {renderStatsCard('À venir', providerStats.upcomingTasks.toString(), 'Cette semaine', Calendar, '#FF9800')}
              {renderStatsCard('Note globale', providerStats.averageRating.toString(), '/5 étoiles', Star, '#FFD700')}
            </View>
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

        {/* Urgent Tasks / Opportunities */}
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

        {/* Client Recommendations */}
        <RoleBasedAccess allowedRoles={['client']}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recommandations</Text>
              <TouchableOpacity onPress={() => router.push('/recommendations')}>
                <Award size={20} color="#FFD700" />
              </TouchableOpacity>
            </View>
            <View style={styles.recommendationCard}>
              <View style={styles.recommendationHeader}>
                <Star size={16} color="#FFD700" fill="#FFD700" />
                <Text style={styles.recommendationTitle}>Prestataires recommandés</Text>
              </View>
              <Text style={styles.recommendationText}>
                3 nouveaux prestataires correspondent à vos préférences dans votre zone
              </Text>
              <TouchableOpacity
                style={styles.recommendationButton}
                onPress={() => router.push('/recommended-providers')}
              >
                <Text style={styles.recommendationButtonText}>Voir les recommandations</Text>
              </TouchableOpacity>
            </View>
          </View>
        </RoleBasedAccess>

        {/* Provider Opportunities */}
        <RoleBasedAccess allowedRoles={['provider']}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Opportunités</Text>
              <TouchableOpacity onPress={() => router.push('/opportunities')}>
                <Target size={20} color="#FF7A00" />
              </TouchableOpacity>
            </View>
            <View style={styles.opportunityCard}>
              <View style={styles.opportunityHeader}>
                <Zap size={16} color="#FF7A00" />
                <Text style={styles.opportunityTitle}>Nouvelles demandes dans votre zone</Text>
              </View>
              <Text style={styles.opportunityText}>
                8 nouvelles demandes correspondent à vos services
              </Text>
              <TouchableOpacity
                style={styles.opportunityButton}
                onPress={() => router.push('/task-requests')}
              >
                <Text style={styles.opportunityButtonText}>Voir les demandes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </RoleBasedAccess>

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
              <Text style={styles.safetyFeatureText}>Suivi GPS</Text>
            </View>
            <View style={styles.safetyFeature}>
              <Text style={styles.safetyFeatureIcon}>🆘</Text>
              <Text style={styles.safetyFeatureText}>Bouton d'urgence</Text>
            </View>
            <View style={styles.safetyFeature}>
              <Text style={styles.safetyFeatureIcon}>🛡️</Text>
              <Text style={styles.safetyFeatureText}>Vérification ID</Text>
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
    flexWrap: 'wrap',
  },
  quickActionCard: {
    width: '23%',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickActionText: {
    fontSize: 10,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statsCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsTextContainer: {
    flex: 1,
  },
  statsValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginBottom: 4,
  },
  statsTitle: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginBottom: 2,
  },
  statsSubtitle: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#999',
  },
  statsIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  performanceContainer: {
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
  performanceMetric: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  metricLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  metricValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginRight: 8,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  trendText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    marginLeft: 2,
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
  recommendationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginLeft: 8,
  },
  recommendationText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  recommendationButton: {
    backgroundColor: '#FFD700',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  recommendationButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  opportunityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FF7A00',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  opportunityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  opportunityTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginLeft: 8,
  },
  opportunityText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  opportunityButton: {
    backgroundColor: '#FF7A00',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  opportunityButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
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
