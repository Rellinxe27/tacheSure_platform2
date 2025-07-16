import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Users, MapPin, Star, CheckCircle, Clock, User, Award, Shield } from 'lucide-react-native';
import { useVerification } from '@/hooks/useVerification';
import { useAuth } from '@/app/contexts/AuthContext';

interface CommunityValidator {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  verificationCount: number;
  rating: number;
  location: string;
  isVerified: boolean;
}

interface ValidationRequest {
  validatorId: string;
  message: string;
  meetingLocation: string;
  preferredTime: string;
}

export default function CommunityValidationScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { uploadDocument } = useVerification();

  const [step, setStep] = useState<'info' | 'validators' | 'request' | 'pending' | 'complete'>('info');
  const [selectedValidator, setSelectedValidator] = useState<CommunityValidator | null>(null);
  const [validationRequest, setValidationRequest] = useState<ValidationRequest>({
    validatorId: '',
    message: '',
    meetingLocation: '',
    preferredTime: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [validators] = useState<CommunityValidator[]>([
    {
      id: '1',
      name: 'Kouamé Marie-Claire',
      role: 'Coordinatrice communautaire',
      verificationCount: 47,
      rating: 4.9,
      location: 'Cocody, Abidjan',
      isVerified: true
    },
    {
      id: '2',
      name: 'Traoré Ibrahim',
      role: 'Chef de quartier',
      verificationCount: 32,
      rating: 4.7,
      location: 'Plateau, Abidjan',
      isVerified: true
    },
    {
      id: '3',
      name: 'N\'Guessan Béatrice',
      role: 'Présidente d\'association',
      verificationCount: 28,
      rating: 4.8,
      location: 'Yopougon, Abidjan',
      isVerified: true
    }
  ]);

  const handleValidatorSelect = (validator: CommunityValidator) => {
    setSelectedValidator(validator);
    setValidationRequest(prev => ({ ...prev, validatorId: validator.id }));
    setStep('request');
  };

  const submitValidationRequest = async () => {
    if (!validationRequest.message.trim()) {
      Alert.alert('Erreur', 'Veuillez expliquer pourquoi vous souhaitez être validé');
      return;
    }

    if (!validationRequest.meetingLocation.trim()) {
      Alert.alert('Erreur', 'Veuillez proposer un lieu de rencontre');
      return;
    }

    setIsSubmitting(true);

    try {
      // Save validation request to database
      const result = await uploadDocument({
        document_type: 'community',
        document_url: 'pending',
        verification_data: {
          validator_id: validationRequest.validatorId,
          message: validationRequest.message,
          meeting_location: validationRequest.meetingLocation,
          preferred_time: validationRequest.preferredTime,
          request_date: new Date().toISOString(),
          status: 'pending'
        }
      });

      if (result.error) {
        Alert.alert('Erreur', result.error);
        return;
      }

      setStep('pending');

      // Simulate validator response after some time
      setTimeout(() => {
        setStep('complete');
      }, 5000);

    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la soumission de la demande');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 'complete') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Validation acceptée</Text>
        </View>

        <View style={styles.successContainer}>
          <CheckCircle size={80} color="#4CAF50" />
          <Text style={styles.successTitle}>Validation communautaire réussie!</Text>
          <Text style={styles.successText}>
            {selectedValidator?.name} a confirmé votre identité et votre présence dans la communauté.
          </Text>

          <View style={styles.validatorCard}>
            <View style={styles.validatorInfo}>
              <View style={styles.validatorAvatar}>
                <User size={30} color="#666" />
              </View>
              <View>
                <Text style={styles.validatorName}>{selectedValidator?.name}</Text>
                <Text style={styles.validatorRole}>{selectedValidator?.role}</Text>
                <View style={styles.validatorRating}>
                  <Star size={12} color="#FFD700" fill="#FFD700" />
                  <Text style={styles.ratingText}>{selectedValidator?.rating}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.benefitsCard}>
            <Text style={styles.benefitsTitle}>Avantages obtenus:</Text>
            <View style={styles.benefitItem}>
              <CheckCircle size={16} color="#4CAF50" />
              <Text style={styles.benefitText}>+40 points de confiance</Text>
            </View>
            <View style={styles.benefitItem}>
              <Shield size={16} color="#4CAF50" />
              <Text style={styles.benefitText}>Badge "Validation Communautaire"</Text>
            </View>
            <View style={styles.benefitItem}>
              <Award size={16} color="#4CAF50" />
              <Text style={styles.benefitText}>Niveau Premium débloqué</Text>
            </View>
            <View style={styles.benefitItem}>
              <Users size={16} color="#4CAF50" />
              <Text style={styles.benefitText}>Confiance communautaire</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.doneButton} onPress={() => router.back()}>
            <Text style={styles.doneButtonText}>Terminé</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (step === 'pending') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Demande en cours</Text>
        </View>

        <View style={styles.pendingContainer}>
          <Clock size={60} color="#FF9800" />
          <Text style={styles.pendingTitle}>Demande soumise</Text>
          <Text style={styles.pendingText}>
            Votre demande de validation a été envoyée à {selectedValidator?.name}.
            Vous recevrez une notification une fois qu'elle aura été traitée.
          </Text>

          <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>Prochaines étapes:</Text>
            <View style={styles.statusStep}>
              <CheckCircle size={16} color="#4CAF50" />
              <Text style={styles.statusText}>Demande envoyée</Text>
            </View>
            <View style={styles.statusStep}>
              <Clock size={16} color="#FF9800" />
              <Text style={styles.statusText}>Examen par le validateur</Text>
            </View>
            <View style={styles.statusStep}>
              <Clock size={16} color="#CCC" />
              <Text style={styles.statusText}>Rendez-vous programmé</Text>
            </View>
            <View style={styles.statusStep}>
              <Clock size={16} color="#CCC" />
              <Text style={styles.statusText}>Validation finale</Text>
            </View>
          </View>
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
          {step === 'info' ? 'Validation communautaire' :
            step === 'validators' ? 'Choisir un validateur' : 'Demande de validation'}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {step === 'info' && (
          <>
            <View style={styles.infoCard}>
              <Users size={60} color="#FF7A00" />
              <Text style={styles.infoTitle}>Validation communautaire</Text>
              <Text style={styles.infoText}>
                La validation communautaire est le niveau le plus élevé de confiance.
                Un membre reconnu de votre communauté confirme votre identité et votre réputation locale.
              </Text>
            </View>

            <View style={styles.benefitsSection}>
              <Text style={styles.sectionTitle}>Avantages</Text>
              <View style={styles.benefitsList}>
                <View style={styles.benefitItem}>
                  <Award size={20} color="#FFD700" />
                  <Text style={styles.benefitText}>Niveau Premium (Niveau 4)</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Shield size={20} color="#4CAF50" />
                  <Text style={styles.benefitText}>+40 points de confiance</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Star size={20} color="#FF7A00" />
                  <Text style={styles.benefitText}>Priorité absolue dans les recherches</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Users size={20} color="#2196F3" />
                  <Text style={styles.benefitText}>Badge de confiance communautaire</Text>
                </View>
              </View>
            </View>

            <View style={styles.processSection}>
              <Text style={styles.sectionTitle}>Comment ça marche</Text>
              <View style={styles.processSteps}>
                <View style={styles.processStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>1</Text>
                  </View>
                  <Text style={styles.stepText}>Choisissez un validateur dans votre région</Text>
                </View>
                <View style={styles.processStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>2</Text>
                  </View>
                  <Text style={styles.stepText}>Soumettez votre demande avec vos motivations</Text>
                </View>
                <View style={styles.processStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>3</Text>
                  </View>
                  <Text style={styles.stepText}>Rencontrez le validateur en personne</Text>
                </View>
                <View style={styles.processStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>4</Text>
                  </View>
                  <Text style={styles.stepText}>Recevez votre validation communautaire</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => setStep('validators')}
            >
              <Text style={styles.continueButtonText}>Commencer la validation</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 'validators' && (
          <>
            <Text style={styles.sectionTitle}>Validateurs disponibles</Text>
            <Text style={styles.sectionSubtitle}>
              Choisissez un validateur reconnu dans votre région
            </Text>

            {validators.map((validator) => (
              <TouchableOpacity
                key={validator.id}
                style={styles.validatorCard}
                onPress={() => handleValidatorSelect(validator)}
              >
                <View style={styles.validatorInfo}>
                  <View style={styles.validatorAvatar}>
                    <User size={30} color="#666" />
                  </View>
                  <View style={styles.validatorDetails}>
                    <View style={styles.validatorHeader}>
                      <Text style={styles.validatorName}>{validator.name}</Text>
                      {validator.isVerified && (
                        <Shield size={16} color="#4CAF50" />
                      )}
                    </View>
                    <Text style={styles.validatorRole}>{validator.role}</Text>
                    <View style={styles.validatorMeta}>
                      <View style={styles.metaItem}>
                        <MapPin size={12} color="#666" />
                        <Text style={styles.metaText}>{validator.location}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Star size={12} color="#FFD700" fill="#FFD700" />
                        <Text style={styles.metaText}>{validator.rating}</Text>
                      </View>
                    </View>
                    <Text style={styles.verificationCount}>
                      {validator.verificationCount} validations effectuées
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {step === 'request' && selectedValidator && (
          <>
            <View style={styles.selectedValidatorCard}>
              <Text style={styles.selectedValidatorTitle}>Validateur sélectionné</Text>
              <View style={styles.validatorInfo}>
                <View style={styles.validatorAvatar}>
                  <User size={30} color="#666" />
                </View>
                <View>
                  <Text style={styles.validatorName}>{selectedValidator.name}</Text>
                  <Text style={styles.validatorRole}>{selectedValidator.role}</Text>
                </View>
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Demande de validation</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Pourquoi souhaitez-vous être validé? *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Expliquez vos motivations et comment vous contribuez à la communauté..."
                  value={validationRequest.message}
                  onChangeText={(text) => setValidationRequest(prev => ({ ...prev, message: text }))}
                  multiline
                  numberOfLines={4}
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Lieu de rencontre proposé *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Café de la Paix, Plateau"
                  value={validationRequest.meetingLocation}
                  onChangeText={(text) => setValidationRequest(prev => ({ ...prev, meetingLocation: text }))}
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Horaire préféré</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Lundi-Vendredi 14h-17h"
                  value={validationRequest.preferredTime}
                  onChangeText={(text) => setValidationRequest(prev => ({ ...prev, preferredTime: text }))}
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.noteCard}>
                <Text style={styles.noteTitle}>Note importante:</Text>
                <Text style={styles.noteText}>
                  La rencontre se fera dans un lieu public de votre choix.
                  Le validateur vérifiera votre identité et évaluera votre réputation dans la communauté.
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.buttonDisabled]}
                onPress={submitValidationRequest}
                disabled={isSubmitting}
              >
                <Text style={styles.submitButtonText}>
                  {isSubmitting ? 'Envoi en cours...' : 'Envoyer la demande'}
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginLeft: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  infoTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  benefitsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  benefitsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333',
    marginLeft: 12,
  },
  processSection: {
    marginBottom: 30,
  },
  processSteps: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  processStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF7A00',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  stepText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333',
    flex: 1,
  },
  continueButton: {
    backgroundColor: '#FF7A00',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  validatorCard: {
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
  validatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  validatorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  validatorDetails: {
    flex: 1,
  },
  validatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  validatorName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginRight: 8,
  },
  validatorRole: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 8,
  },
  validatorMeta: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginLeft: 4,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#333',
    marginLeft: 4,
  },
  verificationCount: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#4CAF50',
  },
  selectedValidatorCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  selectedValidatorTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1976D2',
    marginBottom: 12,
  },
  formSection: {
    marginBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 8,
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
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  noteCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  noteTitle: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#E65100',
    marginBottom: 4,
  },
  noteText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#E65100',
    lineHeight: 16,
  },
  submitButton: {
    backgroundColor: '#FF7A00',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  pendingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  pendingTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  pendingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignSelf: 'stretch',
  },
  statusTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 12,
  },
  statusStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginLeft: 8,
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