import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { ChartBar as BarChart3, Users, Shield, TriangleAlert as AlertTriangle, DollarSign, TrendingUp, Eye, CircleCheck as CheckCircle, Circle as XCircle } from 'lucide-react-native';

export default function AdminScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  const stats = {
    totalUsers: 1247,
    activeProviders: 89,
    pendingVerifications: 12,
    totalTransactions: 45678000,
    safetyIncidents: 3,
    completedTasks: 892,
    averageRating: 4.7,
    platformRevenue: 2283900
  };

  const pendingVerifications = [
    {
      id: '1',
      name: 'Kouadio Marie',
      type: 'provider',
      submittedAt: '2024-01-15 14:30',
      documents: ['CNI', 'Casier judiciaire'],
      status: 'pending'
    },
    {
      id: '2',
      name: 'Bakary Traoré',
      type: 'provider',
      submittedAt: '2024-01-15 12:15',
      documents: ['CNI', 'Références'],
      status: 'pending'
    }
  ];

  const recentIncidents = [
    {
      id: '1',
      type: 'safety',
      description: 'Signalement de comportement inapproprié',
      reportedBy: 'Client anonyme',
      provider: 'Jean Kouassi',
      status: 'investigating',
      priority: 'high',
      createdAt: '2024-01-15 16:45'
    },
    {
      id: '2',
      type: 'payment',
      description: 'Litige de paiement - service non rendu',
      reportedBy: 'Marie Diabaté',
      provider: 'Yves Konan',
      status: 'resolved',
      priority: 'medium',
      createdAt: '2024-01-15 14:20'
    }
  ];

  const handleVerificationAction = (verificationId: string, action: 'approve' | 'reject') => {
    Alert.alert(
      action === 'approve' ? 'Approuver la vérification' : 'Rejeter la vérification',
      `Êtes-vous sûr de vouloir ${action === 'approve' ? 'approuver' : 'rejeter'} cette demande?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: action === 'approve' ? 'Approuver' : 'Rejeter',
          onPress: () => {
            Alert.alert('Succès', `Vérification ${action === 'approve' ? 'approuvée' : 'rejetée'} avec succès`);
          }
        }
      ]
    );
  };

  const handleIncidentAction = (incidentId: string, action: string) => {
    Alert.alert('Action effectuée', `Action "${action}" appliquée à l'incident ${incidentId}`);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#FF5722';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#666';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return '#4CAF50';
      case 'investigating': return '#FF9800';
      case 'pending': return '#2196F3';
      default: return '#666';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Administration</Text>
        <View style={styles.periodSelector}>
          {['today', 'week', 'month'].map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.activePeriodButton
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.activePeriodButtonText
              ]}>
                {period === 'today' ? 'Aujourd\'hui' : period === 'week' ? 'Semaine' : 'Mois'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Users size={24} color="#2196F3" />
            <Text style={styles.statValue}>{stats.totalUsers.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Utilisateurs totaux</Text>
          </View>
          
          <View style={styles.statCard}>
            <Shield size={24} color="#4CAF50" />
            <Text style={styles.statValue}>{stats.activeProviders}</Text>
            <Text style={styles.statLabel}>Prestataires actifs</Text>
          </View>
          
          <View style={styles.statCard}>
            <AlertTriangle size={24} color="#FF9800" />
            <Text style={styles.statValue}>{stats.pendingVerifications}</Text>
            <Text style={styles.statLabel}>Vérifications en attente</Text>
          </View>
          
          <View style={styles.statCard}>
            <DollarSign size={24} color="#FF7A00" />
            <Text style={styles.statValue}>{(stats.platformRevenue / 1000000).toFixed(1)}M</Text>
            <Text style={styles.statLabel}>Revenus (FCFA)</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Vérifications en attente</Text>
            <TouchableOpacity>
              <Eye size={20} color="#666" />
            </TouchableOpacity>
          </View>
          
          {pendingVerifications.map((verification) => (
            <View key={verification.id} style={styles.verificationCard}>
              <View style={styles.verificationHeader}>
                <View>
                  <Text style={styles.verificationName}>{verification.name}</Text>
                  <Text style={styles.verificationDate}>Soumis le {verification.submittedAt}</Text>
                </View>
                <View style={styles.verificationActions}>
                  <TouchableOpacity
                    style={styles.approveButton}
                    onPress={() => handleVerificationAction(verification.id, 'approve')}
                  >
                    <CheckCircle size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={() => handleVerificationAction(verification.id, 'reject')}
                  >
                    <XCircle size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.documentsContainer}>
                <Text style={styles.documentsLabel}>Documents soumis:</Text>
                <View style={styles.documentsList}>
                  {verification.documents.map((doc, index) => (
                    <View key={index} style={styles.documentTag}>
                      <Text style={styles.documentText}>{doc}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Incidents récents</Text>
            <TouchableOpacity>
              <TrendingUp size={20} color="#666" />
            </TouchableOpacity>
          </View>
          
          {recentIncidents.map((incident) => (
            <View key={incident.id} style={styles.incidentCard}>
              <View style={styles.incidentHeader}>
                <View style={styles.incidentInfo}>
                  <View style={styles.incidentTitleRow}>
                    <Text style={styles.incidentType}>
                      {incident.type === 'safety' ? '🛡️ Sécurité' : '💰 Paiement'}
                    </Text>
                    <View style={[
                      styles.priorityBadge,
                      { backgroundColor: getPriorityColor(incident.priority) }
                    ]}>
                      <Text style={styles.priorityText}>
                        {incident.priority === 'high' ? 'Urgent' : 
                         incident.priority === 'medium' ? 'Moyen' : 'Faible'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.incidentDescription}>{incident.description}</Text>
                  <Text style={styles.incidentMeta}>
                    Signalé par {incident.reportedBy} • {incident.createdAt}
                  </Text>
                </View>
                
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(incident.status) }
                ]}>
                  <Text style={styles.statusText}>
                    {incident.status === 'resolved' ? 'Résolu' : 
                     incident.status === 'investigating' ? 'En cours' : 'En attente'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.incidentActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleIncidentAction(incident.id, 'investigate')}
                >
                  <Text style={styles.actionButtonText}>Enquêter</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleIncidentAction(incident.id, 'contact')}
                >
                  <Text style={styles.actionButtonText}>Contacter</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.resolveButton]}
                  onPress={() => handleIncidentAction(incident.id, 'resolve')}
                >
                  <Text style={[styles.actionButtonText, styles.resolveButtonText]}>Résoudre</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Métriques de performance</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{stats.completedTasks}</Text>
              <Text style={styles.metricLabel}>Tâches complétées</Text>
              <Text style={styles.metricChange}>+12% cette semaine</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{stats.averageRating}</Text>
              <Text style={styles.metricLabel}>Note moyenne</Text>
              <Text style={styles.metricChange}>+0.2 ce mois</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{stats.safetyIncidents}</Text>
              <Text style={styles.metricLabel}>Incidents sécurité</Text>
              <Text style={[styles.metricChange, styles.negativeChange]}>-2 cette semaine</Text>
            </View>
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
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginBottom: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activePeriodButton: {
    backgroundColor: '#FF7A00',
  },
  periodButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  activePeriodButtonText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    marginTop: 20,
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
  verificationCard: {
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
  verificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  verificationName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  verificationDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 2,
  },
  verificationActions: {
    flexDirection: 'row',
  },
  approveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    padding: 8,
    marginRight: 8,
  },
  rejectButton: {
    backgroundColor: '#FF5722',
    borderRadius: 20,
    padding: 8,
  },
  documentsContainer: {
    marginTop: 8,
  },
  documentsLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginBottom: 8,
  },
  documentsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  documentTag: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  documentText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  incidentCard: {
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
  incidentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  incidentInfo: {
    flex: 1,
    marginRight: 12,
  },
  incidentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  incidentType: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginRight: 12,
  },
  priorityBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  priorityText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  incidentDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
  incidentMeta: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#999',
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  incidentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  actionButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  resolveButton: {
    backgroundColor: '#4CAF50',
  },
  resolveButtonText: {
    color: '#FFFFFF',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#333',
  },
  metricLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  metricChange: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#4CAF50',
    marginTop: 4,
  },
  negativeChange: {
    color: '#FF5722',
  },
});