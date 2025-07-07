import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, User, Phone, Mail, Briefcase, Plus, Trash2, CheckCircle, Clock } from 'lucide-react-native';

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
      if (!ref.name || !ref.phone || !ref.relationship || !ref.yearsKnown) {
        Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires pour chaque référence');
        return false;
      }
      if (ref.phone.length < 8) {
        Alert.alert('Erreur', 'Numéro de téléphone invalide');
        return false;
      }
    }
    return true;
  };

  const submitReferences = () => {
    if (!validateForm()) return;

    setStep('verification');
    // Simulate contacting references
    startVerificationProcess();
  };

  const startVerificationProcess = () => {
    references.forEach((ref, index) => {
      setTimeout(() => {
        setReferences(prev => prev.map(r =>
          r.id === ref.id ? { ...r, status: 'contacted' } : r
        ));

        setTimeout(() => {
          setReferences(prev => prev.map(r =>
            r.id === ref.id ? { ...r, status: Math.random() > 0.2 ? 'verified' : 'failed' } : r
          ));
        }, 2000);
      }, index * 1000);
    });

    // Complete verification after all references are processed
    setTimeout(() => {
      setStep('complete');
    }, references.length * 3000 + 1000);
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
            Nous contactons vos références pour vérifier vos informations professionnelles.
          </Text>

          <View style={styles.referencesList}>
            {references.map((ref, index) => (
              <View key={ref.id} style={styles.referenceStatus}>
                <View style={styles.referenceInfo}>
                  <Text style={styles.referenceName}>{ref.name}</Text>
                  <Text style={styles.referenceRelation}>{ref.relationship}</Text>
                </View>
                <View style={styles.statusContainer}>
                  {getStatusIcon(ref.status)}
                  <Text style={styles.statusText}>{getStatusText(ref.status)}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  }

  if (step === 'complete') {
    const verifiedCount = references.filter(r => r.status === 'verified').length;
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
              : `${verifiedCount} références vérifiées sur ${references.length}. Vous pouvez ajouter d'autres références pour améliorer votre score.`
            }
          </Text>

          <View style={styles.benefitsCard}>
            <Text style={styles.benefitsTitle}>Score de confiance:</Text>
            <Text style={styles.trustBonus}>+{verifiedCount * 15} points</Text>
          </View>

          <TouchableOpacity
            style={styles.doneButton}
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
            Ajoutez 2-5 références professionnelles que nous pouvons contacter pour vérifier votre expérience.
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
                  placeholder="+225 XX XX XX XX"
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
                placeholder="Ex: 3 ans, 6 mois"
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

        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerTitle}>Note importante:</Text>
          <Text style={styles.disclaimerText}>
            Nous contacterons vos références par téléphone ou email pour vérifier vos informations.
            Assurez-vous qu'elles sont prévenues de notre contact.
          </Text>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={submitReferences}>
          <Text style={styles.submitButtonText}>Soumettre les références</Text>
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
  disclaimerCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  disclaimerTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#E65100',
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#E65100',
    lineHeight: 16,
  },
  submitButton: {
    backgroundColor: '#FF7A00',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
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
  },
  referenceStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginLeft: 8,
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
    marginBottom: 32,
  },
  benefitsCard: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    alignItems: 'center',
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