// app/personal-info.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, Save, Edit3 } from 'lucide-react-native';
import { useAuth } from '@/app/contexts/AuthContext';

export default function PersonalInfoScreen() {
  const router = useRouter();
  const { profile, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    nationality: 'Ivoirienne',
    address: {
      street: '',
      city: '',
      commune: '',
      postal_code: ''
    },
    languages: ['Français']
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        date_of_birth: profile.date_of_birth || '',
        gender: profile.gender || '',
        nationality: profile.nationality || 'Ivoirienne',
        address: profile.address as any || {
          street: '',
          city: '',
          commune: '',
          postal_code: ''
        },
        languages: profile.languages || ['Français']
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await updateProfile(formData);

      if (error) {
        Alert.alert('Erreur', error);
      } else {
        Alert.alert('Succès', 'Informations mises à jour avec succès');
        setIsEditing(false);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const genderOptions = ['Homme', 'Femme', 'Autre'];
  const nationalityOptions = ['Ivoirienne', 'Burkinabé', 'Malienne', 'Sénégalaise', 'Ghanéenne', 'Autre'];
  const languageOptions = ['Français', 'Anglais', 'Baoulé', 'Dioula', 'Bété', 'Agni'];

  const toggleLanguage = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Informations personnelles</Text>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
          <Edit3 size={24} color="#FF7A00" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations de base</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom complet</Text>
            <View style={styles.inputContainer}>
              <User size={20} color="#666" />
              <TextInput
                style={styles.input}
                value={formData.full_name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, full_name: text }))}
                placeholder="Votre nom complet"
                editable={isEditing}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <Mail size={20} color="#666" />
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                placeholder="votre@email.com"
                keyboardType="email-address"
                editable={false} // Email shouldn't be editable
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Téléphone</Text>
            <View style={styles.inputContainer}>
              <Phone size={20} color="#666" />
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                placeholder="+225 XX XX XX XX XX"
                keyboardType="phone-pad"
                editable={isEditing}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date de naissance</Text>
            <View style={styles.inputContainer}>
              <Calendar size={20} color="#666" />
              <TextInput
                style={styles.input}
                value={formData.date_of_birth}
                onChangeText={(text) => setFormData(prev => ({ ...prev, date_of_birth: text }))}
                placeholder="JJ/MM/AAAA"
                editable={isEditing}
              />
            </View>
          </View>
        </View>

        {/* Gender Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Genre</Text>
          <View style={styles.optionsContainer}>
            {genderOptions.map(option => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionChip,
                  formData.gender === option && styles.selectedChip,
                  !isEditing && styles.disabledChip
                ]}
                onPress={() => isEditing && setFormData(prev => ({ ...prev, gender: option }))}
                disabled={!isEditing}
              >
                <Text style={[
                  styles.optionText,
                  formData.gender === option && styles.selectedText
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Nationality */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nationalité</Text>
          <View style={styles.optionsContainer}>
            {nationalityOptions.map(option => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionChip,
                  formData.nationality === option && styles.selectedChip,
                  !isEditing && styles.disabledChip
                ]}
                onPress={() => isEditing && setFormData(prev => ({ ...prev, nationality: option }))}
                disabled={!isEditing}
              >
                <Text style={[
                  styles.optionText,
                  formData.nationality === option && styles.selectedText
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adresse</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Rue</Text>
            <View style={styles.inputContainer}>
              <MapPin size={20} color="#666" />
              <TextInput
                style={styles.input}
                value={formData.address.street}
                onChangeText={(text) => setFormData(prev => ({
                  ...prev,
                  address: { ...prev.address, street: text }
                }))}
                placeholder="Numéro et nom de rue"
                editable={isEditing}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ville</Text>
            <TextInput
              style={styles.simpleInput}
              value={formData.address.city}
              onChangeText={(text) => setFormData(prev => ({
                ...prev,
                address: { ...prev.address, city: text }
              }))}
              placeholder="Ville"
              editable={isEditing}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Commune</Text>
            <TextInput
              style={styles.simpleInput}
              value={formData.address.commune}
              onChangeText={(text) => setFormData(prev => ({
                ...prev,
                address: { ...prev.address, commune: text }
              }))}
              placeholder="Commune"
              editable={isEditing}
            />
          </View>
        </View>

        {/* Languages */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Langues parlées</Text>
          <View style={styles.optionsContainer}>
            {languageOptions.map(language => (
              <TouchableOpacity
                key={language}
                style={[
                  styles.optionChip,
                  formData.languages.includes(language) && styles.selectedChip,
                  !isEditing && styles.disabledChip
                ]}
                onPress={() => isEditing && toggleLanguage(language)}
                disabled={!isEditing}
              >
                <Text style={[
                  styles.optionText,
                  formData.languages.includes(language) && styles.selectedText
                ]}>
                  {language}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Save Button */}
        {isEditing && (
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.disabledButton]}
            onPress={handleSave}
            disabled={loading}
          >
            <Save size={20} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>
              {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
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
  section: {
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
  simpleInput: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedChip: {
    backgroundColor: '#FF7A00',
    borderColor: '#FF7A00',
  },
  disabledChip: {
    opacity: 0.7,
  },
  optionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  selectedText: {
    color: '#FFFFFF',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF7A00',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  disabledButton: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});