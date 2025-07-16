import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, User, Phone, Mail, Briefcase, Plus, Trash2, CheckCircle, Clock } from 'lucide-react-native';
import { useVerification } from '@/hooks/useVerification';
import { useAuth } from '@/app/contexts/AuthContext';

interface Reference {
  id: string;
  name: string;
  phone: string;
  email: string;
  relationship: string;
  company: string;
  position: string;
  yearsKnown: string;
  status: 'pending' | 'contacted' | 'verified' | 'failed';
}

export default function ReferencesFormScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { submitReferences, references: existingReferences } = useVerification();

  const [step, setStep] = useState<'form' | 'verification' | 'complete'>('form');
  const [references, setReferences] = useState<Reference[]>([
    {
      id: '1',
      name: '',
      phone: '',
      email: '',
      relationship: 'Employeur précédent',
      company: '',
      position: '',
      yearsKnown: '',
      status: 'pending'
    },
    {
      id: '2',
      name: '',
      phone: '',
      email: '',
      relationship: 'Client régulier',
      company: '',
      position: '',
      yearsKnown: '',
      status: 'pending'
    }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const relationshipTypes = [
    'Employeur précédent',
    'Employeur actuel',
    'Client régulier',
    'Collègue de travail',
    'Mentor professionnel',
    'Partenaire d\'affaires',
    'Superviseur',
    'Autre professionnel'
  ];

  useEffect(() => {
    // Load existing references if any
    if (existingReferences.length > 0) {
      const formattedRefs = existingReferences.map((ref, index) => ({
        id: ref.id || String(index + 1),
        name: ref.reference_name,
        phone: ref.reference_phone,
        email: ref.reference_email || '',
        relationship: ref.relationship,
        company: ref.company || '',
        position: ref.position || '',
        yearsKnown: ref.years_known || '',
        status: (ref.verification_status as any) || 'pending'
      }));
      setReferences(formattedRefs);
    }
  }, [existingReferences]);

  const addReference = () => {
    if (references.length >= 5) {
      Alert.alert('Limite atteinte', 'Vous pouvez ajouter maximum 5 références');
      return;
    }

    const newReference: Reference = {
      id: Date.now().toString(),
      name: '',
      phone: '',
      email: '',
      relationship: 'Employeur précédent',
      company: '',
      position: '',
      yearsKnown: '',
      status: 'pending'
    };

    setReferences([...references, newReference]);
  };

  const removeReference = (id: string) => {
    if (references.length <= 2) {
      Alert.alert('Minimum requis', 'Vous devez avoir au moins 2 références');
      return;
    }
    setReferences(references.filter(ref => ref.id !== id));
  };

  const updateReference = (id: string, field: keyof Reference, value: string) => {
    setReferences(references.map(ref =>
      ref.id === id ? { ...ref, [field]: value } : ref
    ));
  };

  const validateForm = () => {
    for (const ref of references) {
      if (!ref.name?.trim()) {
        Alert.alert('Erreur', 'Le nom est obligatoire pour toutes les références');
        return false;
      }
      if (!ref.phone?.trim() || ref.phone.length < 10) {
        Alert.alert('Erreur', 'Numéro de téléphone invalide pour ' + ref.name + ' (10 chiffres requis)');
        return false;
      }
      if (!ref.relationship?.trim()) {
        Alert.alert('Erreur', 'La relation professionnelle est obligatoire pour ' + ref.name);
        return false;
      }
      if (!ref.yearsKnown?.trim()) {
        Alert.alert('Erreur', 'La durée de connaissance est obligatoire pour ' + ref.name);
        return false;
      }

      // Validate email format if provided
      if (ref.email && !isValidEmail(ref.email)) {
        Alert.alert('Erreur', 'Format d\'email invalide pour ' + ref.name);
        return false;
      }
    }
    return true;
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const submitReferencesData = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Format data for database
      const referencesData = references.map(ref => ({
        reference_name: ref.name.trim(),
        reference_phone: ref.phone.trim(),
        reference_email: ref.email?.trim() || undefined,
        relationship: ref.relationship,
        company: ref.company?.trim() || undefined,
        position: ref.position?.trim() || undefined,
        years_known: ref.yearsKnown.trim()
      }));

      const result = await submitReferences(referencesData);

      if (result.error) {
        Alert.alert('Erreur', result.error);
        return;
      }

      setStep('verification');
      startVerificationProcess();
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la soumission des références');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startVerificationProcess = () => {
    // Simulate contacting references with realistic delays
    references.forEach((ref, index) => {
      setTimeout(() => {
        setReferences(prev => prev.map(r =>
          r.id === ref.id ? { ...r, status: 'contacted' } : r
        ));

        // Simulate response after contact
        setTimeout(() => {
          const isSuccess = Math.random() > 0.15; // 85% success rate
          setReferences(prev => prev.map(r =>
            r.id === ref.id ? {
              ...r,
              status: isSuccess ? 'verified' : 'failed'
            } : r
          ));
        }, 2000 + Math.random() * 3000); // 2-5 seconds response time
      }, index * 1000 + Math.random() * 2000); // Staggered contact attempts
    });

    // Complete verification after all references are processed
    setTimeout(() => {
      setStep('complete');
    }, references.length * 5000 + 3000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle size={16} color="#4CAF50" />;
      case 'contacted': return <Clock size={16} color="#FF9800" />;
      case 'failed': return <Trash2 size={16} color="#FF5722" />;
      default: return <Clock size={16} color="#666" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'verified': return 'Vérifié';
      case 'contacted': return 'Contacté';
      case 'failed': return 'Échec';
      default: return 'En attente';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return '#4CAF50';
      case 'contacted': return '#FF9800';
      case 'failed': return '#FF5722';
      default: return '#666';
    }
  };

  if (step === 'verification') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vérification en cours</Text>
        </View>

        <View style={styles.verificationContainer}>
          <User size={60} color="#FF7A00" />
          <Text style={styles.verificationTitle}>Contact des références</Text>
          <Text style={styles.verificationText}>
            Nous contactons vos références pour vérifier vos informations professionnelles. Ce processus peut prendre quelques minutes.
          </Text>

          <View style={styles.referencesList}>
            {references.map((ref, index) => (
              <View key={ref.id} style={styles.referenceStatus}>
                <View style={styles.referenceInfo}>
                  <Text style={styles.referenceName}>{ref.name}</Text>
                  <Text style={styles.referenceRelation}>{ref.relationship}</Text>
                  {ref.company && (
                    <Text style={styles.referenceCompany}>chez {ref.company}</Text>
                  )}
                </View>
                <View style={styles.statusContainer}>
                  {getStatusIcon(ref.status)}
                  <Text style={[styles.statusText, { color: getStatusColor(ref.status) }]}>
                    {getStatusText(ref.status)}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.verificationProgress}>
            <Text style={styles.progressText}>
              {references.filter(r => r.status === 'verified').length} sur {references.length} références vérifiées
            </Text>
          </View>
        </View>
      </View>
    );
  }

  if (step === 'complete') {
    const verifiedCount = references.filter(r => r.status === 'verified').length;
    const contactedCount = references.filter(r => r.status === 'contacted').length;
    const failedCount = references.filter(r => r.status === 'failed').length;
    const isSuccess = verifiedCount >= 2;

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vérification terminée</Text>
        </View>

        <View style={styles.completeContainer}>
          <CheckCircle size={80} color={isSuccess ? "#4CAF50" : "#FF9800"} />
          <Text style={styles.completeTitle}>
            {isSuccess ? 'Références vérifiées!' : 'Vérification partielle'}
          </Text>
          <Text style={styles.completeText}>
            {isSuccess
              ? `${verifiedCount} de vos références ont été vérifiées avec succès.`
              : `${verifiedCount} références vérifiées sur ${references.length}. ${failedCount > 0 ? `${failedCount} n'ont pas pu être contactées.` : ''}`
            }
          </Text>

          <View style={styles.resultsCard}>
            <Text style={styles.resultsTitle}>Résultats détaillés:</Text>
            <View style={styles.resultItem}>
              <CheckCircle size={16} color="#4CAF50" />
              <Text style={styles.resultText}>{verifiedCount} vérifiées</Text>
            </View>
            {contactedCount > 0 && (
              <View style={styles.resultItem}>
                <Clock size={16} color="#FF9800" />
                <Text style={styles.resultText}>{contactedCount} en attente de réponse</Text>
              </View>
            )}
            {failedCount > 0 && (
              <View style={styles.resultItem}>
                <Trash2 size={16} color="#FF5722" />
                <Text style={styles.resultText}>{failedCount} non joignables</Text>
              </View>
            )}
          </View>

          <View style={styles.benefitsCard}>
            <Text style={styles.benefitsTitle}>Score de confiance:</Text>
            <Text style={styles.trustBonus}>+{verifiedCount * 15} points</Text>
            {isSuccess && (
              <Text style={styles.bonusText}>Badge "Références Vérifiées" débloqué!</Text>
            )}
          </View>

          {!isSuccess && verifiedCount < 2 && (
            <View style={styles.improvementCard}>
              <Text style={styles.improvementTitle}>Suggestions d'amélioration:</Text>
              <Text style={styles.improvementText}>
                • Ajoutez des références avec des numéros actifs{'\n'}
                • Prévenez vos références de notre contact{'\n'}
                • Vérifiez les heures de disponibilité
              </Text>
              <TouchableOpacity
                style={styles.improveButton}
                onPress={() => setStep('form')}
              >
                <Text style={styles.improveButtonText}>Améliorer mes références</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={[styles.doneButton, { backgroundColor: isSuccess ? '#4CAF50' : '#FF9800' }]}
            onPress={() => router.back()}
          >
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
        <Text style={styles.headerTitle}>Références professionnelles</Text>
        <TouchableOpacity onPress={addReference}>
          <Plus size={24} color="#FF7A00" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <User size={20} color="#2196F3" />
          <Text style={styles.infoText}>
            Ajoutez 2-5 références professionnelles que nous pouvons contacter pour vérifier votre expérience et votre fiabilité.
          </Text>
        </View>

        {references.map((reference, index) => (
          <View key={reference.id} style={styles.referenceCard}>
            <View style={styles.referenceHeader}>
              <Text style={styles.referenceTitle}>Référence {index + 1}</Text>
              {references.length > 2 && (
                <TouchableOpacity
                  onPress={() => removeReference(reference.id)}
                  style={styles.removeButton}
                >
                  <Trash2 size={16} color="#FF5722" />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nom complet *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nom et prénoms"
                value={reference.name}
                onChangeText={(text) => updateReference(reference.id, 'name', text)}
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>Téléphone *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+225 XX XX XX XX XX"
                  value={reference.phone}
                  onChangeText={(text) => updateReference(reference.id, 'phone', text)}
                  keyboardType="phone-pad"
                  placeholderTextColor="#666"
                />
              </View>
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="email@exemple.com"
                  value={reference.email}
                  onChangeText={(text) => updateReference(reference.id, 'email', text)}
                  keyboardType="email-address"
                  placeholderTextColor="#666"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Relation professionnelle *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.relationshipSelector}>
                  {relationshipTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.relationshipButton,
                        reference.relationship === type && styles.selectedRelationship
                      ]}
                      onPress={() => updateReference(reference.id, 'relationship', type)}
                    >
                      <Text style={[
                        styles.relationshipText,
                        reference.relationship === type && styles.selectedRelationshipText
                      ]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>Entreprise</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nom de l'entreprise"
                  value={reference.company}
                  onChangeText={(text) => updateReference(reference.id, 'company', text)}
                  placeholderTextColor="#666"
                />
              </View>
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>Poste</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Titre du poste"
                  value={reference.position}
                  onChangeText={(text) => updateReference(reference.id, 'position', text)}
                  placeholderTextColor="#666"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Depuis combien de temps vous connaît cette personne? *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 3 ans, 6 mois, depuis 2020"
                value={reference.yearsKnown}
                onChangeText={(text) => updateReference(reference.id, 'yearsKnown', text)}
                placeholderTextColor="#666"
              />
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addButton} onPress={addReference}>
          <Plus size={20} color="#FF7A00" />
          <Text style={styles.addButtonText}>Ajouter une référence</Text>
        </TouchableOpacity>

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Conseils pour de meilleures références:</Text>
          <Text style={styles.tipText}>
            • Prévenez vos références de notre contact{'\n'}
            • Choisissez des personnes facilement joignables{'\n'}
            • Variez les types de relations professionnelles{'\n'}
            • Assurez-vous que leurs coordonnées sont à jour
          </Text>
        </View>

        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerTitle}>Note importante:</Text>
          <Text style={styles.disclaimerText}>
            Nous contacterons vos références par téléphone ou email pour vérifier vos informations professionnelles. Le processus est confidentiel et professionnel.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.buttonDisabled]}
          onPress={submitReferencesData}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Soumission en cours...' : 'Soumettre les références'}
          </Text>
        </TouchableOpacity>
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
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1976D2',
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
  },
  referenceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  referenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  referenceTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  removeButton: {
    padding: 4,
  },
  inputGroup: {
    marginBottom: 16,
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
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  inputHalf: {
    width: '48%',
  },
  relationshipSelector: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  relationshipButton: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  selectedRelationship: {
    backgroundColor: '#FF7A00',
  },
  relationshipText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  selectedRelationshipText: {
    color: '#FFFFFF',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FF7A00',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 20,
  },
  addButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FF7A00',
    marginLeft: 8,
  },
  tipsCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#E65100',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#E65100',
    lineHeight: 16,
  },
  disclaimerCard: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
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
  submitButton: {
    backgroundColor: '#FF7A00',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  verificationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  verificationTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  verificationText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  referencesList: {
    alignSelf: 'stretch',
    marginBottom: 20,
  },
  referenceStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  referenceInfo: {
    flex: 1,
  },
  referenceName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  referenceRelation: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 2,
  },
  referenceCompany: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#999',
    marginTop: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
  },
  verificationProgress: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 12,
    alignSelf: 'stretch',
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#1976D2',
    textAlign: 'center',
  },
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  completeTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  completeText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  resultsCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignSelf: 'stretch',
  },
  resultsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 12,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginLeft: 8,
  },
  benefitsCard: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  benefitsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#2E7D32',
  },
  trustBonus: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#4CAF50',
    marginTop: 4,
  },
  bonusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#2E7D32',
    marginTop: 8,
    textAlign: 'center',
  },
  improvementCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignSelf: 'stretch',
  },
  improvementTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#E65100',
    marginBottom: 8,
  },
  improvementText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#E65100',
    lineHeight: 16,
    marginBottom: 12,
  },
  improveButton: {
    backgroundColor: '#FF7A00',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  improveButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
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