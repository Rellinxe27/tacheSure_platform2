import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, DollarSign, Star, Clock, TrendingUp, Settings, Plus, Eye, Edit3 } from 'lucide-react-native';

export default function ProviderDashboardScreen() {
  const router = useRouter();
  const [isAvailable, setIsAvailable] = useState(true);

  const stats = {
    totalEarnings: 567000,
    completedTasks: 23,
    averageRating: 4.8,
    responseTime: '12 min',
    activeBookings: 3,
    pendingRequests: 5
  };

  const activeBookings = [
    {
      id: '1',
      title: 'Réparation plomberie',
      client: 'Marie K.',
      time: '14:00 - 16:00',
      location: 'Cocody',
      price: '25000',
      status: 'confirmed'
    },
    {
      id: '2',
      title: 'Installation sanitaire',
      client: 'Yves T.',
      time: '09:00 - 12:00',
      location: 'Plateau',
      price: '45000',
      status: 'in_progress'
    }
  ];

  const pendingRequests = [
    {
      id: '1',
      title: 'Débouchage canalisation',
      client: 'Fatou D.',
      budget: '15000',
      urgency: 'normal',
      distance: '2.3 km',
      postedTime: '30 min'
    },
    {
      id: '2',
      title: 'Réparation robinet',
      client: 'Jean M.',
      budget: '12000',
      urgency: 'high',
      distance: '1.8 km',
      postedTime: '1h'
    }
  ];

  const services = [
    { id: '1', name: 'Réparation de fuite', price: '15000-25000', active: true },
    { id: '2', name: 'Installation sanitaire', price: '50000-100000', active: true },
    { id: '3', name: 'Débouchage', price: '10000-20000', active: false }
  ];

  const handleAcceptRequest = (requestId: string) => {
    Alert.alert('Demande acceptée', 'Le client a été notifié de votre acceptation');
  };

  const handleRejectRequest = (requestId: string) => {
    Alert.alert('Demande refusée', 'Une autre opportunité se présentera bientôt');
  };

  const handleViewBooking = (bookingId: string) => {
    router.push(`/task-details?taskId=${bookingId}`);
  };

  const toggleServiceStatus = (serviceId: string) => {
    Alert.alert('Service mis à jour', 'Le statut du service a été modifié');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tableau de bord</Text>
        <View style={styles.availabilityToggle}>
          <Text style={styles.availabilityLabel}>
            {isAvailable ? 'Disponible' : 'Indisponible'}
          </Text>
          <Switch
            value={isAvailable}
            onValueChange={setIsAvailable}
            trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
            thumbColor={isAvailable ? '#FFFFFF' : '#F4F3F4'}
          />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <DollarSign size={24} color="#4CAF50" />
            <Text style={styles.statValue}>{(stats.totalEarnings / 1000)}k</Text>
            <Text style={styles.statLabel}>Gains totaux (FCFA)</Text>
          </View>

          <View style={styles.statCard}>
            <Clock size={24} color="#2196F3" />
            <Text style={styles.statValue}>{stats.completedTasks}</Text>
            <Text style={styles.statLabel}>Tâches complétées</Text>
          </View>

          <View style={styles.statCard}>
            <Star size={24} color="#FFD700" />
            <Text style={styles.statValue}>{stats.averageRating}</Text>
            <Text style={styles.statLabel}>Note moyenne</Text>
          </View>

          <View style={styles.statCard}>
            <TrendingUp size={24} color="#FF7A00" />
            <Text style={styles.statValue}>{stats.responseTime}</Text>
            <Text style={styles.statLabel}>Temps réponse</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Réservations actives</Text>
            <TouchableOpacity>
              <Calendar size={20} color="#FF7A00" />
            </TouchableOpacity>
          </View>

          {activeBookings.map((booking) => (
            <TouchableOpacity
              key={booking.id}
              style={styles.bookingCard}
              onPress={() => handleViewBooking(booking.id)}
            >
              <View style={styles.bookingHeader}>
                <Text style={styles.bookingTitle}>{booking.title}</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: booking.status === 'confirmed' ? '#2196F3' : '#FF7A00' }
                ]}>
                  <Text style={styles.statusText}>
                    {booking.status === 'confirmed' ? 'Confirmé' : 'En cours'}
                  </Text>
                </View>
              </View>

              <Text style={styles.bookingClient}>Client: {booking.client}</Text>
              <Text style={styles.bookingTime}>{booking.time} • {booking.location}</Text>
              <Text style={styles.bookingPrice}>{booking.price} FCFA</Text>

              <View style={styles.bookingActions}>
                <TouchableOpacity style={styles.viewButton}>
                  <Eye size={16} color="#666" />
                  <Text style={styles.viewButtonText}>Voir détails</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.chatButton}
                  onPress={() => router.push('/chat')}
                >
                  <Text style={styles.chatButtonText}>Contacter</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nouvelles demandes</Text>
            <Text style={styles.requestCount}>{pendingRequests.length}</Text>
          </View>

          {pendingRequests.map((request) => (
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

              <Text style={styles.requestClient}>Client: {request.client}</Text>
              <Text style={styles.requestBudget}>Budget: {request.budget} FCFA</Text>
              <Text style={styles.requestDistance}>À {request.distance} • Il y a {request.postedTime}</Text>

              <View style={styles.requestActions}>
                <TouchableOpacity
                  style={styles.rejectRequestButton}
                  onPress={() => handleRejectRequest(request.id)}
                >
                  <Text style={styles.rejectRequestText}>Refuser</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.acceptRequestButton}
                  onPress={() => handleAcceptRequest(request.id)}
                >
                  <Text style={styles.acceptRequestText}>Postuler</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mes services</Text>
            <TouchableOpacity onPress={() => router.push('/service-management')}>
              <Plus size={20} color="#FF7A00" />
            </TouchableOpacity>
          </View>

          {services.map((service) => (
            <View key={service.id} style={styles.serviceCard}>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.servicePrice}>{service.price} FCFA</Text>
              </View>

              <View style={styles.serviceControls}>
                <TouchableOpacity
                  style={styles.editServiceButton}
                  onPress={() => router.push(`/edit-service?serviceId=${service.id}`)}
                >
                  <Edit3 size={16} color="#666" />
                </TouchableOpacity>
                <Switch
                  value={service.active}
                  onValueChange={() => toggleServiceStatus(service.id)}
                  trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                  thumbColor={service.active ? '#FFFFFF' : '#F4F3F4'}
                />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push('/availability-calendar')}
          >
            <Calendar size={24} color="#FFFFFF" />
            <Text style={styles.quickActionText}>Gérer disponibilités</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push('/earnings')}
          >
            <DollarSign size={24} color="#FFFFFF" />
            <Text style={styles.quickActionText}>Voir gains</Text>
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
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333',
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
  bookingClient: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 4,
  },
  bookingTime: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 8,
  },
  bookingPrice: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FF7A00',
    marginBottom: 12,
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
  requestClient: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 4,
  },
  requestBudget: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FF7A00',
    marginBottom: 4,
  },
  requestDistance: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 12,
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