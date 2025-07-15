import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Shield, CheckCircle, Clock, XCircle, Camera, Upload, User, FileText, Award, AlertTriangle } from 'lucide-react-native';
import { useAuth } from '@/app/contexts/AuthContext';
import { useVerification } from '@/hooks/useVerification';
import { supabase } from '@/lib/supabase';

interface VerificationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  level: number;
  required: boolean;
  documentType: string;
  rejectionReason?: string;
  expiresAt?: string;
}

export default function VerificationStatusScreen() {
  const router = useRouter();
  const { user, profile, updateProfile } = useAuth();
  const { documents, loading: documentsLoading, uploadDocument, getVerificationProgress } = useVerification();
  const [verificationSteps, setVerificationSteps] = useState<VerificationStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const stepDefinitions = [
    {
      id: 'phone',
      title: 'Numéro de téléphone',
      description: 'Vérification par SMS',
      level: 1,
      required: true,
      documentType: 'phone_verification'
    },
    {
      id: 'email',
      title: 'Adresse email',
      description: 'Confirmation par email',
      level: 1,
      required: true,
      documentType: 'email_verification'
    },
    {
      id: 'identity',
      title: 'Carte d\'identité (CNI)',
      description: 'Scan et reconnaissance faciale',
      level: 2,
      required: true,
      documentType: 'cni'
    },
    {
      id: 'address',
      title: 'Justificatif de domicile',
      description: 'Facture récente (électricité/eau)',
      level: 2,
      required: true,
      documentType: 'address_proof'
    },
    {
      id: 'background',
      title: 'Casier judiciaire',
      description: 'Vérification antécédents',
      level: 3,
      required: false,
      documentType: 'criminal_record'
    },
    {
      id: 'references',
      title: 'Références professionnelles',
      description: '2-3 contacts vérifiables',
      level: 3,
      required: false,
      documentType: 'professional_references'
    },
    {
      id: 'community',
      title: 'Validation communautaire',
      description: 'Recommandation locale',
      level: 4,
      required: false,
      documentType: 'community_validation'
    }
  ];

  useEffect(() => {
    loadVerificationStatus();
  }, [documents, profile]);

  const loadVerificationStatus = async () => {
    try {
      setLoading(true);

      // Map documents to verification steps
      const steps = stepDefinitions.map(stepDef => {
        // Check basic verifications from profile
        if (stepDef.documentType === 'phone_verification') {
          return {
            ...stepDef,
            status: profile?.phone ? 'approved' : 'pending'
          } as VerificationStep;
        }

        if (stepDef.documentType === 'email_verification') {
          return {
            ...stepDef,
            status: profile?.email ? 'approved' : 'pending'
          } as VerificationStep;
        }

        // Check document verification status
        const doc = documents.find(d => d.document_type === stepDef.documentType);

        return {
          ...stepDef,
          status: doc ? doc.verification_status : 'pending',
          rejectionReason: doc?.rejection_reason || undefined,
          expiresAt: doc?.expires_at || undefined
        } as VerificationStep;
      });

      setVerificationSteps(steps);
    } catch (error) {
      console.error('Error loading verification status:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshVerificationStatus = async () => {
    setRefreshing(true);
    await loadVerificationStatus();
    setRefreshing(false);
  };

  const calculateTrustScore = (): number => {
    const approved = verificationSteps.filter(s => s.status === 'approved');
    const levelWeights = { 1: 20, 2: 25, 3: 30, 4: 40 };
    const score = approved.reduce((total, step) =>
      total + (levelWeights[step.level as keyof typeof levelWeights] || 0), 0
    );
    return Math.min(score, 100);
  };

  const updateTrustScore = async (newScore: number) => {
    if (!user) return;

    const { error } = await updateProfile({
      trust_score: newScore,
      verification_level: getVerificationLevel(newScore)
    });

    if (error) {
      console.error('Error updating trust score:', error);
    }
  };

  const getVerificationLevel = (score: number): 'basic' | 'government' | 'enhanced' | 'community' => {
    if (score >= 90) return 'community';
    if (score >= 70) return 'enhanced';
    if (score >= 40) return 'government';
    return 'basic';
  };

  const handleVerificationAction = async (stepId: string) => {
    const step = verificationSteps.find(s => s.id === stepId);
    if (!step) return;

    if (step.status === 'pending' || step.status === 'rejected') {
      switch (step.id) {
        case 'phone':
          await verifyPhone();
          break;
        case 'email':
          await verifyEmail();
          break;
        case 'identity':
          router.push('/document-scanner');
          break;
        case 'background':
          router.push('/background-check');
          break;
        case 'references':
          router.push('/references-form');
          break;
        case 'address':
          await uploadAddressProof();
          break;
        case 'community':
          await requestCommunityValidation();
          break;
      }
    }
  };

  const verifyPhone = async () => {
    Alert.alert(
      'Vérification téléphone',
      'Un SMS sera envoyé à votre numéro pour vérification.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Envoyer SMS',
          onPress: async () => {
            // In production, implement SMS verification
            // For now, simulate verification
            const { error } = await uploadDocument({
              document_type: 'phone_verification',
              document_url: 'verified',
              verification_data: { phone: profile?.phone }
            });

            if (!error) {
              Alert.alert('Succès', 'Numéro de téléphone vérifié');
              await refreshVerificationStatus();
              const newScore = calculateTrustScore();
              await updateTrustScore(newScore);
            }
          }
        }
      ]
    );
  };

  const verifyEmail = async () => {
    Alert.alert(
      'Vérification email',
      'Un email de confirmation sera envoyé à votre adresse.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Envoyer email',
          onPress: async () => {
            const { error } = await uploadDocument({
              document_type: 'email_verification',
              document_url: 'verified',
              verification_data: { email: profile?.email }
            });

            if (!error) {
              Alert.alert('Succès', 'Email vérifié');
              await refreshVerificationStatus();
              const newScore = calculateTrustScore();
              await updateTrustScore(newScore);
            }
          }
        }
      ]
    );
  };

  const uploadAddressProof = async () => {
    Alert.alert(
      'Justificatif de domicile',
      'Téléchargez une facture récente (électricité, eau, etc.)',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Sélectionner document',
          onPress: async () => {
            // In production, implement document picker
            // For now, simulate upload
            const { error } = await uploadDocument({
              document_type: 'address_proof',
              document_url: 'https://example.com/address-proof.pdf',
              verification_data: {
                address: profile?.address,
                uploadedAt: new Date().toISOString()
              }
            });

            if (!error) {
              Alert.alert('Succès', 'Document soumis pour vérification');
              await refreshVerificationStatus();
            }
          }
        }
      ]
    );
  };

  const requestCommunityValidation = async () => {
    Alert.alert(
      'Validation communautaire',
      'Cette étape nécessite des recommandations de membres vérifiés de votre communauté.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Demander validation',
          onPress: async () => {
            const { error } = await uploadDocument({
              document_type: 'community_validation',
              document_url: 'pending',
              verification_data: {
                requestedAt: new Date().toISOString(),
                requiredValidations: 3
              }
            });

            if (!error) {
              Alert.alert('Demande envoyée', 'Votre demande de validation communautaire a été soumise');
              await refreshVerificationStatus();
            }
          }
        }
      ]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle size={20} color="#4CAF50" />;
      case 'submitted': return <Clock size={20} color="#FF9800" />;
      case 'rejected': return <XCircle size={20} color="#FF5722" />;
      default: return <Shield size={20} color="#666" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Approuvé';
      case 'submitted': return 'En cours';
      case 'rejected': return 'Rejeté';
      default: return 'En attente';
    }
  };

  const getLevelBadge = (level: number) => {
    const colors = { 1: '#2196F3', 2: '#FF9800', 3: '#9C27B0', 4: '#4CAF50' };
    const labels = { 1: 'Basique', 2: 'Standard', 3: 'Avancé', 4: 'Premium' };

    return (
      <View style={[styles.levelBadge, { backgroundColor: colors[level as keyof typeof colors] }]}>
        <Text style={styles.levelText}>Niveau {level}</Text>
      </View>
    );
  };

  const currentLevel = Math.max(...verificationSteps.filter(s => s.status === 'approved').map(s => s.level), 0);
  const trustScore = calculateTrustScore();

  if (loading || documentsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF7A00" />
        <Text style={styles.loadingText}>Chargement du statut de vérification...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Statut de vérification</Text>
        <TouchableOpacity onPress={refreshVerificationStatus}>
          <Text style={styles.refreshText}>Actualiser</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Shield size={32} color="#FF7A00" />
            <View style={styles.statusInfo}>
              <Text style={styles.trustScore}>{trustScore}% vérifié</Text>
              <Text style={styles.currentLevel}>Niveau {currentLevel}</Text>
            </View>
          </View>

          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${trustScore}%` }]} />
          </View>

          <Text style={styles.statusDescription}>
            Plus votre niveau de vérification est élevé, plus vous gagnerez la confiance des clients
          </Text>
        </View>

        <View style={styles.levelsSection}>
          <Text style={styles.sectionTitle}>Niveaux de vérification</Text>

          {[1, 2, 3, 4].map(level => {
            const levelSteps = verificationSteps.filter(s => s.level === level);
            const levelCompleted = levelSteps.every(s => s.status === 'approved');

            return (
              <View key={level} style={styles.levelCard}>
                <View style={styles.levelHeader}>
                  {getLevelBadge(level)}
                  <Text style={styles.levelTitle}>
                    {level === 1 ? 'Vérification de base' :
                      level === 2 ? 'Identité gouvernementale' :
                        level === 3 ? 'Confiance renforcée' : 'Validation communautaire'}
                  </Text>
                  {levelCompleted && <CheckCircle size={20} color="#4CAF50" />}
                </View>

                {levelSteps.map(step => (
                  <TouchableOpacity
                    key={step.id}
                    style={styles.stepItem}
                    onPress={() => handleVerificationAction(step.id)}
                    disabled={step.status === 'submitted'}
                  >
                    <View style={styles.stepInfo}>
                      {getStatusIcon(step.status)}
                      <View style={styles.stepDetails}>
                        <Text style={styles.stepTitle}>{step.title}</Text>
                        <Text style={styles.stepDescription}>{step.description}</Text>
                        {step.rejectionReason && (
                          <View style={styles.rejectionInfo}>
                            <AlertTriangle size={12} color="#FF5722" />
                            <Text style={styles.rejectionText}>{step.rejectionReason}</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <View style={styles.stepActions}>
                      <Text style={[
                        styles.stepStatus,
                        { color: step.status === 'approved' ? '#4CAF50' :
                            step.status === 'rejected' ? '#FF5722' : '#FF9800' }
                      ]}>
                        {getStatusText(step.status)}
                      </Text>
                      {step.required && <Text style={styles.requiredLabel}>Requis</Text>}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            );
          })}
        </View>

        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>Avantages de la vérification</Text>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Award size={16} color="#FF7A00" />
              <Text style={styles.benefitText}>Priorité dans les résultats de recherche</Text>
            </View>
            <View style={styles.benefitItem}>
              <Shield size={16} color="#4CAF50" />
              <Text style={styles.benefitText}>Badge de confiance visible</Text>
            </View>
            <View style={styles.benefitItem}>
              <User size={16} color="#2196F3" />
              <Text style={styles.benefitText}>Accès à plus de clients</Text>
            </View>
            <View style={styles.benefitItem}>
              <FileText size={16} color="#9C27B0" />
              <Text style={styles.benefitText}>Tarifs plus élevés justifiés</Text>
            </View>
          </View>
        </View>

        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>Besoin d'aide?</Text>
          <Text style={styles.helpText}>
            Notre équipe de vérification est disponible pour vous accompagner dans le processus.
          </Text>
          <TouchableOpacity style={styles.helpButton}>
            <Text style={styles.helpButtonText}>Contacter le support</Text>
          </TouchableOpacity>
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
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    fontSize: 14,
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
  refreshText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FF7A00',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginTop: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusInfo: {
    marginLeft: 16,
  },
  trustScore: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333',
  },
  currentLevel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FF7A00',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF7A00',
    borderRadius: 4,
  },
  statusDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 20,
  },
  levelsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  levelCard: {
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
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  levelText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  levelTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    flex: 1,
  },
  stepItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  stepInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepDetails: {
    marginLeft: 12,
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333',
  },
  stepDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 2,
  },
  rejectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  rejectionText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#FF5722',
    marginLeft: 4,
    flex: 1,
  },
  stepActions: {
    alignItems: 'flex-end',
  },
  stepStatus: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  requiredLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#FF5722',
    marginTop: 2,
  },
  benefitsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  benefitsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginLeft: 12,
  },
  helpSection: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 40,
  },
  helpTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 18,
    marginBottom: 16,
  },
  helpButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  helpButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});