import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, FileText, Shield, CircleCheck as CheckCircle, ArrowRight } from 'lucide-react-native';

export default function VerificationScreen() {
  const router = useRouter();
  const [verificationSteps, setVerificationSteps] = useState([
    { id: 'phone', title: 'Téléphone', completed: true },
    { id: 'identity', title: 'Pièce d\'identité', completed: false },
    { id: 'photo', title: 'Photo de profil', completed: false },
    { id: 'address', title: 'Adresse', completed: false },
  ]);

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
            setVerificationSteps(prev => 
              prev.map(step => 
                step.id === stepId ? { ...step, completed: true } : step
              )
            );
          }
        }
      ]
    );
  };

  const allStepsCompleted = verificationSteps.every(step => step.completed);

  return (
    <LinearGradient
      colors={['#FF7A00', '#FF9500']}
      style={styles.container}
    >
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Shield size={60} color="#FFFFFF" />
          <Text style={styles.title}>Vérification d'identité</Text>
          <Text style={styles.subtitle}>
            Completez votre profil pour commencer à offrir vos services
          </Text>
        </View>

        <View style={styles.stepsContainer}>
          {verificationSteps.map((step, index) => (
            <TouchableOpacity
              key={step.id}
              style={styles.stepCard}
              onPress={() => !step.completed && handleVerificationStep(step.id)}
            >
              <View style={styles.stepNumber}>
                {step.completed ? (
                  <CheckCircle size={24} color="#4CAF50" />
                ) : (
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                )}
              </View>
              <View style={styles.stepInfo}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepStatus}>
                  {step.completed ? 'Terminé' : 'En attente'}
                </Text>
              </View>
              {step.id === 'identity' && (
                <FileText size={20} color="#666" />
              )}
              {step.id === 'photo' && (
                <Camera size={20} color="#666" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Pourquoi vérifier?</Text>
          <Text style={styles.infoText}>
            • Augmentez votre crédibilité{'\n'}
            • Accédez à plus de clients{'\n'}
            • Sécurisez votre compte{'\n'}
            • Bénéficiez de notre support
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
    marginBottom: 40,
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
  },
  stepsContainer: {
    marginBottom: 30,
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