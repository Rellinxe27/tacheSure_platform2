// app/task-request/[id].tsx - Fixed version
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  DollarSign,
  User,
  Star,
  TrendingUp,
  Calendar,
  MessageCircle,
  Shield
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/app/contexts/AuthContext';
import { formatCurrency, formatTimeAgo } from '@/utils/formatting';
import { NotificationService } from '@/utils/notificationService';
import TrustBadge from '@/components/TrustBadge';
import { useDynamicIslandNotification } from '@/components/SnackBar';

// Types
interface TaskRequest {
  id: string;
  title: string;
  description: string;
  budget_min: number;
  budget_max: number;
  scheduled_at: string;
  urgency: string;
  category_id?: string;
  address: any;
  status: string;
  client_id?: string;
  provider_id?: string;
  responded_at?: string;
  client: {
    id: string;
    full_name: string;
    avatar_url?: string;
    trust_score: number;
    is_verified: boolean;
    verification_level: string;
  };
  category: {
    name_fr: string;
    icon: string;
  };
}

interface AvailabilitySlot {
  id?: string;
  provider_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  is_booked?: boolean;
  task_id?: string;
}

interface BusinessIntelligence {
  clientStats: {
    totalTasksPosted: number;
    completionRate: number;
    averageRating: number;
    avgBudget: number;
    paymentReliability: number;
  };
  marketInsights: {
    categoryDemand: number;
    priceCompetitiveness: 'low' | 'competitive' | 'high';
    urgencyTrend: string;
    locationDemand: number;
  };
  recommendations: {
    acceptanceScore: number;
    riskLevel: 'low' | 'medium' | 'high';
    suggestedAction: string;
    reasons: string[];
  };
}

export default function TaskRequestScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user, profile } = useAuth();
  const { showNotification, NotificationComponent } = useDynamicIslandNotification();

  const [task, setTask] = useState<TaskRequest | null>(null);
  const [businessIntel, setBusinessIntel] = useState<BusinessIntelligence | null>(null);
  const [loading, setLoading] = useState(true);
  const [biLoading, setBiLoading] = useState(false);
  const [responding, setResponding] = useState(false);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [error, setError] = useState<string | null>(null);

  const taskId = Array.isArray(id) ? id[0] : id;

  const fetchTaskRequest = useCallback(async () => {
    if (!taskId) {
      setError('Invalid task ID');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select(`
          *,
          client:profiles!client_id (
            id, full_name, avatar_url, trust_score, is_verified, verification_level
          ),
          categories (name_fr, icon)
        `)
        .eq('id', taskId)
        .single();

      if (fetchError) throw fetchError;

      console.log('Fetched task:', data);
      setTask(data);
    } catch (error) {
      console.error('Error fetching task:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du chargement de la demande';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [taskId, showNotification]);

  const fetchProviderAvailability = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Simple availability generation for demo
      const today = new Date();
      const slots: AvailabilitySlot[] = [];

      for (let i = 1; i <= 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        slots.push({
          provider_id: user.id,
          date: date.toISOString().split('T')[0],
          start_time: '09:00',
          end_time: '11:00',
          is_available: true,
          is_booked: false
        });

        slots.push({
          provider_id: user.id,
          date: date.toISOString().split('T')[0],
          start_time: '14:00',
          end_time: '16:00',
          is_available: true,
          is_booked: false
        });
      }

      setAvailabilitySlots(slots);
    } catch (error) {
      console.error('Error fetching availability:', error);
      showNotification('Erreur lors du chargement des créneaux', 'error');
    }
  }, [user?.id, showNotification]);

  // Fixed: Remove dependency to prevent infinite loop
  const generateBusinessIntelligence = useCallback(async (clientId: string) => {
    setBiLoading(true);
    setError(null);

    try {
      // Fetch client statistics
      const { data: clientTasks } = await supabase
        .from('tasks')
        .select('status, budget_min, budget_max')
        .eq('client_id', clientId);

      const { data: clientReviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('reviewee_id', clientId);

      const { data: payments } = await supabase
        .from('payments')
        .select('status')
        .eq('payer_id', clientId);

      // Calculate client stats
      const totalTasks = clientTasks?.length || 0;
      const completedTasks = clientTasks?.filter(t => t.status === 'completed').length || 0;
      const avgRating = clientReviews?.length
        ? clientReviews.reduce((sum, r) => sum + r.rating, 0) / clientReviews.length
        : 0;
      const avgBudget = clientTasks?.length
        ? clientTasks.reduce((sum, t) => sum + ((t.budget_min + t.budget_max) / 2), 0) / clientTasks.length
        : 0;
      const successfulPayments = payments?.filter(p => p.status === 'completed').length || 0;
      const paymentReliability = payments?.length ? (successfulPayments / payments.length) * 100 : 0;

      const clientStats = {
        totalTasksPosted: totalTasks,
        completionRate: totalTasks ? (completedTasks / totalTasks) * 100 : 0,
        averageRating: avgRating,
        avgBudget,
        paymentReliability
      };

      // Calculate acceptance score - use task from state parameter instead of closure
      const taskTrustScore = task?.client?.trust_score || 0;
      const acceptanceFactors = [
        taskTrustScore,
        Math.min(avgRating * 20, 100),
        Math.min(completedTasks * 10, 100),
        paymentReliability,
        50 // Default category demand
      ];

      const acceptanceScore = Math.round(
        acceptanceFactors.reduce((sum, factor) => sum + factor, 0) / acceptanceFactors.length
      );

      const riskLevel = acceptanceScore >= 70 ? 'low' :
        acceptanceScore >= 50 ? 'medium' : 'high';

      const reasons = [];
      let suggestedAction = 'ACCEPTER';

      if (clientStats.completionRate > 80) reasons.push('Taux de completion élevé');
      if (paymentReliability > 90) reasons.push('Paiements fiables');
      if (taskTrustScore > 70) reasons.push('Client de confiance');

      if (acceptanceScore < 50) {
        suggestedAction = 'DÉCLINER';
        reasons.length = 0;
        if (clientStats.completionRate < 50) reasons.push('Faible taux de completion');
        if (paymentReliability < 70) reasons.push('Historique de paiement irrégulier');
      } else if (acceptanceScore < 70) {
        suggestedAction = 'NÉGOCIER';
        reasons.push('Profil mitigé - négociation recommandée');
      }

      setBusinessIntel({
        clientStats,
        marketInsights: {
          categoryDemand: 15,
          priceCompetitiveness: 'competitive',
          urgencyTrend: task?.urgency || 'normal',
          locationDemand: 85
        },
        recommendations: {
          acceptanceScore,
          riskLevel,
          suggestedAction,
          reasons
        }
      });

    } catch (error) {
      console.error('Error generating business intelligence:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'analyse';
      showNotification(errorMessage, 'error');
    } finally {
      setBiLoading(false);
    }
  }, [showNotification]); // Removed task dependency

  useEffect(() => {
    if (taskId) {
      fetchTaskRequest();
      if (profile?.role === 'provider') {
        fetchProviderAvailability();
      }
    }
  }, [taskId, profile?.role, fetchTaskRequest, fetchProviderAvailability]);

  // Fixed: Use client ID directly in dependency array instead of function
  useEffect(() => {
    if (task?.client?.id && !businessIntel && !biLoading) {
      generateBusinessIntelligence(task.client.id);
    }
  }, [task?.client?.id, businessIntel, biLoading]); // Removed generateBusinessIntelligence

  // Real-time subscription for task updates
  useEffect(() => {
    if (!taskId) return;

    const channel = supabase
      .channel(`task-${taskId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tasks',
          filter: `id=eq.${taskId}`
        },
        (payload) => {
          console.log('Task updated in real-time:', payload.new);
          setTask(prev => prev ? { ...prev, ...payload.new } : null);
          showNotification('Tâche mise à jour', 'info');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [taskId, showNotification]);

  const handleResponse = async (response: 'accept' | 'decline') => {
    if (!task || !user) return;

    if (response === 'accept' && !selectedSlot) {
      showNotification('Veuillez sélectionner un créneau disponible', 'warning');
      return;
    }

    setResponding(true);

    try {
      const newStatus = response === 'accept' ? 'applications' : 'cancelled';
      const timestamp = new Date().toISOString();

      // Update task status
      const { error: updateError } = await supabase
        .from('tasks')
        .update({
          status: newStatus,
          provider_id: response === 'accept' ? user.id : null,
          responded_at: timestamp,
          updated_at: timestamp,
          ...(response === 'accept' && selectedSlot ? {
            scheduled_at: `${selectedSlot.date}T${selectedSlot.start_time}:00`
          } : {})
        })
        .eq('id', task.id);

      if (updateError) throw updateError;

      // Create booking if accepting
      if (response === 'accept' && selectedSlot) {
        const { error: bookingError } = await supabase
          .from('provider_bookings')
          .insert({
            provider_id: user.id,
            task_id: task.id,
            client_id: task.client.id,
            date: selectedSlot.date,
            start_time: selectedSlot.start_time,
            end_time: selectedSlot.end_time,
            status: 'confirmed',
            created_at: timestamp
          });

        if (bookingError) console.error('Booking error:', bookingError);
      }

      // Create notification
      const notificationTitle = response === 'accept' ? 'Demande acceptée' : 'Demande déclinée';
      const notificationMessage = response === 'accept'
        ? `${profile?.full_name} a accepté votre demande pour "${task.title}"`
        : `${profile?.full_name} a décliné votre demande pour "${task.title}"`;

      await supabase
        .from('notifications')
        .insert({
          user_id: task.client.id,
          title: notificationTitle,
          message: notificationMessage,
          type: 'task_update',
          data: {
            task_id: task.id,
            provider_id: user.id,
            provider_name: profile?.full_name,
            task_title: task.title,
            response: response,
            ...(response === 'accept' && selectedSlot ? {
              scheduled_date: selectedSlot.date,
              scheduled_time: `${selectedSlot.start_time} - ${selectedSlot.end_time}`
            } : {})
          },
          action_url: `/task/${task.id}`,
          is_read: false,
          created_at: timestamp
        });

      // Send push notification
      if (profile?.full_name) {
        await NotificationService.notifyClientOfBookingUpdate(
          task.client.id,
          profile.full_name,
          task.title,
          response === 'accept' ? 'accepted' : 'rejected',
          task.id
        );
      }

      // Update local state
      setTask(prev => prev ? {
        ...prev,
        status: newStatus,
        provider_id: response === 'accept' ? user.id : null,
        responded_at: timestamp
      } : null);

      const successMessage = response === 'accept'
        ? `Demande acceptée! RDV le ${selectedSlot?.date} à ${selectedSlot?.start_time}`
        : 'Demande déclinée';

      showNotification(successMessage, 'success');

      setTimeout(() => {
        router.back();
      }, 2000);

    } catch (error) {
      console.error('Error responding to task:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'envoi de votre réponse';
      showNotification(errorMessage, 'error');
    } finally {
      setResponding(false);
    }
  };

  const getSlotDuration = (slot: AvailabilitySlot): number => {
    try {
      const start = new Date(`2000-01-01T${slot.start_time}`);
      const end = new Date(`2000-01-01T${slot.end_time}`);
      return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    } catch (error) {
      return 2;
    }
  };

  const renderAvailabilitySlots = () => {
    if (availabilitySlots.length === 0) {
      return (
        <View style={styles.noSlotsContainer}>
          <Clock size={24} color="#666" />
          <Text style={styles.noSlotsText}>
            Aucun créneau disponible. Configurez vos disponibilités dans votre calendrier.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.slotsContainer}>
        <Text style={styles.slotsTitle}>Sélectionnez un créneau disponible:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.slotsScroll}>
          {availabilitySlots.map((slot, index) => (
            <TouchableOpacity
              key={`${slot.date}-${slot.start_time}-${index}`}
              style={[
                styles.slotCard,
                selectedSlot === slot && styles.selectedSlotCard
              ]}
              onPress={() => setSelectedSlot(slot)}
            >
              <Text style={styles.slotDate}>
                {new Date(slot.date).toLocaleDateString('fr-FR', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short'
                })}
              </Text>
              <Text style={styles.slotTime}>{slot.start_time} - {slot.end_time}</Text>
              <Text style={styles.slotDuration}>{getSlotDuration(slot)}h</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  if (error && !task) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Erreur</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <XCircle size={48} color="#FF5722" />
          <Text style={styles.errorTitle}>Erreur</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchTaskRequest}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF7A00" />
        <Text style={styles.loadingText}>Analyse de la demande...</Text>
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Demande introuvable</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <XCircle size={48} color="#FF5722" />
          <Text style={styles.errorTitle}>Demande introuvable</Text>
          <Text style={styles.errorMessage}>Cette demande n'existe pas ou a été supprimée.</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // If task is already responded to, show status
  if (task.status === 'applications' || task.status === 'cancelled') {
    return (
      <View style={styles.container}>
        <NotificationComponent />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Demande de service</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.statusContainer}>
          {task.status === 'applications' ? (
            <>
              <CheckCircle size={48} color="#4CAF50" />
              <Text style={styles.statusTitle}>Demande acceptée!</Text>
              <Text style={styles.statusMessage}>
                Vous avez accepté cette demande. Le client a été notifié.
              </Text>
            </>
          ) : (
            <>
              <XCircle size={48} color="#FF5722" />
              <Text style={styles.statusTitle}>Demande déclinée</Text>
              <Text style={styles.statusMessage}>
                Vous avez décliné cette demande.
              </Text>
            </>
          )}

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <NotificationComponent />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Demande de service</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Client Profile */}
        <View style={styles.clientCard}>
          <View style={styles.clientHeader}>
            <User size={20} color="#FF7A00" />
            <Text style={styles.clientName}>{task.client.full_name}</Text>
            <TrustBadge
              trustScore={task.client.trust_score || 0}
              verificationLevel={task.client.verification_level as any}
              isVerified={task.client.is_verified || false}
              size="small"
            />
          </View>

          {businessIntel && (
            <View style={styles.clientStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{businessIntel.clientStats.totalTasksPosted}</Text>
                <Text style={styles.statLabel}>Tâches postées</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{businessIntel.clientStats.completionRate.toFixed(0)}%</Text>
                <Text style={styles.statLabel}>Taux de completion</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Note moyenne</Text>
              </View>
            </View>
          )}
        </View>

        {/* Task Details */}
        <View style={styles.taskCard}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <Text style={styles.taskDescription}>{task.description}</Text>

          <View style={styles.taskMeta}>
            <View style={styles.metaItem}>
              <DollarSign size={16} color="#FF7A00" />
              <Text style={styles.metaText}>
                {formatCurrency(task.budget_min || 0)} - {formatCurrency(task.budget_max || 0)}
              </Text>
            </View>

            <View style={styles.metaItem}>
              <Calendar size={16} color="#FF7A00" />
              <Text style={styles.metaText}>
                {task.scheduled_at ? new Date(task.scheduled_at).toLocaleString('fr-FR') : 'Non spécifié'}
              </Text>
            </View>

            <View style={styles.metaItem}>
              <MapPin size={16} color="#FF7A00" />
              <Text style={styles.metaText}>{task.address?.street || 'Adresse non spécifiée'}</Text>
            </View>
          </View>
        </View>

        {/* Business Intelligence */}
        {biLoading ? (
          <View style={styles.biLoadingContainer}>
            <ActivityIndicator size="small" color="#FF7A00" />
            <Text style={styles.biLoadingText}>Analyse en cours...</Text>
          </View>
        ) : businessIntel && (
          <View style={styles.biCard}>
            <View style={styles.biHeader}>
              <TrendingUp size={20} color="#FF7A00" />
              <Text style={styles.biTitle}>Analyse intelligente</Text>
            </View>

            <View style={[
              styles.recommendationCard,
              businessIntel.recommendations.riskLevel === 'low' ? styles.lowRisk :
                businessIntel.recommendations.riskLevel === 'medium' ? styles.mediumRisk :
                  styles.highRisk
            ]}>
              <Text style={styles.recommendationScore}>
                Score d'acceptation: {businessIntel.recommendations.acceptanceScore}%
              </Text>
              <Text style={styles.recommendationAction}>
                Recommandation: {businessIntel.recommendations.suggestedAction}
              </Text>

              <View style={styles.reasonsList}>
                {businessIntel.recommendations.reasons.map((reason, index) => (
                  <Text key={index} style={styles.reasonItem}>• {reason}</Text>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Availability Slots for Acceptance */}
        {profile?.role === 'provider' && renderAvailabilitySlots()}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => router.push(`/chat?clientId=${task.client.id}`)}
          >
            <MessageCircle size={20} color="#FF7A00" />
            <Text style={styles.contactButtonText}>Discuter</Text>
          </TouchableOpacity>

          <View style={styles.responseButtons}>
            <TouchableOpacity
              style={[styles.responseButton, styles.declineButton]}
              onPress={() => handleResponse('decline')}
              disabled={responding}
            >
              <XCircle size={20} color="#FFFFFF" />
              <Text style={styles.responseButtonText}>Décliner</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.responseButton,
                styles.acceptButton,
                (!selectedSlot && styles.disabledButton)
              ]}
              onPress={() => handleResponse('accept')}
              disabled={responding || !selectedSlot}
            >
              {responding ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <CheckCircle size={20} color="#FFFFFF" />
              )}
              <Text style={styles.responseButtonText}>Accepter</Text>
            </TouchableOpacity>
          </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#FF7A00',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
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
  clientCard: {
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
  clientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  clientName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  clientStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FF7A00',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 2,
  },
  taskCard: {
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
  biCard: {
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
  biLoadingContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  biLoadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginLeft: 8,
  },
  biHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  biTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginLeft: 8,
  },
  recommendationCard: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  lowRisk: {
    backgroundColor: '#E8F5E8',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  mediumRisk: {
    backgroundColor: '#FFF3E0',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  highRisk: {
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: '#FF5722',
  },
  recommendationScore: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  recommendationAction: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginBottom: 8,
  },
  reasonsList: {
    gap: 4,
  },
  reasonItem: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  slotsContainer: {
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
  slotsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 12,
  },
  slotsScroll: {
    maxHeight: 120,
  },
  slotCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    minWidth: 100,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedSlotCard: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF7A00',
  },
  slotDate: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#333',
    marginBottom: 4,
  },
  slotTime: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FF7A00',
    marginBottom: 2,
  },
  slotDuration: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  noSlotsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noSlotsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  statusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  statusTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  statusMessage: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  backButton: {
    backgroundColor: '#FF7A00',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  actions: {
    marginBottom: 40,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 16,
  },
  contactButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FF7A00',
    marginLeft: 8,
  },
  responseButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  responseButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  declineButton: {
    backgroundColor: '#FF5722',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  responseButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});