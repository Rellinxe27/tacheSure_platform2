// app/task-details/[id].tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  MapPin,
  DollarSign,
  User,
  Phone,
  MessageCircle,
  Calendar,
  Star,
  Shield,
  AlertTriangle,
  Camera
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/app/contexts/AuthContext';
import { formatCurrency, formatTimeAgo } from '@/utils/formatting';
import TrustBadge from '@/components/TrustBadge';
import RealTimeTracking from '@/components/RealTimeTracking';
import SafetyButton from '@/components/SafetyButton';

export default function TaskDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user, profile } = useAuth();

  const [task, setTask] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const taskId = Array.isArray(id) ? id[0] : id;

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  const fetchTaskDetails = async () => {
    try {
      // Fetch task with all related data
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select(`
          *,
          client:profiles!client_id (
            id, full_name, avatar_url, phone, trust_score, is_verified, verification_level
          ),
          provider:profiles!provider_id (
            id, full_name, avatar_url, phone, trust_score, is_verified, verification_level
          ),
          categories (name_fr, icon)
        `)
        .eq('id', taskId)
        .single();

      if (taskError) throw taskError;

      // Fetch booking details if task is accepted
      let bookingData = null;
      if (taskData.status === 'applications' || taskData.status === 'in_progress') {
        const { data: booking } = await supabase
          .from('provider_bookings')
          .select('*')
          .eq('task_id', taskId)
          .single();
        bookingData = booking;
      }

      setTask(taskData);
      setBooking(bookingData);
    } catch (error) {
      console.error('Error fetching task details:', error);
      Alert.alert('Erreur', 'Impossible de charger les détails de la tâche');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          status: newStatus,
          ...(newStatus === 'in_progress' && { started_at: new Date().toISOString() }),
          ...(newStatus === 'completed' && { completed_at: new Date().toISOString() }),
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;

      // Create notification for the other party
      const otherPartyId = user?.id === task.client_id ? task.provider_id : task.client_id;
      const statusMessages = {
        'in_progress': 'Le service a commencé',
        'completed': 'Le service a été terminé',
        'cancelled': 'Le service a été annulé'
      };

      await supabase
        .from('notifications')
        .insert({
          user_id: otherPartyId,
          title: 'Mise à jour du service',
          message: statusMessages[newStatus],
          type: 'task_update',
          data: { task_id: taskId, new_status: newStatus },
          action_url: `/task-details/${taskId}`,
          created_at: new Date().toISOString()
        });

      setTask(prev => ({ ...prev, status: newStatus }));
      Alert.alert('Succès', `Statut mis à jour: ${statusMessages[newStatus]}`);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour le statut');
    } finally {
      setActionLoading(false);
    }
  };

  const makePhoneCall = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const openChat = () => {
    const otherPartyId = user?.id === task.client_id ? task.provider_id : task.client_id;
    router.push(`/chat?userId=${otherPartyId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'posted': return '#FF9800';
      case 'applications': return '#2196F3';
      case 'in_progress': return '#FF7A00';
      case 'completed': return '#4CAF50';
      case 'cancelled': return '#FF5722';
      default: return '#666';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'posted': return 'En attente';
      case 'applications': return 'Acceptée';
      case 'in_progress': return 'En cours';
      case 'completed': return 'Terminée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  const renderActionButtons = () => {
    if (!task) return null;

    const isProvider = user?.id === task.provider_id;
    const isClient = user?.id === task.client_id;

    return (
      <View style={styles.actionButtons}>
        {/* Communication buttons - always available */}
        <View style={styles.communicationButtons}>
          <TouchableOpacity style={styles.chatButton} onPress={openChat}>
            <MessageCircle size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Chat</Text>
          </TouchableOpacity>

          {((isProvider && task.client?.phone) || (isClient && task.provider?.phone)) && (
            <TouchableOpacity
              style={styles.phoneButton}
              onPress={() => makePhoneCall(isProvider ? task.client.phone : task.provider.phone)}
            >
              <Phone size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Appeler</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Status action buttons */}
        {task.status === 'applications' && isProvider && (
          <TouchableOpacity
            style={[styles.actionButton, styles.startButton]}
            onPress={() => handleStatusUpdate('in_progress')}
            disabled={actionLoading}
          >
            <Clock size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Commencer le service</Text>
          </TouchableOpacity>
        )}

        {task.status === 'in_progress' && isProvider && (
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={() => handleStatusUpdate('completed')}
            disabled={actionLoading}
          >
            <CheckCircle size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Terminer le service</Text>
          </TouchableOpacity>
        )}

        {task.status === 'completed' && !task.review_given && (
          <TouchableOpacity
            style={[styles.actionButton, styles.reviewButton]}
            onPress={() => router.push(`/review/${taskId}`)}
          >
            <Star size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Laisser un avis</Text>
          </TouchableOpacity>
        )}

        {/* Emergency button - always visible during active service */}
        {task.status === 'in_progress' && (
          <View style={styles.emergencyContainer}>
            <SafetyButton onEmergency={() => Alert.alert('Alerte d\'urgence activée')} />
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF7A00" />
        <Text style={styles.loadingText}>Chargement des détails...</Text>
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.container}>
        <Text>Tâche introuvable</Text>
      </View>
    );
  }

  const otherParty = user?.id === task.client_id ? task.provider : task.client;
  const isProvider = user?.id === task.provider_id;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails de la tâche</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(task.status) }]} />
            <Text style={styles.statusText}>{getStatusText(task.status)}</Text>
          </View>
          <Text style={styles.statusDate}>
            Mise à jour: {formatTimeAgo(task.updated_at)}
          </Text>
        </View>

        {/* Task Information */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Informations de la tâche</Text>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <Text style={styles.taskDescription}>{task.description}</Text>

          <View style={styles.taskMeta}>
            <View style={styles.metaItem}>
              <DollarSign size={16} color="#FF7A00" />
              <Text style={styles.metaText}>
                {formatCurrency(task.budget_min)} - {formatCurrency(task.budget_max)}
              </Text>
            </View>

            <View style={styles.metaItem}>
              <MapPin size={16} color="#FF7A00" />
              <Text style={styles.metaText}>{task.address?.street || 'Adresse non spécifiée'}</Text>
            </View>

            {booking && (
              <View style={styles.metaItem}>
                <Calendar size={16} color="#FF7A00" />
                <Text style={styles.metaText}>
                  {booking.date} à {booking.start_time} - {booking.end_time}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Other Party Information */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>
            {isProvider ? 'Client' : 'Prestataire'}
          </Text>

          <View style={styles.personInfo}>
            <View style={styles.personHeader}>
              <User size={20} color="#FF7A00" />
              <Text style={styles.personName}>{otherParty?.full_name}</Text>
              <TrustBadge
                trustScore={otherParty?.trust_score || 0}
                verificationLevel={otherParty?.verification_level}
                isVerified={otherParty?.is_verified || false}
                size="small"
              />
            </View>

            {otherParty?.phone && (
              <View style={styles.contactInfo}>
                <Phone size={16} color="#666" />
                <Text style={styles.contactText}>{otherParty.phone}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Real-time tracking for active tasks */}
        {task.status === 'in_progress' && (
          <RealTimeTracking
            taskId={taskId}
            userRole={isProvider ? 'provider' : 'client'}
            onEmergency={() => Alert.alert('Alerte d\'urgence')}
          />
        )}

        {/* Action Buttons */}
        {renderActionButtons()}

        {/* Safety Notice */}
        <View style={styles.safetyNotice}>
          <Shield size={16} color="#4CAF50" />
          <Text style={styles.safetyText}>
            TâcheSûre protège vos paiements et votre sécurité
          </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  statusDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  infoCard: {
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
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 12,
  },
  taskTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 8,
  },
  taskDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  taskMeta: {
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333',
    marginLeft: 8,
  },
  personInfo: {
    gap: 12,
  },
  personHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  personName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginLeft: 8,
  },
  actionButtons: {
    marginBottom: 20,
  },
  communicationButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  chatButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF7A00',
    paddingVertical: 12,
    borderRadius: 8,
  },
  phoneButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  startButton: {
    backgroundColor: '#FF7A00',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
  },
  reviewButton: {
    backgroundColor: '#FFD700',
  },
  buttonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  emergencyContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  safetyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  safetyText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#2E7D32',
    marginLeft: 8,
  },
});