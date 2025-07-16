import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Clock, User, MapPin, DollarSign, MessageCircle, Phone, CheckCircle, XCircle, AlertTriangle, Star, TrendingUp, Calendar, Activity } from 'lucide-react-native';
import RealTimeTracking from '@/components/RealTimeTracking';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/app/contexts/AuthContext';
import { formatCurrency, formatTimeAgo } from '@/utils/formatting';
import { useDynamicIslandNotification } from '@/components/SnackBar';

export default function TaskStatusScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user, profile } = useAuth();
  const { showNotification, NotificationComponent } = useDynamicIslandNotification();

  const [task, setTask] = useState<any>(null);
  const [taskStatus, setTaskStatus] = useState<'posted' | 'applications' | 'selected' | 'in_progress' | 'completed' | 'cancelled'>('posted');
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [showTracking, setShowTracking] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusHistory, setStatusHistory] = useState<any[]>([]);

  useEffect(() => {
    if (params.taskId) {
      fetchTaskDetails();
      fetchStatusHistory();
      setupRealTimeSubscription();
    }
  }, [params.taskId]);

  const setupRealTimeSubscription = () => {
    const channel = supabase
      .channel(`task-status-${params.taskId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tasks',
          filter: `id=eq.${params.taskId}`
        },
        (payload) => {
          setTask(payload.new);
          setTaskStatus(payload.new.status);
          if (payload.new.status === 'in_progress') {
            setShowTracking(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchTaskDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          client:profiles!tasks_client_id_fkey(*),
          provider:profiles!tasks_provider_id_fkey(*),
          category:categories(*)
        `)
        .eq('id', params.taskId)
        .single();

      if (error) throw error;

      setTask(data);
      setTaskStatus(data.status);

      if (data.provider) {
        setSelectedProvider({
          provider: data.provider,
          proposed_price: data.budget_max || data.budget_min || 0
        });
      }

      if (data.status === 'in_progress') {
        setShowTracking(true);
      }
    } catch (error) {
      console.error('Error fetching task:', error);
      showNotification('Erreur lors du chargement', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatusHistory = async () => {
    // Mock status history - in real app, this would come from a status_history table
    const mockHistory = [
      { status: 'posted', timestamp: new Date(Date.now() - 86400000 * 2), description: 'Tâche publiée' },
      { status: 'applications', timestamp: new Date(Date.now() - 86400000 * 1.5), description: 'Candidatures reçues' },
      { status: 'selected', timestamp: new Date(Date.now() - 86400000), description: 'Prestataire sélectionné' },
    ];
    setStatusHistory(mockHistory);
  };

  const handleStartTask = async () => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          status: 'in_progress',
          started_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', params.taskId);

      if (error) throw error;

      setTaskStatus('in_progress');
      setShowTracking(true);
      showNotification('Tâche démarrée avec succès', 'success');
    } catch (error) {
      showNotification('Erreur lors du démarrage', 'error');
    }
  };

  const handleCompleteTask = async () => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', params.taskId);

      if (error) throw error;

      setTaskStatus('completed');
      setShowTracking(false);
      showNotification('Tâche terminée avec succès', 'success');

      // Show rating modal for client
      if (profile?.role === 'client') {
        setTimeout(() => setShowRatingModal(true), 1000);
      }
    } catch (error) {
      showNotification('Erreur lors de la finalisation', 'error');
    }
  };

  const handleSubmitRating = async () => {
    if (!task || !selectedProvider || !user) return;

    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          task_id: task.id,
          reviewer_id: user.id,
          reviewee_id: selectedProvider.provider.id,
          rating,
          comment: reviewComment.trim() || null,
          is_public: true,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Review submission error:', error);
        showNotification(`Erreur: ${error.message}`, 'error');
        return;
      }

      setShowRatingModal(false);
      showNotification('Évaluation envoyée avec succès', 'success');
      setRating(5);
      setReviewComment('');
    } catch (error) {
      console.error('Unexpected error:', error);
      showNotification('Erreur lors de l\'évaluation', 'error');
    }
  };

  const handleCancelTask = () => {
    Alert.alert(
      'Annuler la tâche',
      'Êtes-vous sûr de vouloir annuler cette tâche? Cette action peut affecter votre score de confiance.',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('tasks')
                .update({
                  status: 'cancelled',
                  updated_at: new Date().toISOString()
                })
                .eq('id', params.taskId);

              if (error) throw error;

              setTaskStatus('cancelled');
              showNotification('Tâche annulée', 'info');
            } catch (error) {
              showNotification('Erreur lors de l\'annulation', 'error');
            }
          }
        }
      ]
    );
  };

  const getStatusColor = () => {
    switch (taskStatus) {
      case 'posted': return '#2196F3';
      case 'applications': return '#FF9800';
      case 'selected': return '#9C27B0';
      case 'in_progress': return '#FF7A00';
      case 'completed': return '#4CAF50';
      case 'cancelled': return '#FF5722';
      default: return '#666';
    }
  };

  const getStatusText = () => {
    switch (taskStatus) {
      case 'posted': return 'Publiée';
      case 'applications': return 'Candidatures reçues';
      case 'selected': return 'Prestataire sélectionné';
      case 'in_progress': return 'En cours d\'exécution';
      case 'completed': return 'Tâche terminée';
      case 'cancelled': return 'Annulée';
      default: return 'Statut inconnu';
    }
  };

  const getProgressPercentage = () => {
    switch (taskStatus) {
      case 'posted': return 20;
      case 'applications': return 40;
      case 'selected': return 60;
      case 'in_progress': return 80;
      case 'completed': return 100;
      case 'cancelled': return 0;
      default: return 0;
    }
  };

  const getBusinessInsights = () => {
    const insights = [];

    if (taskStatus === 'posted') {
      insights.push({
        icon: TrendingUp,
        title: 'Optimisation de visibilité',
        description: 'Votre tâche est maintenant visible par tous les prestataires qualifiés dans votre zone.',
        color: '#2196F3'
      });
    }

    if (taskStatus === 'applications') {
      insights.push({
        icon: Activity,
        title: 'Analyse des candidatures',
        description: 'Comparez les profils, tarifs et évaluations pour choisir le meilleur prestataire.',
        color: '#FF9800'
      });
    }

    if (taskStatus === 'in_progress') {
      insights.push({
        icon: Clock,
        title: 'Suivi en temps réel',
        description: 'Suivez l\'avancement de votre tâche et communiquez directement avec le prestataire.',
        color: '#FF7A00'
      });
    }

    return insights;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Tâche introuvable</Text>
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
        <Text style={styles.headerTitle}>Suivi de tâche</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Overview Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.statusIndicator}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
              <Text style={styles.statusText}>{getStatusText()}</Text>
            </View>
            <Text style={styles.progressText}>{getProgressPercentage()}% terminé</Text>
          </View>

          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${getProgressPercentage()}%`,
                    backgroundColor: getStatusColor()
                  }
                ]}
              />
            </View>
          </View>

          <Text style={styles.taskTitle}>{task.title}</Text>
          <Text style={styles.taskDescription}>{task.description}</Text>

          <View style={styles.taskMeta}>
            <View style={styles.metaItem}>
              <MapPin size={16} color="#666" />
              <Text style={styles.metaText}>{task.address?.city || 'Abidjan'}</Text>
            </View>
            <View style={styles.metaItem}>
              <DollarSign size={16} color="#666" />
              <Text style={styles.metaText}>{formatCurrency(task.budget_max || 0)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Calendar size={16} color="#666" />
              <Text style={styles.metaText}>Publié {formatTimeAgo(task.created_at)}</Text>
            </View>
          </View>
        </View>

        {/* Business Insights */}
        {getBusinessInsights().map((insight, index) => (
          <View key={index} style={styles.insightCard}>
            <View style={[styles.insightIcon, { backgroundColor: `${insight.color}20` }]}>
              <insight.icon size={20} color={insight.color} />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>{insight.title}</Text>
              <Text style={styles.insightDescription}>{insight.description}</Text>
            </View>
          </View>
        ))}

        {/* Status-specific content */}
        {taskStatus === 'posted' && (
          <View style={styles.waitingCard}>
            <Clock size={40} color="#2196F3" />
            <Text style={styles.waitingTitle}>En attente de candidatures</Text>
            <Text style={styles.waitingText}>
              Votre tâche est maintenant visible par les prestataires qualifiés. Vous recevrez une notification dès qu'un prestataire postule.
            </Text>
          </View>
        )}

        {selectedProvider && (taskStatus === 'selected' || taskStatus === 'in_progress' || taskStatus === 'completed') && (
          <View style={styles.selectedProviderSection}>
            <Text style={styles.sectionTitle}>Prestataire assigné</Text>

            <View style={styles.providerCard}>
              <Text style={styles.providerName}>{selectedProvider.provider?.full_name}</Text>
              <Text style={styles.providerPrice}>{formatCurrency(selectedProvider.proposed_price)}</Text>

              <View style={styles.providerActions}>
                <TouchableOpacity style={styles.callButton}>
                  <Phone size={16} color="#FFFFFF" />
                  <Text style={styles.callButtonText}>Appeler</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.messageButton}>
                  <MessageCircle size={16} color="#FFFFFF" />
                  <Text style={styles.messageButtonText}>Message</Text>
                </TouchableOpacity>
              </View>

              {taskStatus === 'selected' && profile?.role === 'client' && (
                <TouchableOpacity
                  style={styles.startButton}
                  onPress={handleStartTask}
                >
                  <Text style={styles.startButtonText}>Autoriser le début des travaux</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {showTracking && taskStatus === 'in_progress' && (
          <View style={styles.trackingSection}>
            <Text style={styles.sectionTitle}>Suivi en temps réel</Text>
            <RealTimeTracking
              taskId={task.id}
              userRole={profile?.role === 'client' ? 'client' : 'provider'}
              onEmergency={() => router.push('/emergency-center')}
            />

            {profile?.role === 'client' && (
              <TouchableOpacity
                style={styles.completeButton}
                onPress={handleCompleteTask}
              >
                <CheckCircle size={20} color="#FFFFFF" />
                <Text style={styles.completeButtonText}>Marquer comme terminé</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {taskStatus === 'completed' && (
          <View style={styles.completedCard}>
            <CheckCircle size={60} color="#4CAF50" />
            <Text style={styles.completedTitle}>Tâche terminée avec succès!</Text>
            <Text style={styles.completedText}>
              Félicitations! Votre tâche a été réalisée. N'hésitez pas à évaluer le prestataire pour aider la communauté.
            </Text>

            {profile?.role === 'client' && (
              <TouchableOpacity
                style={styles.rateButton}
                onPress={() => setShowRatingModal(true)}
              >
                <Star size={16} color="#333" />
                <Text style={styles.rateButtonText}>Évaluer le prestataire</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Status History */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Historique de la tâche</Text>
          {statusHistory.map((item, index) => (
            <View key={index} style={styles.historyItem}>
              <View style={styles.historyDot} />
              <View style={styles.historyContent}>
                <Text style={styles.historyStatus}>{item.description}</Text>
                <Text style={styles.historyTime}>{formatTimeAgo(item.timestamp)}</Text>
              </View>
            </View>
          ))}
        </View>

        {taskStatus !== 'completed' && taskStatus !== 'cancelled' && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelTask}
          >
            <AlertTriangle size={16} color="#FF5722" />
            <Text style={styles.cancelButtonText}>Annuler la tâche</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Rating Modal */}
      <Modal
        visible={showRatingModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRatingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Évaluer le prestataire</Text>
            <Text style={styles.modalSubtitle}>
              Comment évaluez-vous la qualité du service?
            </Text>

            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                >
                  <Star
                    size={32}
                    color={star <= rating ? "#FFD700" : "#E0E0E0"}
                    fill={star <= rating ? "#FFD700" : "transparent"}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.commentInput}
              placeholder="Commentaire (optionnel)"
              value={reviewComment}
              onChangeText={setReviewComment}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowRatingModal(false)}
              >
                <Text style={styles.modalCancelText}>Plus tard</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmitButton}
                onPress={handleSubmitRating}
              >
                <Text style={styles.modalSubmitText}>Envoyer l'évaluation</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  taskTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginBottom: 8,
  },
  taskDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  taskMeta: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginLeft: 8,
  },
  insightCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 16,
  },
  waitingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  waitingTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  waitingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  selectedProviderSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  providerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  providerName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  providerPrice: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FF7A00',
    marginBottom: 16,
  },
  providerActions: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    justifyContent: 'center',
  },
  callButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF7A00',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  messageButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  startButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  trackingSection: {
    marginBottom: 20,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  completeButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  completedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completedTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  completedText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  rateButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginLeft: 8,
  },
  historySection: {
    marginBottom: 20,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyStatus: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333',
    marginBottom: 2,
  },
  historyTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEBEE',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 40,
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FF5722',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlignVertical: 'top',
    marginBottom: 24,
    minHeight: 80,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  modalSubmitButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#FF7A00',
    alignItems: 'center',
  },
  modalSubmitText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});