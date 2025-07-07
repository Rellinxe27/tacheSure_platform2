import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ArrowLeft, Camera, RefreshCw, Check, AlertTriangle, User, FileText } from 'lucide-react-native';

interface ScannedDocument {
  type: 'front' | 'back';
  uri: string;
  confidence: number;
  extractedData?: {
    name?: string;
    idNumber?: string;
    birthDate?: string;
    expiryDate?: string;
  };
}

export default function DocumentScannerScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(true);
  const [scanningStep, setScanningStep] = useState<'front' | 'back' | 'face'>('front');
  const [scannedDocs, setScannedDocs] = useState<ScannedDocument[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const scanningSteps = [
    { key: 'front', title: 'Recto de la CNI', description: 'Placez le recto de votre carte dans le cadre' },
    { key: 'back', title: 'Verso de la CNI', description: 'Placez le verso de votre carte dans le cadre' },
    { key: 'face', title: 'Selfie de vérification', description: 'Centrez votre visage dans le cadre' }
  ];

  const currentStep = scanningSteps.find(s => s.key === scanningStep);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scanner de documents</Text>
        </View>

        <View style={styles.permissionContainer}>
          <Camera size={80} color="#FF7A00" />
          <Text style={styles.permissionTitle}>Autorisation caméra requise</Text>
          <Text style={styles.permissionText}>
            Nous avons besoin d'accéder à votre caméra pour scanner vos documents d'identité de manière sécurisée.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Autoriser la caméra</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleCapture = async () => {
    setIsProcessing(true);

    // Simulate document processing
    setTimeout(() => {
      const mockData = {
        type: scanningStep as 'front' | 'back',
        uri: 'mock-uri',
        confidence: 95 + Math.random() * 5,
        extractedData: scanningStep === 'front' ? {
          name: 'KOUADIO Jean Pierre',
          idNumber: 'CI1234567890',
          birthDate: '15/03/1985'
        } : {
          expiryDate: '15/03/2030'
        }
      };

      setScannedDocs(prev => [...prev, mockData]);
      setIsProcessing(false);

      if (scanningStep === 'front') {
        setScanningStep('back');
      } else if (scanningStep === 'back') {
        setScanningStep('face');
      } else {
        // All steps completed
        handleVerificationComplete();
      }
    }, 2000);
  };

  const handleVerificationComplete = () => {
    setIsScanning(false);
    Alert.alert(
      'Vérification terminée!',
      'Vos documents ont été scannés avec succès. Ils vont maintenant être vérifiés par notre équipe.',
      [
        { text: 'OK', onPress: () => router.back() }
      ]
    );
  };

  const retakePhoto = () => {
    if (scanningStep === 'front') {
      setScannedDocs(prev => prev.filter(doc => doc.type !== 'front'));
    } else if (scanningStep === 'back') {
      setScannedDocs(prev => prev.filter(doc => doc.type !== 'back'));
    }
  };

  const getInstructions = () => {
    switch (scanningStep) {
      case 'front':
        return [
          'Placez votre CNI bien à plat',
          'Assurez-vous que tous les textes sont lisibles',
          'Évitez les reflets et ombres',
          'Cadrez entièrement la carte'
        ];
      case 'back':
        return [
          'Retournez votre carte CNI',
          'Placez le verso dans le cadre',
          'Vérifiez la netteté du code-barres',
          'Assurez-vous que la signature est visible'
        ];
      case 'face':
        return [
          'Regardez directement la caméra',
          'Retirez lunettes de soleil/casquette',
          'Assurez-vous d\'un bon éclairage',
          'Évitez les expressions exagérées'
        ];
      default:
        return [];
    }
  };

  if (!isScanning) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vérification complète</Text>
        </View>

        <View style={styles.successContainer}>
          <Check size={80} color="#4CAF50" />
          <Text style={styles.successTitle}>Documents vérifiés!</Text>
          <Text style={styles.successText}>
            Vos documents ont été scannés et analysés avec succès. Notre équipe va maintenant procéder à la vérification manuelle.
          </Text>

          <View style={styles.extractedDataCard}>
            <Text style={styles.extractedTitle}>Données extraites:</Text>
            {scannedDocs.find(d => d.extractedData?.name) && (
              <Text style={styles.extractedItem}>
                Nom: {scannedDocs.find(d => d.extractedData?.name)?.extractedData?.name}
              </Text>
            )}
            {scannedDocs.find(d => d.extractedData?.idNumber) && (
              <Text style={styles.extractedItem}>
                N° CNI: {scannedDocs.find(d => d.extractedData?.idNumber)?.extractedData?.idNumber}
              </Text>
            )}
          </View>

          <TouchableOpacity style={styles.doneButton} onPress={() => router.back()}>
            <Text style={styles.doneButtonText}>Terminé</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{currentStep?.title}</Text>
        <View style={{ width: 24 }} />
      </View>

      <CameraView style={styles.camera}>
        <View style={styles.overlay}>
          <View style={styles.instructionsContainer}>
            <Text style={styles.stepIndicator}>
              Étape {scanningSteps.findIndex(s => s.key === scanningStep) + 1}/3
            </Text>
            <Text style={styles.instructionTitle}>{currentStep?.description}</Text>
          </View>

          <View style={styles.scanningArea}>
            <View style={[
              styles.scanFrame,
              scanningStep === 'face' ? styles.faceFrame : styles.cardFrame
            ]}>
              {scanningStep !== 'face' && (
                <View style={styles.cardGuide}>
                  <FileText size={40} color="rgba(255, 255, 255, 0.8)" />
                </View>
              )}
              {scanningStep === 'face' && (
                <View style={styles.faceGuide}>
                  <User size={60} color="rgba(255, 255, 255, 0.8)" />
                </View>
              )}
            </View>
          </View>

          <View style={styles.bottomContainer}>
            <View style={styles.tipsContainer}>
              {getInstructions().map((tip, index) => (
                <Text key={index} style={styles.tipText}>• {tip}</Text>
              ))}
            </View>

            <View style={styles.controls}>
              {scannedDocs.some(d => d.type === scanningStep) && (
                <TouchableOpacity style={styles.retakeButton} onPress={retakePhoto}>
                  <RefreshCw size={20} color="#FFFFFF" />
                  <Text style={styles.retakeText}>Reprendre</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.captureButton, isProcessing && styles.captureButtonDisabled]}
                onPress={handleCapture}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <RefreshCw size={24} color="#FFFFFF" />
                ) : (
                  <Camera size={24} color="#FFFFFF" />
                )}
                <Text style={styles.captureText}>
                  {isProcessing ? 'Traitement...' : 'Scanner'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </CameraView>

      {isProcessing && (
        <View style={styles.processingOverlay}>
          <View style={styles.processingCard}>
            <RefreshCw size={40} color="#FF7A00" />
            <Text style={styles.processingTitle}>Analyse en cours...</Text>
            <Text style={styles.processingText}>
              Extraction et vérification des données
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  instructionsContainer: {
    alignItems: 'center',
    paddingTop: 120,
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  stepIndicator: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 8,
  },
  instructionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  scanningArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    borderWidth: 3,
    borderColor: '#FF7A00',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardFrame: {
    width: 280,
    height: 180,
  },
  faceFrame: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  cardGuide: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceGuide: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  tipsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  tipText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 16,
  },
  retakeText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  captureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF7A00',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  captureButtonDisabled: {
    opacity: 0.6,
  },
  captureText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 40,
  },
  processingTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  processingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#F5F5F5',
  },
  permissionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: '#FF7A00',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  permissionButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#F5F5F5',
  },
  successTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  successText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  extractedDataCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  extractedTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 12,
  },
  extractedItem: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 8,
  },
  doneButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
  },
  doneButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});