import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { Camera, FileText, Shield, CircleCheck as CheckCircle, Upload, User, MapPin } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

interface VerificationFlowProps {
  onComplete: (verificationData: any) => void;
  userType: 'client' | 'provider';
}

export default function VerificationFlow({ onComplete, userType }: VerificationFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [verificationData, setVerificationData] = useState({
    phone: false,
    email: false,
    identity: false,
    address: false,
    photo: false,
    background: false,
    references: false
  });
  const [showCamera, setShowCamera] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const steps = userType === 'provider' ? [
    { id: 'phone', title: 'Vérification téléphone', icon: User, required: true },
    { id: 'email', title: 'Vérification email', icon: User, required: true },
    { id: 'identity', title: 'Pièce d\'identité (CNI)', icon: FileText, required: true },
    { id: 'photo', title: 'Photo de profil', icon: Camera, required: true },
    { id: 'address', title: 'Justificatif de domicile', icon: MapPin, required: true },
    { id: 'background', title: 'Casier judiciaire', icon: Shield, required: false },
    { id: 'references', title: 'Références professionnelles', icon: FileText, required: false }
  ] : [
    { id: 'phone', title: 'Vérification téléphone', icon: User, required: true },
    { id: 'email', title: 'Vérification email', icon: User, required: true },
    { id: 'photo', title: 'Photo de profil', icon: Camera, required: true }
  ];

  const handleStepComplete = (stepId: string) => {
    setVerificationData(prev => ({ ...prev, [stepId]: true }));
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // All steps completed
      onComplete(verificationData);
    }
  };

  const handleCameraCapture = () => {
    // Simulate photo capture
    Alert.alert('Photo capturée', 'Photo de profil enregistrée avec succès');
    handleStepComplete('photo');
    setShowCamera(false);
  };

  const handleDocumentUpload = (stepId: string) => {
    // Simulate document upload
    Alert.alert('Document téléchargé', 'Document vérifié et accepté');
    handleStepComplete(stepId);
  };

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  if (showCamera) {
    if (!permission) {
      return <View />;
    }

    if (!permission.granted) {
      return (
        <View style={styles.container}>
          <Text style={styles.message}>Nous avons besoin de votre permission pour utiliser la caméra</Text>
          <TouchableOpacity style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Autoriser la caméra</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <CameraView style={styles.camera}>
          <View style={styles.cameraOverlay}>
            <View style={styles.cameraFrame} />
            <Text style={styles.cameraInstructions}>
              Centrez votre visage dans le cadre
            </Text>
            <View style={styles.cameraButtons}>
              <TouchableOpacity 
                style={styles.captureButton}
                onPress={handleCameraCapture}
              >
                <Camera size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowCamera(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Vérification d'identité</Text>
        <Text style={styles.subtitle}>
          Étape {currentStep + 1} sur {steps.length}
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <View style={styles.stepCard}>
        <View style={styles.stepIcon}>
          <currentStepData.icon size={40} color="#FF7A00" />
        </View>
        
        <Text style={styles.stepTitle}>{currentStepData.title}</Text>
        
        {currentStepData.required && (
          <View style={styles.requiredBadge}>
            <Text style={styles.requiredText}>Obligatoire</Text>
          </View>
        )}

        <Text style={styles.stepDescription}>
          {getStepDescription(currentStepData.id)}
        </Text>

        <View style={styles.stepActions}>
          {currentStepData.id === 'photo' ? (
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => setShowCamera(true)}
            >
              <Camera size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Prendre une photo</Text>
            </TouchableOpacity>
          ) : currentStepData.id === 'phone' || currentStepData.id === 'email' ? (
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => handleStepComplete(currentStepData.id)}
            >
              <Text style={styles.primaryButtonText}>Vérifier maintenant</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => handleDocumentUpload(currentStepData.id)}
            >
              <Upload size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Télécharger document</Text>
            </TouchableOpacity>
          )}

          {!currentStepData.required && (
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => setCurrentStep(currentStep + 1)}
            >
              <Text style={styles.secondaryButtonText}>Passer cette étape</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.stepsOverview}>
        {steps.map((step, index) => (
          <View key={step.id} style={styles.stepIndicator}>
            <View style={[
              styles.stepDot,
              index <= currentStep && styles.stepDotActive,
              verificationData[step.id as keyof typeof verificationData] && styles.stepDotCompleted
            ]}>
              {verificationData[step.id as keyof typeof verificationData] ? (
                <CheckCircle size={16} color="#FFFFFF" />
              ) : (
                <Text style={styles.stepNumber}>{index + 1}</Text>
              )}
            </View>
            <Text style={styles.stepLabel}>{step.title}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function getStepDescription(stepId: string): string {
  const descriptions = {
    phone: 'Nous allons envoyer un code de vérification par SMS',
    email: 'Vérifiez votre adresse email pour recevoir les notifications',
    identity: 'Scannez votre Carte Nationale d\'Identité (CNI)',
    photo: 'Prenez une photo claire de votre visage',
    address: 'Téléchargez une facture d\'électricité ou d\'eau récente',
    background: 'Casier judiciaire pour renforcer la confiance (optionnel)',
    references: 'Contacts professionnels pour validation (optionnel)'
  };
  return descriptions[stepId as keyof typeof descriptions] || '';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginTop: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF7A00',
    borderRadius: 2,
  },
  stepCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  stepIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF3E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  requiredBadge: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  requiredText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  stepDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  stepActions: {
    width: '100%',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF7A00',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  stepsOverview: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  stepIndicator: {
    alignItems: 'center',
    flex: 1,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepDotActive: {
    backgroundColor: '#FF7A00',
  },
  stepDotCompleted: {
    backgroundColor: '#4CAF50',
  },
  stepNumber: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraFrame: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    marginBottom: 20,
  },
  cameraInstructions: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 40,
  },
  cameraButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FF7A00',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
  message: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#FF7A00',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});