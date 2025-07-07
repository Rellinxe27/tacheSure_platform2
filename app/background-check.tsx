import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Shield, FileText, Upload, AlertTriangle, CheckCircle, User, Calendar, MapPin } from 'lucide-react-native';

export default function BackgroundCheckScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: 'Kouadio Jean Pierre',
    birthDate: '15/03/1985',
    birthPlace: 'Abidjan, Côte d\'Ivoire',
    nationality: 'Ivoirienne',
    currentAddress: '123 Rue de la Paix, Cocody, Abidjan',
    previousAddresses: '',
    profession: 'Plombier',
    employmentHistory: '',
    motherName: '',
    fatherName: '',
    spouseName: '',
    emergencyContact: '',
    hasDocument: false
  });

  const [step, setStep] = useState<'form' | 'document' | 'processing' | 'complete'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = () => {
    if (!formData.fullName || !formData.birthDate || !formData.birthPlace) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }
    setStep('document');
  };

  const handleDocumentUpload = () => {
    Alert.alert(
      'Télécharger le casier judiciaire',
      'Vous devez obtenir votre casier judiciaire auprès des autorités compétentes puis le télécharger ici.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'J\'ai le document', onPress: () => simulateUpload() },
        { text: 'Comment l\'obtenir?', onPress: () => showInstructions() }
      ]
    );
  };

  const simulateUpload = () => {
    setStep('processing');
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setStep('complete');
    }, 3000);
  };

  const showInstructions = () => {
    Alert.alert(
      'Comment obtenir votre casier judiciaire',
      '1. Rendez-vous au tribunal de première instance\n2. Demandez un extrait de casier judiciaire\n3. Présentez votre CNI et 1000 FCFA\n4. Le document sera délivré sous 48h\n5. Scannez et téléchargez le document ici',
      [{ text: 'Compris' }]
    );
  };

  const skipBackgroundCheck = () => {
    Alert.alert(
      'Passer cette étape',
      'Le casier judiciaire n\'est pas obligatoire mais recommandé pour augmenter votre score de confiance.',
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
              <CheckCircle size={20} color="#FF9800" />
              <Text style={styles.processingStepText}>Vérification autorités</Text>
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
            Votre casier judiciaire a été vérifié avec succès. Cela augmente significativement votre score de confiance.
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
                Ces informations sont nécessaires pour la vérification de votre casier judiciaire. Elles restent confidentielles.
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
                <Text style={styles.inputLabel}>Nationalité</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nationalité"
                  value={formData.nationality}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, nationality: text }))}
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Adresse actuelle</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Adresse complète"
                  value={formData.currentAddress}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, currentAddress: text }))}
                  multiline
                  numberOfLines={3}
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Profession actuelle</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Votre profession"
                  value={formData.profession}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, profession: text }))}
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

              <TouchableOpacity style={styles.continueButton} onPress={handleFormSubmit}>
                <Text style={styles.continueButtonText}>Continuer</Text>
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
                Téléchargez votre extrait de casier judiciaire récent (moins de 3 mois).
              </Text>

              <View style={styles.requirementsList}>
                <View style={styles.requirementItem}>
                  <CheckCircle size={16} color="#4CAF50" />
                  <Text style={styles.requirementText}>Document officiel</Text>
                </View>
                <View style={styles.requirementItem}>
                  <CheckCircle size={16} color="#4CAF50" />
                  <Text style={styles.requirementText}>Moins de 3 mois</Text>
                </View>
                <View style={styles.requirementItem}>
                  <CheckCircle size={16} color="#4CAF50" />
                  <Text style={styles.requirementText}>Format PDF ou image</Text>
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

              <TouchableOpacity style={styles.helpButton}>
                <Text style={styles.helpButtonText} onPress={showInstructions}>
                  Comment obtenir mon casier judiciaire?
                </Text>
              </TouchableOpacity>
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
    marginBottom: 40,
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
    marginBottom: 32,
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