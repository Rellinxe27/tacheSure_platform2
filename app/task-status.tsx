import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Clock, User, MapPin, DollarSign, MessageCircle, Phone, CheckCircle, XCircle, AlertTriangle } from 'lucide-react-native';
import RealTimeTracking from '@/components/RealTimeTracking';

interface TaskApplication {
  id: string;
  providerId: string;
  providerName: string;
  price: string;
  estimatedTime: string;
  message: string;
  appliedAt: Date;
  status: 'pending' | 'accepted' | 'rejected';
  rating: number;
  trustScore: number;
}

export default function TaskStatusScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [taskStatus, setTaskStatus] = useState<'posted' | 'applications' | 'selected' | 'in_progress' | 'completed' | 'cancelled'>('posted');
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [showTracking, setShowTracking] = useState(false);

  const task = {
    id: params.taskId || '1',
    title: 'Réparation de plomberie urgente',
    description: 'Fuite d\'eau dans la cuisine, besoin d\'une intervention rapide.',
    budget: '25000',
    location: 'Cocody, Abidjan',
    urgency: 'high',
    postedAt: new Date('2024-01-15T10:00:00'),
    clientName: 'Marie Kouassi'
  };

  const applications: TaskApplication[] = [
    {
      id: '1',
      providerId: '1',
      providerName: 'Kouadio Jean',
      price: '20000',
      estimatedTime: '2 heures',
      message: 'Je peux intervenir immédiatement. J\'ai tout le matériel nécessaire.',
      appliedAt: new Date('2024-01-15T10:30:00'),
      status: 'pending',
      rating: 4.8,
      trustScore: 92
    },
    {
      id: '2',
      providerId: '2',
      providerName: 'Bakary Traoré',
      price: '18000',
      estimatedTime: '3 heures',
      message: 'Plombier expérimenté, disponible cet après-midi.',
      appliedAt: new Date('2024-01-15T11:00:00'),
      status: 'pending',
      rating: 4.6,
      trustScore: 87
    }
  ];

  useEffect(() => {
    // Simulate task status progression
    const timer = setTimeout(() => {
      if (taskStatus === 'posted' && applications.length > 0) {
        setTaskStatus('applications');
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [taskStatus]);

  const handleAcceptProvider = (application: TaskApplication) => {
    Alert.alert(
      'Accepter la candidature',
      `Confirmer ${application.providerName} pour ${application.price} FCFA?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Accepter',
          onPress: () => {
            setSelectedProvider(application);
            setTaskStatus('selected');
            setShowTracking(true);
            Alert.alert('Candidature acceptée', 'Le prestataire a été notifié');
          }
        }
      ]
    );
  };

  const handleRejectProvider = (applicationId: string) => {
    Alert.alert('Candidature rejetée', 'Le prestataire a été notifié');
  };

  const handleStartTask = () => {
    setTaskStatus('in_progress');
    Alert.alert('Tâche commencée', 'Le suivi en temps réel est activé');
  };

  const handleCompleteTask = () => {
    setTaskStatus('completed');
    setShowTracking(false);
    Alert.alert('Tâche terminée', 'Merci de noter le prestataire');
  };

  const handleCancelTask = () => {
    Alert.alert(
      'Annuler la tâche',
      'Êtes-vous sûr de vouloir annuler cette tâche?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: () => {
            setTaskStatus('cancelled');
            Alert.alert('Tâche annulée', 'La tâche a été annulée');
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
      case 'in_progress': return 'En cours';
      case 'completed': return 'Terminée';
      case 'cancelled': return 'Annulée';
      default: return 'Inconnu';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Suivi de tâche</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>

          <Text style={styles.taskTitle}>{task.title}</Text>
          <Text style={styles.taskDescription}>{task.description}</Text>

          <View style={styles.taskMeta}>
            <View style={styles.metaItem}>
              <MapPin size={16} color="#666" />
              <Text style={styles.metaText}>{task.location}</Text>
            </View>
            <View style={styles.metaItem}>
              <DollarSign size={16} color="#666" />
              <Text style={styles.metaText}>{task.budget} FCFA</Text>
            </View>
            <View style={styles.metaItem}>
              <Clock size={16} color="#666" />
              <Text style={styles.metaText}>
                Publié {task.postedAt.toLocaleString('fr-FR')}
              </Text>
            </View>
          </View>
        </View>

        {taskStatus === 'posted' && (
          <View style={styles.waitingCard}>
            <Clock size={40} color="#2196F3" />
            <Text style={styles.waitingTitle}>En attente de candidatures</Text>
            <Text style={styles.waitingText}>
              Votre tâche est publiée. Les prestataires vont bientôt postuler.
            </Text>
          </View>
        )}

        {taskStatus === 'applications' && (
          <View style={styles.applicationsSection}>
            <Text style={styles.sectionTitle}>
              Candidatures reçues ({applications.length})
            </Text>

            {applications.map((application) => (
              <View key={application.id} style={styles.applicationCard}>
                <View style={styles.applicationHeader}>
                  <Text style={styles.providerName}>{application.providerName}</Text>
                  <View style={styles.providerStats}>
                    <Text style={styles.rating}>⭐ {application.rating}</Text>
                    <Text style={styles.trustScore}>🛡️ {application.trustScore}%</Text>
                  </View>
                </View>

                <Text style={styles.applicationMessage}>{application.message}</Text>

                <View style={styles.applicationDetails}>
                  <Text style={styles.price}>{application.price} FCFA</Text>
                  <Text style={styles.estimatedTime}>{application.estimatedTime}</Text>
                </View>

                <View style={styles.applicationActions}>
                  <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={() => handleRejectProvider(application.id)}
                  >
                    <XCircle size={16} color="#FF5722" />
                    <Text style={styles.rejectButtonText}>Rejeter</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.contactButton}>
                    <MessageCircle size={16} color="#666" />
                    <Text style={styles.contactButtonText}>Message</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => handleAcceptProvider(application)}
                  >
                    <CheckCircle size={16} color="#FFFFFF" />
                    <Text style={styles.acceptButtonText}>Accepter</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {(taskStatus === 'selected' || taskStatus === 'in_progress') && selectedProvider && (
          <View style={styles.selectedProviderSection}>
            <Text style={styles.sectionTitle}>Prestataire sélectionné</Text>

            <View style={styles.providerCard}>
              <Text style={styles.providerName}>{selectedProvider.providerName}</Text>
              <Text style={styles.providerPrice}>{selectedProvider.price} FCFA</Text>

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

              {taskStatus === 'selected' && (
                <TouchableOpacity
                  style={styles.startButton}
                  onPress={handleStartTask}
                >
                  <Text style={styles.startButtonText}>Commencer la tâche</Text>
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
              userRole="client"
              onEmergency={() => router.push('/emergency-center')}
            />

            <TouchableOpacity
              style={styles.completeButton}
              onPress={handleCompleteTask}
            >
              <CheckCircle size={20} color="#FFFFFF" />
              <Text style={styles.completeButtonText}>Marquer comme terminé</Text>
            </TouchableOpacity>
          </View>
        )}

        {taskStatus === 'completed' && (
          <View style={styles.completedCard}>
            <CheckCircle size={60} color="#4CAF50" />
            <Text style={styles.completedTitle}>Tâche terminée!</Text>
            <Text style={styles.completedText}>
              Merci d'avoir utilisé TâcheSûre. N'oubliez pas de noter le prestataire.
            </Text>

            <TouchableOpacity style={styles.rateButton}>
              <Text style={styles.rateButtonText}>Noter le prestataire</Text>
            </TouchableOpacity>
          </View>
        )}

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
  waitingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    marginBottom: 20,
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
  applicationsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  applicationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  providerName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  providerStats: {
    flexDirection: 'row',
  },
  rating: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginRight: 8,
  },
  trustScore: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  applicationMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 12,
    lineHeight: 18,
  },
  applicationDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  price: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FF7A00',
  },
  estimatedTime: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  applicationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rejectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    justifyContent: 'center',
  },
  rejectButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FF5722',
    marginLeft: 4,
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
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  acceptButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  selectedProviderSection: {
    marginBottom: 20,
  },
  providerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
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
    padding: 40,
    alignItems: 'center',
    marginBottom: 20,
  },
  completedTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
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
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  rateButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
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
});