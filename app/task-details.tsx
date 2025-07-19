// app/task-details.tsx - Enhanced UI with real-time updates
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/app/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, MapPin, Clock, DollarSign, User, MessageCircle, Phone, Star, Shield, Edit, Trash2, Eye, Heart, Award, Zap, Users } from 'lucide-react-native';
import TrustBadge from '@/components/TrustBadge';
import SafetyButton from '@/components/SafetyButton';
import PaymentSelector from '@/components/PaymentSelector';
import { formatCurrency, formatTimeAgo } from '@/utils/formatting';
import { useDynamicIslandNotification } from '@/components/SnackBar';
import { LinearGradient } from 'expo-linear-gradient';

export default function TaskDetailsScreen() {
  const router = useRouter();
  const { taskId } = useLocalSearchParams();
  const { user, profile } = useAuth();
  const { showNotification, NotificationComponent } = useDynamicIslandNotification();

  const [task, setTask] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applicantCount, setApplicantCount] = useState(0);

  useEffect(() => {
    if (taskId) {
      fetchTaskDetails();
      fetchApplications();
      setupRealTimeSubscriptions();
    }
  }, [taskId]);

  const setupRealTimeSubscriptions = () => {
    // Real-time subscription for applications
    const applicationsSubscription = supabase
      .channel(`applications-${taskId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'task_applications',
          filter: `task_id=eq.${taskId}`
        },
        (payload) => {
          console.log('Application change:', payload);
          if (payload.eventType === 'INSERT') {
            // Show notification only to task owner
            if (payload.new.provider_id !== user?.id && task?.client_id === user?.id) {
              showNotification('Nouvelle candidature reçue!', 'info');
            }
            // Fetch fresh data to get accurate count
            fetchApplications();
          } else if (payload.eventType === 'DELETE') {
            // Handle application withdrawal
            fetchApplications();
          } else {
            fetchApplications();
          }
        }
      )
      .subscribe();

    // Real-time subscription for task updates
    const taskSubscription = supabase
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
          console.log('Task updated:', payload);
          setTask(prevTask => ({
            ...prevTask,
            ...payload.new,
          }));
          // Update applicant count from task data
          setApplicantCount(payload.new.applicant_count || 0);
        }
      )
      .subscribe();

    return () => {
      applicationsSubscription.unsubscribe();
      taskSubscription.unsubscribe();
    };
  };

  const fetchTaskDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          client:profiles!tasks_client_id_fkey(*),
          category:categories(*)
        `)
        .eq('id', taskId)
        .single();

      if (error) {
        console.error('Error fetching task:', error);
        showNotification('Erreur lors du chargement', 'error');
        return;
      }

      setTask(data);
      setApplicantCount(data.applicant_count || 0);
    } catch (error) {
      console.error('Error fetching task:', error);
      showNotification('Erreur lors du chargement', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('task_applications')
        .select(`
          *,
          provider:profiles!task_applications_provider_id_fkey(*)
        `)
        .eq('task_id', taskId)
        .order('applied_at', { ascending: false });

      if (error) {
        console.error('Error fetching applications:', error);
        return;
      }

      setApplications(data || []);

      // Update applicant count with real count
      const realCount = data?.length || 0;
      setApplicantCount(realCount);

      // Update task applicant_count in database if different and user is task owner
      if (task && realCount !== task.applicant_count && task.client_id === user?.id) {
        const newStatus = realCount > 0 ? 'applications' : 'posted';

        const { error: updateError } = await supabase
          .from('tasks')
          .update({
            applicant_count: realCount,
            status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', taskId);

        if (updateError) {
          console.error('Error updating task count:', updateError);
        } else {
          // Update local task state
          setTask(prev => ({
            ...prev,
            applicant_count: realCount,
            status: newStatus
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleApplyForTask = async () => {
    if (!user || !task) {
      showNotification('Erreur: données manquantes', 'error');
      return;
    }

    const existingApplication = applications.find(app => app.provider_id === user.id);
    if (existingApplication) {
      showNotification('Vous avez déjà postulé', 'warning');
      return;
    }

    try {
      // Optimistic UI update
      const optimisticApplication = {
        id: 'temp-' + Date.now(),
        task_id: task.id,
        provider_id: user.id,
        proposed_price: task.budget_max || task.budget_min || 0,
        message: 'Je suis intéressé par cette tâche et disponible pour intervenir.',
        status: 'pending',
        applied_at: new Date().toISOString(),
        provider: profile
      };

      // Update UI immediately
      setApplications(prev => [optimisticApplication, ...prev]);
      setApplicantCount(prev => prev + 1);

      // Update task status immediately
      setTask(prev => ({
        ...prev,
        status: 'applications',
        applicant_count: (prev.applicant_count || 0) + 1
      }));

      // Insert to database
      const { data, error } = await supabase
        .from('task_applications')
        .insert({
          task_id: task.id,
          provider_id: user.id,
          proposed_price: task.budget_max || task.budget_min || 0,
          message: 'Je suis intéressé par cette tâche et disponible pour intervenir.',
          status: 'pending',
          tools_included: true,
          materials_included: false,
          insurance_covered: true,
          applied_at: new Date().toISOString()
        })
        .select(`
          *,
          provider:profiles!task_applications_provider_id_fkey(*)
        `)
        .single();

      if (error) {
        // Revert optimistic updates
        setApplications(prev => prev.filter(app => app.id !== optimisticApplication.id));
        setApplicantCount(prev => Math.max(0, prev - 1));
        setTask(prev => ({
          ...prev,
          status: prev.applicant_count > 1 ? 'applications' : 'posted',
          applicant_count: Math.max(0, (prev.applicant_count || 1) - 1)
        }));

        console.error('Database error:', error);
        showNotification(`Erreur: ${error.message}`, 'error');
        return;
      }

      // Replace optimistic with real data
      setApplications(prev => prev.map(app =>
        app.id === optimisticApplication.id ? data : app
      ));

      // Update task with real applicant count
      const newCount = (task.applicant_count || 0) + 1;
      await supabase
        .from('tasks')
        .update({
          applicant_count: newCount,
          status: 'applications',
          updated_at: new Date().toISOString()
        })
        .eq('id', task.id);

      showNotification('Candidature envoyée avec succès!', 'success');
    } catch (error) {
      console.error('Unexpected error:', error);
      showNotification('Erreur inattendue', 'error');
    }
  };

  const handleSelectProvider = async (application: any) => {
    try {
      // Update task to assign the selected provider
      const { error: taskError } = await supabase
        .from('tasks')
        .update({
          provider_id: application.provider_id,
          status: 'selected',
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (taskError) throw taskError;

      // Update the application status to accepted
      const { error: appError } = await supabase
        .from('task_applications')
        .update({
          status: 'accepted',
          responded_at: new Date().toISOString()
        })
        .eq('id', application.id);

      if (appError) throw appError;

      // Reject other applications
      const { error: rejectError } = await supabase
        .from('task_applications')
        .update({
          status: 'rejected',
          responded_at: new Date().toISOString()
        })
        .eq('task_id', taskId)
        .neq('id', application.id);

      if (rejectError) throw rejectError;

      // Create notification for selected provider
      await supabase
        .from('notifications')
        .insert({
          user_id: application.provider_id,
          title: 'Félicitations! Vous avez été sélectionné',
          message: `Votre candidature pour "${task.title}" a été acceptée`,
          type: 'task_update',
          data: {
            task_id: taskId,
            client_name: task.client?.full_name,
            task_title: task.title
          },
          action_url: `/task-status/${taskId}`,
          created_at: new Date().toISOString()
        });

      // Update local state
      setTask(prev => ({
        ...prev,
        provider_id: application.provider_id,
        status: 'selected'
      }));

      showNotification('Prestataire sélectionné avec succès!', 'success');

      // Navigate to payment or task management
      router.push(`/task-status?taskId=${taskId}`);

    } catch (error) {
      console.error('Error selecting provider:', error);
      showNotification('Erreur lors de la sélection', 'error');
    }
  };

  const handleViewProfile = (providerId: string) => {
    router.push(`/provider-profile?id=${providerId}`);
  };

  const getProviderRating = (provider: any) => {
    // Mock rating calculation - in real app, fetch from reviews table
    const baseRating = 4.2;
    const variance = (provider?.trust_score || 50) / 100 * 1.3;
    return Math.min(5, baseRating + variance);
  };

  const getProviderReviewCount = (provider: any) => {
    // Mock review count based on trust score
    return Math.floor((provider?.trust_score || 0) / 10) + Math.floor(Math.random() * 20);
  };

  const getTrustLevelLabel = (trustScore: number) => {
    if (trustScore >= 95) return 'Expert Elite';
    if (trustScore >= 85) return 'Pro Certifié';
    if (trustScore >= 75) return 'Confirmé';
    if (trustScore >= 60) return 'Qualifié';
    return 'Débutant';
  };

  const getTrustLevelColor = (trustScore: number) => {
    if (trustScore >= 95) return '#FFD700';
    if (trustScore >= 85) return '#4CAF50';
    if (trustScore >= 75) return '#2196F3';
    if (trustScore >= 60) return '#FF9800';
    return '#FF5722';
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
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isTaskOwner = profile?.role === 'client' && task?.client_id === user?.id;
  const canApply = profile?.role === 'provider' &&
    (task?.status === 'posted' || task?.status === 'applications') &&
    !applications.some(app => app.provider_id === user?.id);

  return (
    <View style={styles.container}>
      <NotificationComponent />

      {/* Enhanced Header */}
      <LinearGradient
        colors={['#FF7A00', '#FF9500']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Détails de la tâche</Text>
          <View style={styles.headerActions}>
            {isTaskOwner && (task.status === 'posted' || task.status === 'applications') && (
              <>
                <TouchableOpacity style={styles.headerButton} onPress={() => router.push(`/task-edit?taskId=${taskId}`)}>
                  <Edit size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerButton} onPress={() => {
                  Alert.alert('Supprimer', 'Confirmer la suppression?', [
                    { text: 'Annuler', style: 'cancel' },
                    { text: 'Supprimer', style: 'destructive', onPress: async () => {
                        await supabase.from('tasks').delete().eq('id', taskId);
                        router.back();
                      }}
                  ]);
                }}>
                  <Trash2 size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </>
            )}
            <SafetyButton />
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Enhanced Task Card */}
        <View style={styles.taskCard}>
          <View style={styles.taskHeader}>
            <View style={styles.titleRow}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <View style={[
                styles.urgencyBadge,
                { backgroundColor: task.urgency === 'emergency' ? '#FF5722' : '#FF9800' }
              ]}>
                <Zap size={12} color="#FFFFFF" />
                <Text style={styles.urgencyText}>
                  {task.urgency === 'emergency' ? 'URGENCE' : 'PRIORITÉ'}
                </Text>
              </View>
            </View>

            {/* Enhanced Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statChip}>
                <Users size={14} color="#FF7A00" />
                <Text style={styles.statText}>{applicantCount} candidat{applicantCount > 1 ? 's' : ''}</Text>
              </View>
              <View style={styles.statChip}>
                <Eye size={14} color="#666" />
                <Text style={styles.statText}>{task.views_count || 0} vues</Text>
              </View>
              <View style={styles.statChip}>
                <Clock size={14} color="#666" />
                <Text style={styles.statText}>{formatTimeAgo(task.created_at)}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.taskDescription}>{task.description}</Text>

          {/* Enhanced Meta Info */}
          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <MapPin size={16} color="#FF7A00" />
              <Text style={styles.metaText}>
                {task.address?.city || 'Abidjan'}, {task.address?.district || ''}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <DollarSign size={16} color="#4CAF50" />
              <Text style={styles.metaText}>
                {formatCurrency(task.budget_min || 0)} - {formatCurrency(task.budget_max || 0)}
              </Text>
            </View>
          </View>

          {/* Client Info Section */}
          {task.client && (
            <View style={styles.clientSection}>
              <Text style={styles.sectionTitle}>Publié par</Text>
              <TouchableOpacity
                style={styles.clientCard}
                onPress={() => router.push(`/client-profile?clientId=${task.client.id}`)}
              >
                <Image
                  source={{ uri: task.client.avatar_url || 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop' }}
                  style={styles.clientAvatar}
                />
                <View style={styles.clientInfo}>
                  <Text style={styles.clientName}>{task.client.full_name}</Text>
                  <View style={styles.trustContainer}>
                    <View style={[
                      styles.trustBadge,
                      { backgroundColor: getTrustLevelColor(task.client.trust_score || 0) }
                    ]}>
                      <Text style={styles.trustScore}>{task.client.trust_score || 0}%</Text>
                    </View>
                    <Text style={styles.trustLabel}>
                      {getTrustLevelLabel(task.client.trust_score || 0)}
                    </Text>
                  </View>
                </View>
                <Shield size={16} color={task.client.is_verified ? '#4CAF50' : '#999'} />
              </TouchableOpacity>
            </View>
          )}

          {/* Apply Button */}
          {canApply && (
            <TouchableOpacity style={styles.applyButton} onPress={handleApplyForTask}>
              <Text style={styles.applyButtonText}>Postuler maintenant</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Enhanced Applications Section */}
        {applications.length > 0 && isTaskOwner && (
          <View style={styles.applicationsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Candidatures reçues ({applications.length})
              </Text>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>EN DIRECT</Text>
              </View>
            </View>

            {applications.map((application) => (
              <View key={application.id} style={styles.applicationCard}>
                <TouchableOpacity
                  style={styles.providerHeader}
                  onPress={() => handleViewProfile(application.provider_id)}
                >
                  <Image
                    source={{ uri: application.provider?.avatar_url || 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&fit=crop' }}
                    style={styles.providerAvatar}
                  />
                  <View style={styles.providerInfo}>
                    <View style={styles.providerNameRow}>
                      <Text style={styles.providerName}>{application.provider?.full_name}</Text>
                      <View style={styles.ratingContainer}>
                        <Star size={14} color="#FFD700" fill="#FFD700" />
                        <Text style={styles.ratingText}>
                          {getProviderRating(application.provider).toFixed(1)}
                        </Text>
                        <Text style={styles.reviewCount}>
                          ({getProviderReviewCount(application.provider)})
                        </Text>
                      </View>
                    </View>

                    <View style={styles.providerMeta}>
                      <View style={[
                        styles.trustBadge,
                        { backgroundColor: getTrustLevelColor(application.provider?.trust_score || 0) }
                      ]}>
                        <Text style={styles.trustScore}>{application.provider?.trust_score || 0}%</Text>
                      </View>
                      <Text style={styles.trustLabel}>
                        {getTrustLevelLabel(application.provider?.trust_score || 0)}
                      </Text>
                      {application.provider?.is_verified && (
                        <Shield size={14} color="#4CAF50" />
                      )}
                    </View>
                  </View>
                  <Text style={styles.viewProfileText}>Voir profil →</Text>
                </TouchableOpacity>

                <View style={styles.applicationDetails}>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Prix proposé:</Text>
                    <Text style={styles.priceValue}>{formatCurrency(application.proposed_price)}</Text>
                  </View>

                  {application.message && (
                    <Text style={styles.applicationMessage}>{application.message}</Text>
                  )}

                  <View style={styles.applicationMeta}>
                    <Text style={styles.metaText}>
                      Postulé {formatTimeAgo(application.applied_at)}
                    </Text>
                    {application.estimated_duration && (
                      <Text style={styles.metaText}>
                        Durée: {application.estimated_duration}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.contactButton}
                    onPress={() => router.push(`/chat?providerId=${application.provider_id}`)}
                  >
                    <MessageCircle size={16} color="#666" />
                    <Text style={styles.contactButtonText}>Message</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.callButton}
                    onPress={() => Linking.openURL(`tel:${application.provider?.phone}`)}
                  >
                    <Phone size={16} color="#666" />
                    <Text style={styles.callButtonText}>Appeler</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.selectButton}
                    onPress={() => handleSelectProvider(application)}
                  >
                    <Award size={16} color="#FFFFFF" />
                    <Text style={styles.selectButtonText}>Sélectionner</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
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
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#FF7A00',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginRight: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  taskHeader: {
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  taskTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#333',
    flex: 1,
    marginRight: 12,
    lineHeight: 28,
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  urgencyText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 12,
  },
  statText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginLeft: 4,
  },
  taskDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#555',
    lineHeight: 24,
    marginBottom: 20,
  },
  metaGrid: {
    marginBottom: 24,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginLeft: 12,
  },
  clientSection: {
    marginBottom: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 12,
  },
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
  },
  clientAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 8,
  },
  trustContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trustBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  trustScore: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  trustLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#666',
  },
  applyButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  applyButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  applicationsSection: {
    marginBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF5722',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: 6,
  },
  liveText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  applicationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  providerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  providerInfo: {
    flex: 1,
  },
  providerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  providerName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginLeft: 2,
  },
  providerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewProfileText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FF7A00',
  },
  applicationDetails: {
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  priceValue: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#4CAF50',
  },
  applicationMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    fontStyle: 'italic',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  applicationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    borderRadius: 12,
  },
  contactButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginLeft: 6,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FD',
    paddingVertical: 12,
    borderRadius: 12,
  },
  callButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#2196F3',
    marginLeft: 6,
  },
  selectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF7A00',
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  selectButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginLeft: 6,
  },
});