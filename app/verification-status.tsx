import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Shield, CheckCircle, Clock, XCircle, Camera, Upload, User, FileText, Award } from 'lucide-react-native';

interface VerificationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  level: number;
  required: boolean;
}

export default function VerificationStatusScreen() {
  const router = useRouter();

  const [verificationSteps, setVerificationSteps] = useState<VerificationStep[]>([
    {
      id: 'phone',
      title: 'Numéro de téléphone',
      description: 'Vérification par SMS',
      status: 'approved',
      level: 1,
      required: true
    },
    {
      id: 'email',
      title: 'Adresse email',
      description: 'Confirmation par email',
      status: 'approved',
      level: 1,
      required: true
    },
    {
      id: 'identity',
      title: 'Carte d\'identité (CNI)',
      description: 'Scan et reconnaissance faciale',
      status: 'submitted',
      level: 2,
      required: true
    },
    {
      id: 'address',
      title: 'Justificatif de domicile',
      description: 'Facture récente (électricité/eau)',
      status: 'approved',
      level: 2,
      required: true
    },
    {
      id: 'background',
      title: 'Casier judiciaire',
      description: 'Vérification antécédents',
      status: 'pending',
      level: 3,
      required: false
    },
    {
      id: 'references',
      title: 'Références professionnelles',
      description: '2-3 contacts vérifiables',
      status: 'pending',
      level: 3,
      required: false
    },
    {
      id: 'community',
      title: 'Validation communautaire',
      description: 'Recommandation locale',
      status: 'pending',
      level: 4,
      required: false
    }
  ]);

  const currentLevel = Math.max(...verificationSteps.filter(s => s.status === 'approved').map(s => s.level));
  const trustScore = calculateTrustScore();

  function calculateTrustScore(): number {
    const approved = verificationSteps.filter(s => s.status === 'approved');
    const levelWeights = { 1: 20, 2: 25, 3: 30, 4: 40 };
    return approved.reduce((score, step) => score + (levelWeights[step.level as keyof typeof levelWeights] || 0), 0);
  }

  const handleVerificationAction = (stepId: string) => {
    const step = verificationSteps.find(s => s.id === stepId);
    if (!step) return;

    if (step.status === 'pending') {
      if (step.id === 'identity') {
        router.push('/document-scanner');
      } else if (step.id === 'background') {
        router.push('/background-check');
      } else if (step.id === 'references') {
        router.push('/references-form');
      } else {
        startVerification(stepId);
      }
    } else if (step.status === 'rejected') {
      resubmitVerification(stepId);
    }
  };

  const startVerification = (stepId: string) => {
    Alert.alert(
      'Démarrer la vérification',
      `Lancer la vérification pour ${verificationSteps.find(s => s.id === stepId)?.title}?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Démarrer',
          onPress: () => {
            setVerificationSteps(prev => prev.map(step =>
              step.id === stepId ? { ...step, status: 'submitted' } : step
            ));
            Alert.alert('Vérification soumise', 'Votre demande est en cours de traitement');
          }
        }
      ]
    );
  };

  const resubmitVerification = (stepId: string) => {
    Alert.alert(
      'Nouvelle soumission',
      'Voulez-vous soumettre de nouveaux documents?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Resubmit',
          onPress: () => {
            setVerificationSteps(prev => prev.map(step =>
              step.id === stepId ? { ...step, status: 'submitted' } : step
            ));
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Statut de vérification</Text>
        <View style={{ width: 24 }} />
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
                  >
                    <View style={styles.stepInfo}>
                      {getStatusIcon(step.status)}
                      <View style={styles.stepDetails}>
                        <Text style={styles.stepTitle}>{step.title}</Text>
                        <Text style={styles.stepDescription}>{step.description}</Text>
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