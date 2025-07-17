import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, FileText, Shield, CircleCheck as CheckCircle, ArrowRight, Award, Crown, User, MapPin, Fingerprint, Building, Users } from 'lucide-react-native';
import { useAuth } from './contexts/AuthContext';
import { getVerificationLevelValue, getTrustScoreColor, getTrustLevel } from '@/utils/trustScore';

export default function VerificationScreen() {
  const router = useRouter();
  const { profile, updateProfile } = useAuth();
  const [selectedLevel, setSelectedLevel] = useState<'basic' | 'government' | 'enhanced' | 'community'>(
    profile?.verification_level || 'basic'
  );
  
  // Define verification levels
  const verificationLevels = [
    {
      id: 'basic',
      title: 'Vérification Basique',
      description: 'Niveau initial requis pour tous les utilisateurs',
      icon: Shield,
      color: '#666',
      steps: [
        { id: 'phone', title: 'Téléphone', completed: true },
        { id: 'email', title: 'Email', completed: true },
        { id: 'photo', title: 'Photo de profil', completed: false },
      ]
    },
    {
      id: 'government',
      title: 'Vérification Gouvernement',
      description: 'Vérification avec documents officiels',
      icon: Building,
      color: '#2196F3',
      steps: [
        { id: 'identity', title: 'Carte Nationale d\'Identité', completed: false },
        { id: 'address', title: 'Justificatif de domicile', completed: false },
        { id: 'facial', title: 'Reconnaissance faciale', completed: false },
      ]
    },
    {
      id: 'enhanced',
      title: 'Vérification Renforcée',
      description: 'Vérification approfondie pour prestataires',
      icon: Award,
      color: '#9C27B0',
      steps: [
        { id: 'background', title: 'Casier judiciaire', completed: false },
        { id: 'professional', title: 'Références professionnelles', completed: false },
        { id: 'education', title: 'Certificats d\'éducation', completed: false },
        { id: 'biometric', title: 'Empreinte digitale', completed: false },
      ]
    },
    {
      id: 'community',
      title: 'Vérification Communauté',
      description: 'Niveau le plus élevé avec validation locale',
      icon: Crown,
      color: '#FFD700',
      steps: [
        { id: 'community_leader', title: 'Validation chef communautaire', completed: false },
        { id: 'local_business', title: 'Recommandation commerce local', completed: false },
        { id: 'religious_leader', title: 'Référence autorité religieuse', completed: false },
        { id: 'trusted_users', title: 'Parrainage utilisateurs vérifiés', completed: false },
      ]
    }
  ];
  
  const [verificationSteps, setVerificationSteps] = useState(
    verificationLevels.find(level => level.id === selectedLevel)?.steps || []
  );

  const handleVerificationStep = (stepId: string) => {
    Alert.alert(
      'Vérification',
      `Commencer la vérification ${stepId}?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Continuer', 
          onPress: () => {
            // Simulate completion
            const updatedSteps = verificationSteps.map(step => 
              step.id === stepId ? { ...step, completed: true } : step
            );
            setVerificationSteps(updatedSteps);
            
            // Check if all steps for this level are completed
            const allLevelStepsCompleted = updatedSteps.every(step => step.completed);
            if (allLevelStepsCompleted && profile) {
              // Update user's verification level
              updateProfile({ 
                verification_level: selectedLevel,
                is_verified: true,
                trust_score: calculateTrustScore(selectedLevel)
              });
              
              Alert.alert(
                'Niveau complété!',
                `Félicitations! Vous avez complété le niveau de vérification "${verificationLevels.find(level => level.id === selectedLevel)?.title}".`,
                [{ text: 'OK' }]
              );
            }
          }
        }
      ]
    );
  };
  
  // Calculate trust score based on verification level and other factors
  const calculateTrustScore = (level: string): number => {
    // For the verification screen, we use a simplified calculation based primarily on verification level
    // The full calculation in utils/trustScore.ts will be used when all factors are available
    
    // Base score from verification level (25% weight in the full formula)
    const verificationValue = getVerificationLevelValue(level as 'basic' | 'government' | 'enhanced' | 'community');
    
    // For verification screen, we weight verification level higher since other data isn't available yet
    const baseScore = verificationValue * 100;
    
    // Add some variation based on level to match expected ranges
    switch(level) {
      case 'basic': return Math.min(60, Math.max(40, Math.round(baseScore * 1.5)));
      case 'government': return Math.min(80, Math.max(65, Math.round(baseScore * 1.2)));
      case 'enhanced': return Math.min(90, Math.max(80, Math.round(baseScore * 1.1)));
      case 'community': return Math.min(100, Math.max(90, Math.round(baseScore * 1.0)));
      default: return 0;
    }
  };
  
  // Handle level selection
  const handleLevelSelect = (levelId: 'basic' | 'government' | 'enhanced' | 'community') => {
    setSelectedLevel(levelId);
    setVerificationSteps(verificationLevels.find(level => level.id === levelId)?.steps || []);
  };

  const allStepsCompleted = verificationSteps.every(step => step.completed);
  const currentLevel = verificationLevels.find(level => level.id === selectedLevel);
  const LevelIcon = currentLevel?.icon || Shield;

  return (
    <LinearGradient
      colors={['#FF7A00', '#FF9500']}
      style={styles.container}
    >
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <LevelIcon size={60} color="#FFFFFF" />
          <Text style={styles.title}>Vérification d'identité</Text>
          <Text style={styles.subtitle}>
            Renforcez votre profil avec notre système de vérification multi-niveaux
          </Text>
        </View>
        
        {/* Verification Levels */}
        <Text style={styles.sectionTitle}>Niveaux de vérification</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.levelsContainer}
        >
          {verificationLevels.map((level) => (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.levelCard,
                selectedLevel === level.id && styles.selectedLevelCard,
                { borderColor: level.color }
              ]}
              onPress={() => handleLevelSelect(level.id as 'basic' | 'government' | 'enhanced' | 'community')}
            >
              <View style={[styles.levelIconContainer, { backgroundColor: `${level.color}20` }]}>
                <level.icon size={24} color={level.color} />
              </View>
              <Text style={styles.levelTitle}>{level.title}</Text>
              <Text style={styles.levelDescription}>{level.description}</Text>
              {profile?.verification_level === level.id && (
                <View style={[styles.currentBadge, { backgroundColor: level.color }]}>
                  <Text style={styles.currentBadgeText}>Actuel</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Verification Steps */}
        <Text style={styles.sectionTitle}>Étapes requises</Text>
        <View style={styles.stepsContainer}>
          {verificationSteps.map((step, index) => (
            <TouchableOpacity
              key={step.id}
              style={styles.stepCard}
              onPress={() => !step.completed && handleVerificationStep(step.id)}
            >
              <View style={[styles.stepNumber, step.completed && { backgroundColor: '#E8F5E9' }]}>
                {step.completed ? (
                  <CheckCircle size={24} color="#4CAF50" />
                ) : (
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                )}
              </View>
              <View style={styles.stepInfo}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={[
                  styles.stepStatus,
                  step.completed && { color: '#4CAF50' }
                ]}>
                  {step.completed ? 'Terminé' : 'En attente'}
                </Text>
              </View>
              
              {/* Step-specific icons */}
              {step.id === 'identity' && <FileText size={20} color="#666" />}
              {step.id === 'photo' && <Camera size={20} color="#666" />}
              {step.id === 'phone' && <User size={20} color="#666" />}
              {step.id === 'email' && <FileText size={20} color="#666" />}
              {step.id === 'address' && <MapPin size={20} color="#666" />}
              {step.id === 'facial' && <User size={20} color="#666" />}
              {step.id === 'biometric' && <Fingerprint size={20} color="#666" />}
              {step.id === 'community_leader' && <Users size={20} color="#666" />}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Avantages de la vérification</Text>
          <Text style={styles.infoText}>
            • Augmentez votre score de confiance{'\n'}
            • Accédez à plus de clients et opportunités{'\n'}
            • Sécurisez votre compte et vos transactions{'\n'}
            • Bénéficiez d'un support prioritaire{'\n'}
            • Obtenez des tarifs préférentiels
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            !allStepsCompleted && styles.disabledButton,
          ]}
          onPress={() => router.push('/(tabs)')}
          disabled={!allStepsCompleted}
        >
          <Text style={styles.continueButtonText}>
            {allStepsCompleted ? 'Accéder à l\'app' : 'Completer la vérification'}
          </Text>
          <ArrowRight size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  levelsContainer: {
    marginBottom: 24,
  },
  levelCard: {
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedLevelCard: {
    borderWidth: 2,
    backgroundColor: '#FFF8F3',
  },
  levelIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  levelTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  levelDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 8,
  },
  currentBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  currentBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  stepsContainer: {
    marginBottom: 24,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  stepStatus: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 20,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 40,
  },
  disabledButton: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FF7A00',
    marginRight: 8,
  },
});