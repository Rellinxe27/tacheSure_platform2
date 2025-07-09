// app/task-details.tsx - Enhanced with real database integration
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/app/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, MapPin, Clock, DollarSign, User, MessageCircle, Phone, Star, Shield } from 'lucide-react-native';
import TrustBadge from '@/components/TrustBadge';
import SafetyButton from '@/components/SafetyButton';
import PaymentSelector from '@/components/PaymentSelector';
import { formatCurrency, formatTimeAgo } from '@/utils/formatting';
import { useWhatsAppBottomNotification } from '@/components/SnackBar';

export default function TaskDetailsScreen() {
  const router = useRouter();
  const { taskId } = useLocalSearchParams();
  const { user, profile } = useAuth();
  const { showNotification, NotificationComponent } = useWhatsAppBottomNotification();

  const [task, setTask] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (taskId) {
      fetchTaskDetails();
      fetchApplications();
    }
  }, [taskId]);

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
        showNotification('Erreur lors du chargement de la tâche', 'error');
        return;
      }

      setTask(data);
    } catch (error) {
      console.error('Error fetching task:', error);
      showNotification('Erreur lors du chargement de la tâche', 'error');
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
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleSelectProvider = async (application: any) => {
    setSelectedProvider(application);
    setShowPayment(true);
  };

  const handlePaymentMethodSelect = async (method: any) => {
    if (!selectedProvider || !task) return;

    try {
      // Update task with selected provider
      const { error: taskError } = await supabase
        .from('tasks')
        .update({
          provider_id: selectedProvider.provider_id,
          status: 'selected',
          updated_at: new Date().toISOString()
        })
        .eq('id', task.id);

      if (taskError) {
        showNotification('Erreur lors de la sélection du prestataire', 'error');
        return;
      }

      // Update application status
      const { error: appError } = await supabase
        .from('task_applications')
        .update({
          status: 'accepted',
          responded_at: new Date().toISOString()
        })
        .eq('id', selectedProvider.id);

      if (appError) {
        console.error('Error updating application:', appError);
      }

      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          task_id: task.id,
          payer_id: user?.id,
          payee_id: selectedProvider.provider_id,
          amount: selectedProvider.proposed_price,
          payment_method: method.id,
          status: 'pending'
        });

      if (paymentError) {
        console.error('Error creating payment:', paymentError);
      }

      showNotification('Prestataire sélectionné avec succès!', 'success');
      router.push(`/task-status?taskId=${task.id}`);
    } catch (error) {
      console.error('Error selecting provider:', error);
      showNotification('Erreur lors de la sélection', 'error');
    }
  };

  const handleApplyForTask = async () => {
    if (!user || !task) return;

    try {
      const { error } = await supabase
        .from('task_applications')
        .insert({
          task_id: task.id,
          provider_id: user.id,
          proposed_price: task.budget_max || 0,
          message: 'Je suis intéressé par cette tâche',
          status: 'pending',
          applied_at: new Date().toISOString()
        });

      if (error) {
        showNotification('Erreur lors de la candidature', 'error');
        return;
      }

      showNotification('Candidature envoyée avec succès!', 'success');
      fetchApplications(); // Refresh applications
    } catch (error) {
      console.error('Error applying for task:', error);
      showNotification('Erreur lors de la candidature', 'error');
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return '#FF5722';
      case 'emergency': return '#D32F2F';
      case 'normal': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#666';
    }
  };

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'Urgent';
      case 'emergency': return 'Urgence';
      case 'normal': return 'Normal';
      case 'low': return 'Pas urgent';
      default: return 'Normal';
    }
  };

  const canApply = profile?.role === 'provider' &&
    task?.status === 'posted' &&
    !applications.some(app => app.provider_id === user?.id);

  const canSelectProvider = profile?.role === 'client' &&
    task?.client_id === user?.id &&
    task?.status === 'applications';

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

  if (showPayment && selectedProvider) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowPayment(false)}>
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Paiement</Text>
          <SafetyButton />
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.providerSummary}>
            <Image
              source={{ uri: selectedProvider.provider?.avatar_url || 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' }}
              style={styles.providerAvatar}
            />
            <View style={styles.providerInfo}>
              <Text style={styles.providerName}>{selectedProvider.provider?.full_name}</Text>
              <Text style={styles.servicePrice}>{formatCurrency(selectedProvider.proposed_price)}</Text>
            </View>
          </View>

          <PaymentSelector
            amount={selectedProvider.proposed_price}
            onPaymentMethodSelect={handlePaymentMethodSelect}
          />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails de la tâche</Text>
        <SafetyButton />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.taskCard}>
          <View style={styles.taskHeader}>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <View style={[
              styles.urgencyBadge,
              { backgroundColor: getUrgencyColor(task.urgency) }
            ]}>
              <Clock size={12} color="#FFFFFF" />
              <Text style={styles.urgencyText}>{getUrgencyText(task.urgency)}</Text>
            </View>
          </View>

          <Text style={styles.taskDescription}>{task.description}</Text>

          <View style={styles.taskMeta}>
            <View style={styles.metaItem}>
              <MapPin size={16} color="#666" />
              <Text style={styles.metaText}>
                {task.address?.city || 'Abidjan'}, {task.address?.district || ''}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <DollarSign size={16} color="#666" />
              <Text style={styles.metaText}>
                Budget: {formatCurrency(task.budget_min || 0)} - {formatCurrency(task.budget_max || 0)}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <User size={16} color="#666" />
              <Text style={styles.metaText}>{applications.length} candidature(s)</Text>
            </View>
            <View style={styles.metaItem}>
              <Clock size={16} color="#666" />
              <Text style={styles.metaText}>Publié {formatTimeAgo(task.created_at)}</Text>
            </View>
          </View>

          {task.images && task.images.length > 0 && (
            <View style={styles.imagesContainer}>
              <Text style={styles.imagesTitle}>Photos</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {task.images.map((image: string, index: number) => (
                  <Image key={index} source={{ uri: image }} style={styles.taskImage} />
                ))}
              </ScrollView>
            </View>
          )}

          {task.client && (
            <View style={styles.clientInfo}>
              <Text style={styles.clientTitle}>Publié par</Text>
              <View style={styles.clientRow}>
                <Image
                  source={{ uri: task.client.avatar_url || 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop' }}
                  style={styles.clientAvatar}
                />
                <View style={styles.clientDetails}>
                  <Text style={styles.clientName}>{task.client.full_name}</Text>
                  {task.client.trust_score && (
                    <TrustBadge
                      trustScore={task.client.trust_score}
                      verificationLevel={task.client.verification_level}
                      isVerified={task.client.is_verified}
                      size="small"
                    />
                  )}
                </View>
              </View>
            </View>
          )}

          {canApply && (
            <TouchableOpacity style={styles.applyButton} onPress={handleApplyForTask}>
              <Text style={styles.applyButtonText}>Postuler pour cette tâche</Text>
            </TouchableOpacity>
          )}
        </View>

        {applications.length > 0 && canSelectProvider && (
          <View style={styles.applicationsSection}>
            <Text style={styles.sectionTitle}>Candidatures reçues</Text>

            {applications.map((application) => (
              <View key={application.id} style={styles.applicationCard}>
                <View style={styles.applicationHeader}>
                  <Image
                    source={{ uri: application.provider?.avatar_url || 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&fit=crop' }}
                    style={styles.avatar}
                  />
                  <View style={styles.applicationDetails}>
                    <View style={styles.applicationNameRow}>
                      <Text style={styles.providerName}>{application.provider?.full_name}</Text>
                      {application.provider && (
                        <TrustBadge
                          trustScore={application.provider.trust_score || 0}
                          verificationLevel={application.provider.verification_level}
                          isVerified={application.provider.is_verified}
                          size="small"
                        />
                      )}
                    </View>
                    <Text style={styles.experience}>
                      Membre depuis {formatTimeAgo(application.provider?.created_at)}
                    </Text>
                  </View>
                </View>

                <View style={styles.applicationInfo}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Prix proposé:</Text>
                    <Text style={styles.price}>{formatCurrency(application.proposed_price)}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Temps estimé:</Text>
                    <Text style={styles.infoValue}>{application.estimated_duration || 'À définir'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Candidature:</Text>
                    <Text style={styles.infoValue}>{formatTimeAgo(application.applied_at)}</Text>
                  </View>
                </View>

                {application.message && (
                  <Text style={styles.applicationMessage}>{application.message}</Text>
                )}

                <View style={styles.applicationActions}>
                  <TouchableOpacity style={styles.contactButton}>
                    <MessageCircle size={16} color="#666" />
                    <Text style={styles.contactButtonText}>Message</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.callButton}>
                    <Phone size={16} color="#666" />
                    <Text style={styles.callButtonText}>Appeler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.selectButton}
                    onPress={() => handleSelectProvider(application)}
                  >
                    <Text style={styles.selectButtonText}>Sélectionner</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {applications.length > 0 && !canSelectProvider && profile?.role === 'provider' && (
          <View style={styles.applicationsSection}>
            <Text style={styles.sectionTitle}>Autres candidatures</Text>
            <Text style={styles.applicationsCount}>
              {applications.length} prestataire(s) ont postulé pour cette tâche
            </Text>
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
      taskCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      marginTop: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
      taskHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
      taskTitle: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: '#333',
      flex: 1,
      marginRight: 12,
    },
      urgencyBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
      urgencyText: {
      fontSize: 10,
      fontFamily: 'Inter-SemiBold',
      color: '#FFFFFF',
      marginLeft: 4,
    },
      taskDescription: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: '#666',
      lineHeight: 20,
      marginBottom: 16,
    },
      taskMeta: {
      marginBottom: 16,
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
      imagesContainer: {
      marginBottom: 16,
    },
      imagesTitle: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: '#333',
      marginBottom: 12,
    },
      taskImage: {
      width: 120,
      height: 80,
      borderRadius: 8,
      marginRight: 12,
    },
      clientInfo: {
      marginBottom: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: '#E0E0E0',
    },
      clientTitle: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: '#333',
      marginBottom: 8,
    },
      clientRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
      clientAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
    },
      clientDetails: {
      flex: 1,
    },
      clientName: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: '#333',
      marginBottom: 4,
    },
      applyButton: {
      backgroundColor: '#4CAF50',
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 16,
    },
      applyButtonText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: '#FFFFFF',
    },
      applicationsSection: {
      marginBottom: 40,
    },
      sectionTitle: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      color: '#333',
      marginBottom: 16,
    },
      applicationsCount: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: '#666',
      textAlign: 'center',
      backgroundColor: '#FFFFFF',
      padding: 20,
      borderRadius: 12,
    },
      applicationCard: {
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
      applicationHeader: {
      flexDirection: 'row',
      marginBottom: 12,
    },
      avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      marginRight: 12,
    },
      applicationDetails: {
      flex: 1,
    },
      applicationNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
      providerName: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: '#333',
      marginRight: 8,
    },
      experience: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: '#666',
    },
      applicationInfo: {
      marginBottom: 12,
    },
      infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
      infoLabel: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: '#666',
    },
      price: {
      fontSize: 12,
      fontFamily: 'Inter-Bold',
      color: '#FF7A00',
    },
      infoValue: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      color: '#333',
    },
      applicationMessage: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: '#666',
      fontStyle: 'italic',
      marginBottom: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: '#F8F9FA',
      borderRadius: 8,
    },
      applicationActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
      contactButton: {
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
      contactButtonText: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      color: '#666',
      marginLeft: 4,
    },
      callButton: {
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
      callButtonText: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      color: '#666',
      marginLeft: 4,
    },
      selectButton: {
      backgroundColor: '#FF7A00',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
      selectButtonText: {
      fontSize: 12,
      fontFamily: 'Inter-SemiBold',
      color: '#FFFFFF',
    },
      providerSummary: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      marginTop: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
      providerAvatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: 12,
    },
      providerInfo: {
      flex: 1,
    },
      servicePrice: {
      fontSize: 16,
      fontFamily: 'Inter-Bold',
      color: '#FF7A00',
      marginTop: 4,
    },
    });