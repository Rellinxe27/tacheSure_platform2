// app/(tabs)/provider-dashboard.tsx - Enhanced with real database integration
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/app/contexts/AuthContext';
import { useTasks } from '@/hooks/useTasks';
import { useServices } from '@/hooks/useServices';
import { usePayments } from '@/hooks/usePayments';
import { useReviews } from '@/hooks/useReviews';
import { Calendar, DollarSign, Star, Clock, TrendingUp, Settings, Plus, Eye, Edit3, MapPin } from 'lucide-react-native';
import { formatCurrency, formatTimeAgo } from '@/utils/formatting';
import TrustBadge from '@/components/TrustBadge';

export default function ProviderDashboardScreen() {
  const router = useRouter();
  const { user, profile, updateProfile } = useAuth();
  const [isAvailable, setIsAvailable] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch real data from database
  const { tasks: myTasks, loading: tasksLoading } = useTasks({
    providerId: user?.id,
    limit: 20
  });

  const { services, loading: servicesLoading, updateService } = useServices(user?.id);
  const { stats: paymentStats, loading: paymentsLoading } = usePayments();
  const { stats: reviewStats, loading: reviewsLoading } = useReviews(user?.id);

  // Filter tasks by status
  const activeBookings = myTasks.filter(task =>
    ['selected', 'in_progress'].includes(task.status)
  );

  const pendingApplications = myTasks.filter(task =>
    task.status === 'applications'
  );

  const completedTasks = myTasks.filter(task =>
    task.status === 'completed'
  );

  useEffect(() => {
    if (profile) {
      setIsAvailable(profile.is_active || false);
    }
  }, [profile]);

  const handleAvailabilityToggle = async (available: boolean) => {
    setIsAvailable(available);

    const result = await updateProfile({
      is_active: available,
      last_seen_at: new Date().toISOString()
    });

    if (result.error) {
      Alert.alert('Erreur', result.error);
      setIsAvailable(!available); // Revert on error
    }
  };

  const handleAcceptTask = async (taskId: string) => {
    // In a real implementation, this would update the task status
    Alert.alert('Tâche acceptée', 'Vous avez accepté cette tâche');
  };

  const handleServiceToggle = async (serviceId: string, active: boolean) => {
    const result = await updateService(serviceId, { is_active: active });

    if (result.error) {
      Alert.alert('Erreur', result.error);
    } else {
      Alert.alert('Service mis à jour', 'Le statut du service a été modifié');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Trigger refresh of all hooks
    setTimeout(() => setRefreshing(false), 1000);
  };

  const stats = {
    totalEarnings: paymentStats.totalEarned || 0,
    completedTasks: completedTasks.length,
    averageRating: reviewStats.averageRating || 0,
    responseTime: '12 min', // This could be calculated from actual data
    activeBookings: activeBookings.length,
    pendingRequests: pendingApplications.length
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Tableau de bord</Text>
          {profile && (
            <TrustBadge
              trustScore={profile.trust_score || 0}
              verificationLevel={profile.verification_level}
              isVerified={profile.is_verified || false}
              size="small"
            />
          )}
        </View>
        <View style={styles.availabilityToggle}>
          <Text style={styles.availabilityLabel}>
            {isAvailable ? 'Disponible' : 'Indisponible'}
          </Text>
          <Switch
            value={isAvailable}
            onValueChange={handleAvailabilityToggle}
            trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
            thumbColor={isAvailable ? '#FFFFFF' : '#F4F3F4'}
          />
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <DollarSign size={24} color="#4CAF50" />
            <Text style={styles.statValue}>
              {(stats.totalEarnings / 1000).toFixed(0)}k
            </Text>
            <Text style={styles.statLabel}>Gains totaux (FCFA)</Text>
          </View>

          <View style={styles.statCard}>
            <Clock size={24} color="#2196F3" />
            <Text style={styles.statValue}>{stats.completedTasks}</Text>
            <Text style={styles.statLabel}>Tâches complétées</Text>
          </View>

          <View style={styles.statCard}>
            <Star size={24} color="#FFD700" />
            <Text style={styles.statValue}>{stats.averageRating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Note moyenne</Text>
          </View>

          <View style={styles.statCard}>
            <TrendingUp size={24} color="#FF7A00" />
            <Text style={styles.statValue}>{stats.responseTime}</Text>
            <Text style={styles.statLabel}>Temps réponse</Text>
          </View>
        </View>

        {/* Active Bookings */}
        {activeBookings.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Réservations actives</Text>
              <TouchableOpacity onPress={() => router.push('/calendar')}>
                <Calendar size={20} color="#FF7A00" />
              </TouchableOpacity>
            </View>

            {activeBookings.map((booking) => (
              <TouchableOpacity
                key={booking.id}
                style={styles.bookingCard}
                onPress={() => router.push(`/task-details?taskId=${booking.id}`)}
              >
                <View style={styles.bookingHeader}>
                  <Text style={styles.bookingTitle}>{booking.title}</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: booking.status === 'selected' ? '#2196F3' : '#FF7A00' }
                  ]}>
                    <Text style={styles.statusText}>
                      {booking.status === 'selected' ? 'Confirmé' : 'En cours'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.bookingDescription} numberOfLines={2}>
                  {booking.description}
                </Text>

                <View style={styles.bookingMeta}>
                  <View style={styles.metaItem}>
                    <MapPin size={12} color="#666" />
                    <Text style={styles.metaText}>
                      {booking.address?.city || 'Abidjan'}
                    </Text>
                  </View>
                  <Text style={styles.bookingPrice}>
                    {formatCurrency(booking.budget_max || 0)}
                  </Text>
                </View>

                <View style={styles.bookingActions}>
                  <TouchableOpacity style={styles.viewButton}>
                    <Eye size={16} color="#666" />
                    <Text style={styles.viewButtonText}>Voir détails</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.chatButton}
                    onPress={() => router.push(`/chat?taskId=${booking.id}`)}
                  >
                    <Text style={styles.chatButtonText}>Contacter</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Pending Applications */}
        {pendingApplications.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Nouvelles opportunités</Text>
              <Text style={styles.requestCount}>{pendingApplications.length}</Text>
            </View>

            {pendingApplications.slice(0, 3).map((request) => (
              <View key={request.id} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <Text style={styles.requestTitle}>{request.title}</Text>
                  <View style={[
                    styles.urgencyBadge,
                    { backgroundColor: request.urgency === 'high' ? '#FF5722' : '#FF9800' }
                  ]}>
                    <Text style={styles.urgencyText}>
                      {request.urgency === 'high' ? 'Urgent' : 'Normal'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.requestDescription} numberOfLines={2}>
                  {request.description}
                </Text>

                <View style={styles.requestMeta}>
                  <Text style={styles.requestBudget}>
                    Budget: {formatCurrency(request.budget_max || 0)}
                  </Text>
                  <Text style={styles.requestTime}>
                    {formatTimeAgo(request.created_at!)}
                  </Text>
                </View>

                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={styles.rejectRequestButton}
                    onPress={() => Alert.alert('Opportunité ignorée')}
                  >
                    <Text style={styles.rejectRequestText}>Ignorer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.acceptRequestButton}
                    onPress={() => router.push(`/task-details?taskId=${request.id}`)}
                  >
                    <Text style={styles.acceptRequestText}>Voir détails</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

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
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push('/availability-calendar')}
          >
            <Calendar size={24} color="#FFFFFF" />
            <Text style={styles.quickActionText}>Disponibilités</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push('/earnings')}
          >
            <DollarSign size={24} color="#FFFFFF" />
            <Text style={styles.quickActionText}>Gains</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push('/provider-settings')}
          >
            <Settings size={24} color="#FFFFFF" />
            <Text style={styles.quickActionText}>Paramètres</Text>
          </TouchableOpacity>
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
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginBottom: 8,
  },
  availabilityToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333',
    marginRight: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 24,
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
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
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
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  requestCount: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FF7A00',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
  },
  bookingCard: {
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
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  bookingDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 12,
    lineHeight: 18,
  },
  bookingMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginLeft: 4,
  },
  bookingPrice: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FF7A00',
  },
  bookingActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewButton: {
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
  viewButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginLeft: 4,
  },
  chatButton: {
    backgroundColor: '#FF7A00',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  requestCard: {
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
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    flex: 1,
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgencyText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  requestDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 12,
    lineHeight: 18,
  },
  requestMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestBudget: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FF7A00',
  },
  requestTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rejectRequestButton: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  rejectRequestText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FF5722',
  },
  acceptRequestButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  acceptRequestText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  servicePrice: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  serviceControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editServiceButton: {
    padding: 8,
    marginRight: 8,
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
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 16,
  },
  addServiceButton: {
    backgroundColor: '#FF7A00',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addServiceText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  quickActionButton: {
    backgroundColor: '#FF7A00',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  quickActionText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginTop: 8,
    textAlign: 'center',
  },
});