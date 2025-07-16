import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Shield, FileText, Upload, AlertTriangle, CheckCircle, User, Calendar, MapPin } from 'lucide-react-native';
import { useVerification } from '@/hooks/useVerification';
import { useAuth } from '@/app/contexts/AuthContext';
import * as DocumentPicker from 'expo-document-picker';

interface BackgroundCheckData {
  fullName: string;
  birthDate: string;
  birthPlace: string;
  nationality: string;
  currentAddress: string;
  previousAddresses: string;
  profession: string;
  employmentHistory: string;
  motherName: string;
  fatherName: string;
  spouseName: string;
  emergencyContact: string;
  hasDocument: boolean;
  documentUri?: string;
}

export default function BackgroundCheckScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { uploadDocument } = useVerification();

  const [formData, setFormData] = useState<BackgroundCheckData>({
    fullName: profile?.full_name || '',
    birthDate: profile?.date_of_birth || '',
    birthPlace: '',
    nationality: profile?.nationality || 'Ivoirienne',
    currentAddress: '',
    previousAddresses: '',
    profession: '',
    employmentHistory: '',
    motherName: '',
    fatherName: '',
    spouseName: '',
    emergencyContact: '',
    hasDocument: false
  });

  const [step, setStep] = useState<'form' | 'document' | 'processing' | 'complete'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationId, setVerificationId] = useState<string | null>(null);

  useEffect(() => {
    // Pre-fill form with profile data
    if (profile) {
      setFormData(prev => ({
        ...prev,
        fullName: profile.full_name || prev.fullName,
        birthDate: profile.date_of_birth || prev.birthDate,
        nationality: profile.nationality || prev.nationality,
        currentAddress: profile.address ?
          `${profile.address.street || ''}, ${profile.address.city || ''}, ${profile.address.country || ''}`.trim()
          : prev.currentAddress
      }));
    }
  }, [profile]);

  const validateForm = () => {
    const required = ['fullName', 'birthDate', 'birthPlace', 'nationality', 'currentAddress'];
    for (const field of required) {
      if (!formData[field as keyof BackgroundCheckData]) {
        Alert.alert('Erreur', `Le champ ${getFieldName(field)} est obligatoire`);
        return false;
      }
    }

    // Validate date format
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(formData.birthDate)) {
      Alert.alert('Erreur', 'Format de date invalide (JJ/MM/AAAA)');
      return false;
    }

    return true;
  };

  const getFieldName = (field: string) => {
    const names: { [key: string]: string } = {
      fullName: 'Nom complet',
      birthDate: 'Date de naissance',
      birthPlace: 'Lieu de naissance',
      nationality: 'Nationalité',
      currentAddress: 'Adresse actuelle'
    };
    return names[field] || field;
  };

  const handleFormSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      // Save background check data to database
      const backgroundData = {
        personal_info: {
          full_name: formData.fullName,
          birth_date: formData.birthDate,
          birth_place: formData.birthPlace,
          nationality: formData.nationality,
          current_address: formData.currentAddress,
          previous_addresses: formData.previousAddresses,
          profession: formData.profession,
          employment_history: formData.employmentHistory,
          mother_name: formData.motherName,
          father_name: formData.fatherName,
          spouse_name: formData.spouseName,
          emergency_contact: formData.emergencyContact
        },
        submitted_at: new Date().toISOString(),
        status: 'pending_document'
      };

      // Create initial verification record
      const result = await uploadDocument({
        document_type: 'background',
        document_url: 'pending', // Will be updated when document is uploaded
        verification_data: backgroundData
      });

      if (result.error) {
        Alert.alert('Erreur', result.error);
        return;
      }

      setVerificationId(result.data?.id || null);
      setStep('document');
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la soumission du formulaire');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDocumentUpload = () => {
    Alert.alert(
      'Télécharger le casier judiciaire',
      'Choisissez comment obtenir votre casier judiciaire:',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'J\'ai le document', onPress: () => pickDocument() },
        { text: 'Comment l\'obtenir?', onPress: () => showInstructions() }
      ]
    );
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true
      });

      if (!result.canceled && result.assets[0]) {
        setFormData(prev => ({
          ...prev,
          hasDocument: true,
          documentUri: result.assets[0].uri
        }));

        await uploadBackgroundDocument(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la sélection du document');
    }
  };

  const uploadBackgroundDocument = async (documentUri: string) => {
    setStep('processing');
    setIsSubmitting(true);

    try {
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Update the verification record with actual document
      const result = await uploadDocument({
        document_type: 'background',
        document_url: `https://storage.tachesure.com/background/${user?.id}/${Date.now()}.pdf`,
        verification_data: {
          ...formData,
          document_uploaded: true,
          upload_timestamp: new Date().toISOString(),
          file_info: {
            original_name: 'casier_judiciaire.pdf',
            size: 1024 * 200, // 200KB
            type: 'application/pdf'
          }
        }
      });

      if (result.error) {
        Alert.alert('Erreur', result.error);
        setStep('document');
        return;
      }

      // Simulate processing time
      setTimeout(() => {
        setIsSubmitting(false);
        setStep('complete');
      }, 2000);

    } catch (error) {
      setIsSubmitting(false);
      setStep('document');
      Alert.alert('Erreur', 'Erreur lors du téléchargement');
    }
  };

  const showInstructions = () => {
    Alert.alert(
      'Comment obtenir votre casier judiciaire',
      '1. Rendez-vous au tribunal de première instance de votre région\n\n2. Demandez un extrait de casier judiciaire (bulletin n°3)\n\n3. Présentez votre CNI et payez les frais (généralement 1000 FCFA)\n\n4. Le document sera délivré sous 24-48h\n\n5. Scannez ou photographiez le document et téléchargez-le ici\n\nNote: Le document doit dater de moins de 3 mois',
      [{ text: 'Compris' }]
    );
  };

  const skipBackgroundCheck = () => {
    Alert.alert(
      'Passer cette étape',
      'Le casier judiciaire n\'est pas obligatoire mais fortement recommandé pour augmenter votre score de confiance et accéder à plus d\'opportunités.',
      [
        { text: 'Continuer plus tard', onPress: () => router.back() },
        { text: 'Rester ici', style: 'cancel' }
      ]
    );
  };

  if (step === 'processing') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vérification en cours</Text>
        </View>

        <View style={styles.processingContainer}>
          <Shield size={80} color="#FF7A00" />
          <Text style={styles.processingTitle}>Vérification des antécédents</Text>
          <Text style={styles.processingText}>
            Nous vérifions votre casier judiciaire avec les autorités compétentes. Cette étape peut prendre quelques minutes.
          </Text>

          <View style={styles.processingSteps}>
            <View style={styles.processingStep}>
              <CheckCircle size={20} color="#4CAF50" />
              <Text style={styles.processingStepText}>Document reçu</Text>
            </View>
            <View style={styles.processingStep}>
              <CheckCircle size={20} color="#4CAF50" />
              <Text style={styles.processingStepText}>Validation format</Text>
            </View>
            <View style={styles.processingStep}>
              <CheckCircle size={20} color={isSubmitting ? "#FF9800" : "#4CAF50"} />
              <Text style={styles.processingStepText}>Vérification autorités</Text>
            </View>
            <View style={styles.processingStep}>
              <CheckCircle size={20} color={isSubmitting ? "#E0E0E0" : "#4CAF50"} />
              <Text style={styles.processingStepText}>Validation finale</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  if (step === 'complete') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vérification terminée</Text>
        </View>

        <View style={styles.successContainer}>
          <CheckCircle size={80} color="#4CAF50" />
          <Text style={styles.successTitle}>Casier judiciaire vérifié!</Text>
          <Text style={styles.successText}>
            Votre casier judiciaire a été vérifié avec succès. Cela augmente significativement votre score de confiance et votre crédibilité sur la plateforme.
          </Text>

          <View style={styles.benefitsCard}>
            <Text style={styles.benefitsTitle}>Avantages obtenus:</Text>
            <View style={styles.benefitItem}>
              <CheckCircle size={16} color="#4CAF50" />
              <Text style={styles.benefitText}>+30 points de confiance</Text>
            </View>
            <View style={styles.benefitItem}>
              <Shield size={16} color="#4CAF50" />
              <Text style={styles.benefitText}>Badge "Vérifié Sécurité"</Text>
            </View>
            <View style={styles.benefitItem}>
              <User size={16} color="#4CAF50" />
              <Text style={styles.benefitText}>Priorité dans les recherches</Text>
            </View>
            <View style={styles.benefitItem}>
              <FileText size={16} color="#4CAF50" />
              <Text style={styles.benefitText}>Accès aux tâches premium</Text>
            </View>
          </View>

          <View style={styles.nextStepsCard}>
            <Text style={styles.nextStepsTitle}>Prochaines étapes recommandées:</Text>
            <TouchableOpacity
              style={styles.nextStepButton}
              onPress={() => router.push('/references-form')}
            >
              <User size={16} color="#FF7A00" />
              <Text style={styles.nextStepText}>Ajouter des références professionnelles</Text>
            </TouchableOpacity>
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
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {step === 'form' ? 'Informations personnelles' : 'Casier judiciaire'}
        </Text>
        <TouchableOpacity onPress={skipBackgroundCheck}>
          <Text style={styles.skipText}>Passer</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {step === 'form' && (
          <>
            <View style={styles.infoCard}>
              <AlertTriangle size={20} color="#FF9800" />
              <Text style={styles.infoText}>
                Ces informations sont nécessaires pour la vérification de votre casier judiciaire. Elles restent strictement confidentielles et ne sont utilisées qu'à des fins de vérification.
              </Text>
            </View>

            <View style={styles.formCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  <User size={16} color="#666" /> Nom complet *
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nom et prénoms complets"
                  value={formData.fullName}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, fullName: text }))}
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  <Calendar size={16} color="#666" /> Date de naissance *
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="JJ/MM/AAAA"
                  value={formData.birthDate}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, birthDate: text }))}
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  <MapPin size={16} color="#666" /> Lieu de naissance *
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ville, Pays"
                  value={formData.birthPlace}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, birthPlace: text }))}
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nationalité *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nationalité"
                  value={formData.nationality}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, nationality: text }))}
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Adresse actuelle *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Adresse complète actuelle"
                  value={formData.currentAddress}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, currentAddress: text }))}
                  multiline
                  numberOfLines={3}
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Adresses précédentes</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Adresses où vous avez vécu (5 dernières années)"
                  value={formData.previousAddresses}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, previousAddresses: text }))}
                  multiline
                  numberOfLines={3}
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Profession actuelle</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Votre profession ou métier"
                  value={formData.profession}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, profession: text }))}
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Historique professionnel</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Employeurs précédents, expériences pertinentes"
                  value={formData.employmentHistory}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, employmentHistory: text }))}
                  multiline
                  numberOfLines={3}
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nom de la mère</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nom complet de la mère"
                  value={formData.motherName}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, motherName: text }))}
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nom du père</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nom complet du père"
                  value={formData.fatherName}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, fatherName: text }))}
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Conjoint(e)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nom du conjoint/de la conjointe (si applicable)"
                  value={formData.spouseName}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, spouseName: text }))}
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Contact d'urgence</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nom et téléphone du contact d'urgence"
                  value={formData.emergencyContact}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, emergencyContact: text }))}
                  placeholderTextColor="#666"
                />
              </View>

              <TouchableOpacity
                style={[styles.continueButton, isSubmitting && styles.buttonDisabled]}
                onPress={handleFormSubmit}
                disabled={isSubmitting}
              >
                <Text style={styles.continueButtonText}>
                  {isSubmitting ? 'Envoi en cours...' : 'Continuer'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {step === 'document' && (
          <>
            <View style={styles.documentCard}>
              <FileText size={60} color="#FF7A00" />
              <Text style={styles.documentTitle}>Casier judiciaire requis</Text>
              <Text style={styles.documentText}>
                Téléchargez votre extrait de casier judiciaire (bulletin n°3) récent (moins de 3 mois).
              </Text>

              <View style={styles.requirementsList}>
                <View style={styles.requirementItem}>
                  <CheckCircle size={16} color="#4CAF50" />
                  <Text style={styles.requirementText}>Document officiel du tribunal</Text>
                </View>
                <View style={styles.requirementItem}>
                  <CheckCircle size={16} color="#4CAF50" />
                  <Text style={styles.requirementText}>Moins de 3 mois</Text>
                </View>
                <View style={styles.requirementItem}>
                  <CheckCircle size={16} color="#4CAF50" />
                  <Text style={styles.requirementText}>Format PDF ou image claire</Text>
                </View>
                <View style={styles.requirementItem}>
                  <CheckCircle size={16} color="#4CAF50" />
                  <Text style={styles.requirementText}>Lisible et complet</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.uploadButton} onPress={handleDocumentUpload}>
                <Upload size={20} color="#FFFFFF" />
                <Text style={styles.uploadButtonText}>Télécharger le document</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.helpButton} onPress={showInstructions}>
                <Text style={styles.helpButtonText}>
                  Comment obtenir mon casier judiciaire?
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.disclaimerCard}>
              <Text style={styles.disclaimerTitle}>Confidentialité garantie</Text>
              <Text style={styles.disclaimerText}>
                Vos données personnelles sont chiffrées et stockées de manière sécurisée. Elles ne sont utilisées que pour la vérification d'identité et ne sont jamais partagées avec des tiers.
              </Text>
            </View>
          </>
        )}
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
  skipText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FF7A00',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#E65100',
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  continueButton: {
    backgroundColor: '#FF7A00',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  documentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  documentTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  documentText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  requirementsList: {
    alignSelf: 'stretch',
    marginBottom: 24,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginLeft: 12,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF7A00',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
  },
  uploadButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  helpButton: {
    paddingVertical: 8,
  },
  helpButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#2196F3',
    textDecorationLine: 'underline',
  },
  disclaimerCard: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 40,
  },
  disclaimerTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#2E7D32',
    lineHeight: 16,
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  processingTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  processingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  processingSteps: {
    alignSelf: 'stretch',
  },
  processingStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  processingStepText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginLeft: 12,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
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
  benefitsCard: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignSelf: 'stretch',
  },
  benefitsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#2E7D32',
    marginLeft: 12,
  },
  nextStepsCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    alignSelf: 'stretch',
  },
  nextStepsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#E65100',
    marginBottom: 12,
  },
  nextStepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF7A00',
  },
  nextStepText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FF7A00',
    marginLeft: 8,
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