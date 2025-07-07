import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { AlertTriangle, Shield, Eye, TrendingUp, Clock, DollarSign, MapPin, User } from 'lucide-react-native';

interface FraudAlert {
  id: string;
  type: 'payment' | 'identity' | 'behavior' | 'location' | 'velocity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  userId: string;
  userName: string;
  timestamp: Date;
  status: 'active' | 'investigating' | 'resolved' | 'false_positive';
  evidence: string[];
  riskScore: number;
}

interface FraudPattern {
  pattern: string;
  detectedCount: number;
  lastDetected: Date;
  preventedLoss: number;
}

interface TransactionRisk {
  transactionId: string;
  amount: number;
  riskScore: number;
  riskFactors: string[];
  recommendation: 'approve' | 'review' | 'block';
}

interface FraudDetectionProps {
  userRole: 'admin' | 'security' | 'provider' | 'client';
  onAlertAction?: (alertId: string, action: string) => void;
}

export default function FraudDetection({ userRole, onAlertAction }: FraudDetectionProps) {
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [patterns, setPatterns] = useState<FraudPattern[]>([]);
  const [riskTransactions, setRiskTransactions] = useState<TransactionRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'critical' | 'investigating'>('all');

  useEffect(() => {
    // Simulate real-time fraud detection data
    setTimeout(() => {
      const mockAlerts: FraudAlert[] = [
        {
          id: 'alert_001',
          type: 'payment',
          severity: 'critical',
          description: 'Tentative de paiement multiple avec différentes cartes',
          userId: 'user_456',
          userName: 'Suspect Account',
          timestamp: new Date(),
          status: 'active',
          evidence: ['Multiple payment attempts', 'Velocity check failed', 'IP mismatch'],
          riskScore: 95
        },
        {
          id: 'alert_002',
          type: 'behavior',
          severity: 'high',
          description: 'Modèle de comportement inhabituel détecté',
          userId: 'user_789',
          userName: 'Jean Dupont',
          timestamp: new Date(Date.now() - 3600000),
          status: 'investigating',
          evidence: ['Unusual activity hours', 'Location inconsistency', 'Task pattern anomaly'],
          riskScore: 78
        },
        {
          id: 'alert_003',
          type: 'identity',
          severity: 'medium',
          description: 'Documents d\'identité potentiellement falsifiés',
          userId: 'user_321',
          userName: 'Marie Koffi',
          timestamp: new Date(Date.now() - 7200000),
          status: 'active',
          evidence: ['OCR confidence low', 'Facial recognition mismatch', 'Document anomalies'],
          riskScore: 68
        }
      ];

      const mockPatterns: FraudPattern[] = [
        {
          pattern: 'Comptes multiples même IP',
          detectedCount: 23,
          lastDetected: new Date(),
          preventedLoss: 450000
        },
        {
          pattern: 'Paiements rapides successifs',
          detectedCount: 15,
          lastDetected: new Date(Date.now() - 3600000),
          preventedLoss: 320000
        },
        {
          pattern: 'Géolocalisation impossible',
          detectedCount: 8,
          lastDetected: new Date(Date.now() - 7200000),
          preventedLoss: 180000
        }
      ];

      const mockRiskTransactions: TransactionRisk[] = [
        {
          transactionId: 'tx_001',
          amount: 150000,
          riskScore: 85,
          riskFactors: ['High amount', 'New provider', 'Rush transaction'],
          recommendation: 'review'
        },
        {
          transactionId: 'tx_002',
          amount: 25000,
          riskScore: 45,
          riskFactors: ['Normal pattern'],
          recommendation: 'approve'
        }
      ];

      setAlerts(mockAlerts);
      setPatterns(mockPatterns);
      setRiskTransactions(mockRiskTransactions);
      setLoading(false);
    }, 1000);

    // Simulate real-time updates
    const interval = setInterval(() => {
      // Add random new alert occasionally
      if (Math.random() > 0.8) {
        const newAlert: FraudAlert = {
          id: `alert_${Date.now()}`,
          type: ['payment', 'behavior', 'identity', 'location'][Math.floor(Math.random() * 4)] as any,
          severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
          description: 'Nouvelle activité suspecte détectée',
          userId: `user_${Math.floor(Math.random() * 1000)}`,
          userName: 'Utilisateur Suspect',
          timestamp: new Date(),
          status: 'active',
          evidence: ['Automated detection'],
          riskScore: Math.floor(Math.random() * 100)
        };
        setAlerts(prev => [newAlert, ...prev.slice(0, 9)]);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const handleAlertAction = (alertId: string, action: 'investigate' | 'resolve' | 'false_positive') => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId
        ? { ...alert, status: action === 'investigate' ? 'investigating' :
            action === 'resolve' ? 'resolved' : 'false_positive' }
        : alert
    ));

    onAlertAction?.(alertId, action);
    Alert.alert('Action effectuée', `Alerte ${action === 'investigate' ? 'en cours d\'investigation' : action === 'resolve' ? 'résolue' : 'marquée comme faux positif'}`);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'payment': return <DollarSign size={20} color="#FF5722" />;
      case 'identity': return <User size={20} color="#FF9800" />;
      case 'behavior': return <TrendingUp size={20} color="#9C27B0" />;
      case 'location': return <MapPin size={20} color="#2196F3" />;
      default: return <AlertTriangle size={20} color="#FF5722" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#D32F2F';
      case 'high': return '#FF5722';
      case 'medium': return '#FF9800';
      case 'low': return '#FFC107';
      default: return '#666';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#FF5722';
      case 'investigating': return '#FF9800';
      case 'resolved': return '#4CAF50';
      case 'false_positive': return '#666';
      default: return '#666';
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'critical') return alert.severity === 'critical';
    if (selectedFilter === 'investigating') return alert.status === 'investigating';
    return true;
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Shield size={40} color="#FF7A00" />
        <Text style={styles.loadingText}>Analyse des menaces...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <AlertTriangle size={32} color="#FF5722" />
        <Text style={styles.title}>Détection de fraude</Text>
        <Text style={styles.subtitle}>Surveillance en temps réel</Text>
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Statistiques de sécurité</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{alerts.filter(a => a.status === 'active').length}</Text>
            <Text style={styles.statLabel}>Alertes actives</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{patterns.reduce((sum, p) => sum + p.preventedLoss, 0).toLocaleString()}</Text>
            <Text style={styles.statLabel}>Pertes évitées (FCFA)</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{patterns.reduce((sum, p) => sum + p.detectedCount, 0)}</Text>
            <Text style={styles.statLabel}>Tentatives bloquées</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>98.5%</Text>
            <Text style={styles.statLabel}>Précision IA</Text>
          </View>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filtrer par:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'all', label: 'Toutes' },
            { key: 'critical', label: 'Critiques' },
            { key: 'investigating', label: 'En cours' }
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                selectedFilter === filter.key && styles.filterButtonActive
              ]}
              onPress={() => setSelectedFilter(filter.key as any)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedFilter === filter.key && styles.filterButtonTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.alertsSection}>
        <Text style={styles.sectionTitle}>Alertes de fraude ({filteredAlerts.length})</Text>

        {filteredAlerts.map((alert) => (
          <View key={alert.id} style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <View style={styles.alertInfo}>
                {getAlertIcon(alert.type)}
                <View style={styles.alertDetails}>
                  <Text style={styles.alertDescription}>{alert.description}</Text>
                  <Text style={styles.alertUser}>Utilisateur: {alert.userName}</Text>
                  <Text style={styles.alertTime}>
                    {alert.timestamp.toLocaleString('fr-FR')}
                  </Text>
                </View>
              </View>

              <View style={styles.alertMeta}>
                <View style={[
                  styles.severityBadge,
                  { backgroundColor: getSeverityColor(alert.severity) }
                ]}>
                  <Text style={styles.severityText}>
                    {alert.severity === 'critical' ? 'CRITIQUE' :
                      alert.severity === 'high' ? 'ÉLEVÉ' :
                        alert.severity === 'medium' ? 'MOYEN' : 'FAIBLE'}
                  </Text>
                </View>
                <Text style={styles.riskScore}>Risque: {alert.riskScore}%</Text>
              </View>
            </View>

            <View style={styles.evidenceContainer}>
              <Text style={styles.evidenceTitle}>Preuves:</Text>
              {alert.evidence.map((evidence, index) => (
                <Text key={index} style={styles.evidenceItem}>• {evidence}</Text>
              ))}
            </View>

            <View style={styles.alertActions}>
              <View style={[
                styles.statusIndicator,
                { backgroundColor: getStatusColor(alert.status) }
              ]}>
                <Text style={styles.statusText}>
                  {alert.status === 'active' ? 'Actif' :
                    alert.status === 'investigating' ? 'Investigation' :
                      alert.status === 'resolved' ? 'Résolu' : 'Faux positif'}
                </Text>
              </View>

              {userRole === 'admin' || userRole === 'security' ? (
                <View style={styles.actionButtons}>
                  {alert.status === 'active' && (
                    <TouchableOpacity
                      style={styles.investigateButton}
                      onPress={() => handleAlertAction(alert.id, 'investigate')}
                    >
                      <Eye size={14} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>Enquêter</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.resolveButton}
                    onPress={() => handleAlertAction(alert.id, 'resolve')}
                  >
                    <Text style={styles.actionButtonText}>Résoudre</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.falsePositiveButton}
                    onPress={() => handleAlertAction(alert.id, 'false_positive')}
                  >
                    <Text style={styles.actionButtonText}>Faux +</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.restrictedAccess}>Accès limité</Text>
              )}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.patternsSection}>
        <Text style={styles.sectionTitle}>Modèles de fraude détectés</Text>

        {patterns.map((pattern, index) => (
          <View key={index} style={styles.patternCard}>
            <View style={styles.patternHeader}>
              <Text style={styles.patternName}>{pattern.pattern}</Text>
              <Text style={styles.patternCount}>{pattern.detectedCount} détections</Text>
            </View>

            <View style={styles.patternMeta}>
              <Text style={styles.patternLastSeen}>
                Dernière détection: {pattern.lastDetected.toLocaleString('fr-FR')}
              </Text>
              <Text style={styles.patternPrevented}>
                Pertes évitées: {pattern.preventedLoss.toLocaleString()} FCFA
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.riskTransactionsSection}>
        <Text style={styles.sectionTitle}>Transactions à risque</Text>

        {riskTransactions.map((transaction) => (
          <View key={transaction.transactionId} style={styles.transactionCard}>
            <View style={styles.transactionHeader}>
              <Text style={styles.transactionId}>#{transaction.transactionId}</Text>
              <Text style={styles.transactionAmount}>
                {transaction.amount.toLocaleString()} FCFA
              </Text>
            </View>

            <View style={styles.riskInfo}>
              <Text style={styles.riskScore}>Score de risque: {transaction.riskScore}%</Text>
              <View style={[
                styles.recommendationBadge,
                {
                  backgroundColor: transaction.recommendation === 'approve' ? '#4CAF50' :
                    transaction.recommendation === 'review' ? '#FF9800' : '#FF5722'
                }
              ]}>
                <Text style={styles.recommendationText}>
                  {transaction.recommendation === 'approve' ? 'APPROUVER' :
                    transaction.recommendation === 'review' ? 'RÉVISER' : 'BLOQUER'}
                </Text>
              </View>
            </View>

            <View style={styles.riskFactors}>
              <Text style={styles.riskFactorsTitle}>Facteurs de risque:</Text>
              {transaction.riskFactors.map((factor, index) => (
                <Text key={index} style={styles.riskFactor}>• {factor}</Text>
              ))}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.aiInsights}>
        <Text style={styles.aiTitle}>Insights IA</Text>
        <View style={styles.insightCard}>
          <TrendingUp size={20} color="#4CAF50" />
          <Text style={styles.insightText}>
            Les tentatives de fraude ont diminué de 15% cette semaine grâce aux améliorations de l'algorithme.
          </Text>
        </View>
        <View style={styles.insightCard}>
          <AlertTriangle size={20} color="#FF9800" />
          <Text style={styles.insightText}>
            Nouveau modèle de fraude détecté: comptes créés en masse depuis la même localisation.
          </Text>
        </View>
      </View>
    </ScrollView>
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
    marginTop: 12,
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#FFEBEE',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 4,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FF5722',
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  filterLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#FF5722',
  },
  filterButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  alertsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF5722',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  alertInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  alertDetails: {
    marginLeft: 12,
    flex: 1,
  },
  alertDescription: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  alertUser: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 2,
  },
  alertTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#999',
  },
  alertMeta: {
    alignItems: 'flex-end',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  severityText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  riskScore: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FF5722',
  },
  evidenceContainer: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  evidenceTitle: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#E65100',
    marginBottom: 8,
  },
  evidenceItem: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#E65100',
    marginBottom: 2,
  },
  alertActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  investigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 4,
  },
  resolveButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 4,
  },
  falsePositiveButton: {
    backgroundColor: '#666',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  actionButtonText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 2,
  },
  restrictedAccess: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#999',
  },
  patternsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  patternCard: {
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
  patternHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  patternName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    flex: 1,
  },
  patternCount: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FF7A00',
  },
  patternMeta: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 8,
  },
  patternLastSeen: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 4,
  },
  patternPrevented: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#4CAF50',
  },
  riskTransactionsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  transactionCard: {
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
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionId: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  transactionAmount: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#FF7A00',
  },
  riskInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendationText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  riskFactors: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
  },
  riskFactorsTitle: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 8,
  },
  riskFactor: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 2,
  },
  aiInsights: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  aiTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  insightText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginLeft: 12,
    flex: 1,
    lineHeight: 16,
  },
});