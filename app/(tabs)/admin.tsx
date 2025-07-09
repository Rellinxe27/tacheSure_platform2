// app/(tabs)/admin.tsx (Updated with real data integration)
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { ChartBar as BarChart3, Users, Shield, TriangleAlert as AlertTriangle, DollarSign, TrendingUp, Eye, CircleCheck as CheckCircle, Circle as XCircle } from 'lucide-react-native';
import { useAuth } from '@/app/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import RoleBasedAccess from '@/components/RoleBasedAccess';

interface AdminStats {
  totalUsers: number;
  activeProviders: number;
  pendingVerifications: number;
  totalTransactions: number;
  safetyIncidents: number;
  completedTasks: number;
  averageRating: number;
  platformRevenue: number;
}

interface PendingVerification {
  id: string;
  user_id: string;
  full_name: string;
  document_type: string;
  verification_status: string;
  created_at: string;
  documents: string[];
}

interface SafetyIncident {
  id: string;
  incident_type: string;
  priority: string;
  title: string;
  description: string;
  status: string;
  reporter_name: string;
  reported_user_name: string;
  created_at: string;
}

export default function AdminScreen() {
  const { profile } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeProviders: 0,
    pendingVerifications: 0,
    totalTransactions: 0,
    safetyIncidents: 0,
    completedTasks: 0,
    averageRating: 0,
    platformRevenue: 0
  });
  const [pendingVerifications, setPendingVerifications] = useState<PendingVerification[]>([]);
  const [recentIncidents, setRecentIncidents] = useState<SafetyIncident[]>([]);

  useEffect(() => {
    if (profile?.role === 'admin' || profile?.role === 'moderator') {
      fetchAdminData();
    }
  }, [profile, selectedPeriod]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchStats(),
        fetchPendingVerifications(),
        fetchRecentIncidents()
      ]);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      Alert.alert('Erreur', 'Impossible de charger les données administratives');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Get total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get active providers
      const { count: activeProviders } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'provider')
        .eq('is_active', true);

      // Get pending verifications
      const { count: pendingVerifications } = await supabase
        .from('verification_documents')
        .select('*', { count: 'exact', head: true })
        .eq('verification_status', 'pending');

      // Get completed tasks
      const { count: completedTasks } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      // Get safety incidents
      const { count: safetyIncidents } = await supabase
        .from('safety_incidents')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');

      // Get platform revenue (sum of completed payments)
      const { data: revenueData } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'completed');

      const totalTransactions = revenueData?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
      const platformRevenue = totalTransactions * 0.08; // 8% commission

      // Get average rating
      const { data: ratingsData } = await supabase
        .from('reviews')
        .select('rating');

      const averageRating = ratingsData?.length
        ? ratingsData.reduce((sum, review) => sum + review.rating, 0) / ratingsData.length
        : 0;

      setStats({
        totalUsers: totalUsers || 0,
        activeProviders: activeProviders || 0,
        pendingVerifications: pendingVerifications || 0,
        totalTransactions,
        safetyIncidents: safetyIncidents || 0,
        completedTasks: completedTasks || 0,
        averageRating: Math.round(averageRating * 10) / 10,
        platformRevenue
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchPendingVerifications = async () => {
    try {
      const { data, error } = await supabase
        .from('verification_documents')
        .select(`
          id,
          user_id,
          document_type,
          verification_status,
          created_at,
          profiles!inner (
            full_name
          )
        `)
        .eq('verification_status', 'pending')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const formattedData = data?.map(item => ({
        id: item.id,
        user_id: item.user_id,
        full_name: (item.profiles as any)?.full_name || 'Utilisateur inconnu',
        document_type: item.document_type,
        verification_status: item.verification_status,
        created_at: item.created_at,
        documents: [item.document_type] // Simplified for display
      })) || [];

      setPendingVerifications(formattedData);
    } catch (error) {
      console.error('Error fetching pending verifications:', error);
    }
  };

  const fetchRecentIncidents = async () => {
    try {
      const { data, error } = await supabase
        .from('safety_incidents')
        .select(`
          id,
          incident_type,
          priority,
          title,
          description,
          status,
          created_at,
          reporter:profiles!reporter_id (full_name),
          reported_user:profiles!reported_user_id (full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const formattedData = data?.map(incident => ({
        id: incident.id,
        incident_type: incident.incident_type,
        priority: incident.priority,
        title: incident.title,
        description: incident.description,
        status: incident.status,
        reporter_name: (incident.reporter as any)?.full_name || 'Utilisateur anonyme',
        reported_user_name: (incident.reported_user as any)?.full_name || 'Non spécifié',
        created_at: incident.created_at
      })) || [];

      setRecentIncidents(formattedData);
    } catch (error) {
      console.error('Error fetching recent incidents:', error);
    }
  };

  const handleVerificationAction = async (verificationId: string, action: 'approve' | 'reject') => {
    try {
      const newStatus = action === 'approve' ? 'approved' : 'rejected';

      const { error } = await supabase
        .from('verification_documents')
        .update({
          verification_status: newStatus,
          verified_at: new Date().toISOString(),
          verified_by: profile?.id
        })
        .eq('id', verificationId);

      if (error) throw error;

      Alert.alert(
        'Succès',
        `Vérification ${action === 'approve' ? 'approuvée' : 'rejetée'} avec succès`
      );

      // Refresh data
      fetchPendingVerifications();
      fetchStats();
    } catch (error) {
      console.error('Error updating verification:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour la vérification');
    }
  };

  const handleIncidentAction = async (incidentId: string, action: string) => {
    try {
      let updateData: any = { assigned_to: profile?.id };

      if (action === 'resolve') {
        updateData.status = 'resolved';
        updateData.resolved_at = new Date().toISOString();
        updateData.resolution_notes = 'Résolu par l\'équipe administrative';
      } else if (action === 'investigate') {
        updateData.status = 'investigating';
      }

      const { error } = await supabase
        .from('safety_incidents')
        .update(updateData)
        .eq('id', incidentId);

      if (error) throw error;

      Alert.alert('Succès', `Action "${action}" appliquée avec succès`);
      fetchRecentIncidents();
      fetchStats();
    } catch (error) {
      console.error('Error updating incident:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour l\'incident');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#FF5722';
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
      case 'open': return '#2196F3';
      default: return '#666';
    }
  };

  const getIncidentTypeText = (type: string) => {
    const types: { [key: string]: string } = {
      safety: '🛡️ Sécurité',
      payment: '💰 Paiement',
      behavior: '👤 Comportement',
      fraud: '⚠️ Fraude',
      technical: '🔧 Technique',
      other: '📋 Autre'
    };
    return types[type] || '📋 Autre';
  };

  if (!profile || (profile.role !== 'admin' && profile.role !== 'moderator')) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Accès non autorisé</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.errorText}>
            Vous n'avez pas les permissions nécessaires pour accéder à cette section.
          </Text>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF7A00" />
          <Text style={styles.loadingText}>Chargement des données...</Text>
        </View>
      </View>
    );
  }

  return (
    <RoleBasedAccess allowedRoles={['admin', 'moderator']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Administration</Text>
          <Text style={styles.subtitle}>
            {profile.role === 'admin' ? 'Administrateur' : 'Modérateur'}
          </Text>
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

          {pendingVerifications.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Vérifications en attente</Text>
                <TouchableOpacity onPress={() => fetchPendingVerifications()}>
                  <Eye size={20} color="#666" />
                </TouchableOpacity>
              </View>

              {pendingVerifications.map((verification) => (
                <View key={verification.id} style={styles.verificationCard}>
                  <View style={styles.verificationHeader}>
                    <View>
                      <Text style={styles.verificationName}>{verification.full_name}</Text>
                      <Text style={styles.verificationDate}>
                        Soumis le {new Date(verification.created_at).toLocaleDateString('fr-FR')}
                      </Text>
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
                    <Text style={styles.documentsLabel}>Documents soumiss:</Text>
                    <View style={styles.documentsList}>
                      {verification.documents.map((doc, index) => (
                        <View key={index} style={styles.documentTag}>
                          <Text style={styles.documentText}>{doc.toUpperCase()}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {recentIncidents.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Incidents récents</Text>
                <TouchableOpacity onPress={() => fetchRecentIncidents()}>
                  <TrendingUp size={20} color="#666" />
                </TouchableOpacity>
              </View>

              {recentIncidents.map((incident) => (
                <View key={incident.id} style={styles.incidentCard}>
                  <View style={styles.incidentHeader}>
                    <View style={styles.incidentInfo}>
                      <View style={styles.incidentTitleRow}>
                        <Text style={styles.incidentType}>
                          {getIncidentTypeText(incident.incident_type)}
                        </Text>
                        <View style={[
                          styles.priorityBadge,
                          { backgroundColor: getPriorityColor(incident.priority) }
                        ]}>
                          <Text style={styles.priorityText}>
                            {incident.priority === 'critical' ? 'Critique' :
                              incident.priority === 'high' ? 'Urgent' :
                                incident.priority === 'medium' ? 'Moyen' : 'Faible'}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.incidentDescription}>{incident.description}</Text>
                      <Text style={styles.incidentMeta}>
                        Signalé par {incident.reporter_name} • {new Date(incident.created_at).toLocaleDateString('fr-FR')}
                      </Text>
                    </View>

                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(incident.status) }
                    ]}>
                      <Text style={styles.statusText}>
                        {incident.status === 'resolved' ? 'Résolu' :
                          incident.status === 'investigating' ? 'En cours' : 'Ouvert'}
                      </Text>
                    </View>
                  </View>

                  {incident.status !== 'resolved' && (
                    <View style={styles.incidentActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleIncidentAction(incident.id, 'investigate')}
                      >
                        <Text style={styles.actionButtonText}>Enquêter</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.resolveButton]}
                        onPress={() => handleIncidentAction(incident.id, 'resolve')}
                      >
                        <Text style={[styles.actionButtonText, styles.resolveButtonText]}>Résoudre</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Métriques de performance</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>{stats.completedTasks}</Text>
                <Text style={styles.metricLabel}>Tâches complétées</Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>{stats.averageRating}</Text>
                <Text style={styles.metricLabel}>Note moyenne</Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>{stats.safetyIncidents}</Text>
                <Text style={styles.metricLabel}>Incidents ouverts</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </RoleBasedAccess>
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
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
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
});