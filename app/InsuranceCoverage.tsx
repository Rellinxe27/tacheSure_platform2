import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Shield, DollarSign, FileText, AlertTriangle, CheckCircle, Home, User, Wrench } from 'lucide-react-native';

interface InsurancePolicy {
  id: string;
  type: 'liability' | 'property' | 'injury' | 'professional';
  coverage: number;
  premium: number;
  status: 'active' | 'pending' | 'expired';
  expiryDate: Date;
  claimsUsed: number;
  claimsLimit: number;
}

interface InsuranceClaim {
  id: string;
  type: string;
  amount: number;
  status: 'pending' | 'investigating' | 'approved' | 'rejected';
  description: string;
  submittedDate: Date;
  taskId?: string;
}

interface InsuranceCoverageProps {
  userType: 'client' | 'provider';
  taskAmount?: number;
  onCoverageConfirm?: (coverage: InsurancePolicy[]) => void;
}

export default function InsuranceCoverage({ userType, taskAmount, onCoverageConfirm }: InsuranceCoverageProps) {
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [selectedCoverage, setSelectedCoverage] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading insurance data
    setTimeout(() => {
      const mockPolicies: InsurancePolicy[] = [
        {
          id: 'liability_basic',
          type: 'liability',
          coverage: 1000000,
          premium: 2500,
          status: 'active',
          expiryDate: new Date('2024-12-31'),
          claimsUsed: 0,
          claimsLimit: 3
        },
        {
          id: 'property_damage',
          type: 'property',
          coverage: 500000,
          premium: 1800,
          status: 'active',
          expiryDate: new Date('2024-12-31'),
          claimsUsed: 1,
          claimsLimit: 2
        },
        {
          id: 'professional_indemnity',
          type: 'professional',
          coverage: 2000000,
          premium: 3500,
          status: userType === 'provider' ? 'active' : 'pending',
          expiryDate: new Date('2024-12-31'),
          claimsUsed: 0,
          claimsLimit: 5
        }
      ];

      const mockClaims: InsuranceClaim[] = [
        {
          id: 'claim_001',
          type: 'property',
          amount: 45000,
          status: 'approved',
          description: 'Dommage accidentel pendant réparation plomberie',
          submittedDate: new Date('2024-01-10'),
          taskId: 'task_123'
        }
      ];

      setPolicies(mockPolicies);
      setClaims(mockClaims);
      setLoading(false);
    }, 1000);
  }, [userType]);

  const calculateTotalPremium = () => {
    return selectedCoverage.reduce((total, policyId) => {
      const policy = policies.find(p => p.id === policyId);
      return total + (policy?.premium || 0);
    }, 0);
  };

  const handlePolicySelect = (policyId: string) => {
    setSelectedCoverage(prev =>
      prev.includes(policyId)
        ? prev.filter(id => id !== policyId)
        : [...prev, policyId]
    );
  };

  const handleSubmitClaim = () => {
    Alert.alert(
      'Déclarer un sinistre',
      'Décrivez l\'incident pour initier une réclamation d\'assurance',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Continuer', onPress: () => Alert.alert('Réclamation initiée', 'Votre demande a été soumise') }
      ]
    );
  };

  const getPolicyIcon = (type: string) => {
    switch (type) {
      case 'liability': return <Shield size={24} color="#4CAF50" />;
      case 'property': return <Home size={24} color="#FF7A00" />;
      case 'injury': return <User size={24} color="#2196F3" />;
      case 'professional': return <Wrench size={24} color="#9C27B0" />;
      default: return <Shield size={24} color="#666" />;
    }
  };

  const getPolicyName = (type: string) => {
    switch (type) {
      case 'liability': return 'Responsabilité civile';
      case 'property': return 'Dommages matériels';
      case 'injury': return 'Accidents corporels';
      case 'professional': return 'Responsabilité professionnelle';
      default: return 'Assurance générale';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'expired': return '#FF5722';
      default: return '#666';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Shield size={40} color="#FF7A00" />
        <Text style={styles.loadingText}>Chargement des couvertures...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Shield size={32} color="#4CAF50" />
        <Text style={styles.title}>Couverture d'assurance</Text>
        <Text style={styles.subtitle}>
          {userType === 'provider' ? 'Vos polices d\'assurance' : 'Protection pour cette tâche'}
        </Text>
      </View>

      {taskAmount && (
        <View style={styles.taskCoverageCard}>
          <Text style={styles.taskCoverageTitle}>Couverture recommandée</Text>
          <Text style={styles.taskAmount}>Valeur de la tâche: {taskAmount.toLocaleString()} FCFA</Text>
          <Text style={styles.taskCoverageText}>
            Couverture automatique jusqu'à {(taskAmount * 2).toLocaleString()} FCFA
          </Text>
        </View>
      )}

      <View style={styles.policiesSection}>
        <Text style={styles.sectionTitle}>Polices disponibles</Text>

        {policies.map((policy) => (
          <TouchableOpacity
            key={policy.id}
            style={[
              styles.policyCard,
              selectedCoverage.includes(policy.id) && styles.selectedPolicy
            ]}
            onPress={() => handlePolicySelect(policy.id)}
          >
            <View style={styles.policyHeader}>
              <View style={styles.policyInfo}>
                {getPolicyIcon(policy.type)}
                <View style={styles.policyDetails}>
                  <Text style={styles.policyName}>{getPolicyName(policy.type)}</Text>
                  <Text style={styles.policyCoverage}>
                    Couverture: {policy.coverage.toLocaleString()} FCFA
                  </Text>
                </View>
              </View>

              <View style={styles.policyMeta}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(policy.status) }]}>
                  <Text style={styles.statusText}>
                    {policy.status === 'active' ? 'Actif' :
                      policy.status === 'pending' ? 'En attente' : 'Expiré'}
                  </Text>
                </View>
                <Text style={styles.premium}>{policy.premium.toLocaleString()} FCFA/an</Text>
              </View>
            </View>

            <View style={styles.policyStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Sinistres utilisés:</Text>
                <Text style={styles.statValue}>{policy.claimsUsed}/{policy.claimsLimit}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Expire le:</Text>
                <Text style={styles.statValue}>{policy.expiryDate.toLocaleDateString('fr-FR')}</Text>
              </View>
            </View>

            {policy.status === 'active' && policy.claimsUsed < policy.claimsLimit && (
              <View style={styles.policyActions}>
                <TouchableOpacity style={styles.claimButton} onPress={handleSubmitClaim}>
                  <FileText size={16} color="#FF7A00" />
                  <Text style={styles.claimButtonText}>Déclarer sinistre</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {claims.length > 0 && (
        <View style={styles.claimsSection}>
          <Text style={styles.sectionTitle}>Sinistres récents</Text>

          {claims.map((claim) => (
            <View key={claim.id} style={styles.claimCard}>
              <View style={styles.claimHeader}>
                <Text style={styles.claimType}>{getPolicyName(claim.type)}</Text>
                <View style={[
                  styles.claimStatusBadge,
                  { backgroundColor: getStatusColor(claim.status) }
                ]}>
                  <Text style={styles.claimStatusText}>
                    {claim.status === 'approved' ? 'Approuvé' :
                      claim.status === 'investigating' ? 'Enquête' :
                        claim.status === 'pending' ? 'En attente' : 'Rejeté'}
                  </Text>
                </View>
              </View>

              <Text style={styles.claimDescription}>{claim.description}</Text>

              <View style={styles.claimMeta}>
                <Text style={styles.claimAmount}>{claim.amount.toLocaleString()} FCFA</Text>
                <Text style={styles.claimDate}>
                  {claim.submittedDate.toLocaleDateString('fr-FR')}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {selectedCoverage.length > 0 && onCoverageConfirm && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Résumé de la couverture</Text>
          <Text style={styles.summaryPremium}>
            Coût total: {calculateTotalPremium().toLocaleString()} FCFA/an
          </Text>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => {
              const selectedPolicies = policies.filter(p => selectedCoverage.includes(p.id));
              onCoverageConfirm(selectedPolicies);
            }}
          >
            <CheckCircle size={20} color="#FFFFFF" />
            <Text style={styles.confirmButtonText}>Confirmer la couverture</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.infoCard}>
        <AlertTriangle size={20} color="#FF9800" />
        <Text style={styles.infoText}>
          Toutes les transactions sont automatiquement couvertes par notre assurance de base.
          Les couvertures supplémentaires offrent une protection renforcée.
        </Text>
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
    textAlign: 'center',
  },
  taskCoverageCard: {
    backgroundColor: '#E8F5E8',
    margin: 20,
    borderRadius: 12,
    padding: 16,
  },
  taskCoverageTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  taskAmount: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333',
    marginBottom: 4,
  },
  taskCoverageText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#2E7D32',
  },
  policiesSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  policyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedPolicy: {
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8E9',
  },
  policyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  policyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  policyDetails: {
    marginLeft: 12,
  },
  policyName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  policyCoverage: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 2,
  },
  policyMeta: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  premium: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FF7A00',
  },
  policyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginRight: 8,
  },
  statValue: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  policyActions: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
  },
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  claimButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FF7A00',
    marginLeft: 6,
  },
  claimsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  claimCard: {
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
  claimHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  claimType: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  claimStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  claimStatusText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  claimDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 8,
    lineHeight: 16,
  },
  claimMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  claimAmount: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#FF7A00',
  },
  claimDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  summaryCard: {
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
  summaryTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 8,
  },
  summaryPremium: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FF7A00',
    marginBottom: 16,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
  },
  confirmButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF3E0',
    margin: 20,
    borderRadius: 12,
    padding: 16,
  },
  infoText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#E65100',
    marginLeft: 12,
    flex: 1,
    lineHeight: 16,
  },
});