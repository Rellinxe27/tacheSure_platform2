// app/onboarding.tsx
import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Wrench, Building, ArrowRight } from 'lucide-react-native';
import { useAuth } from './contexts/AuthContext';

export default function OnboardingScreen() {
  const router = useRouter();
  const { updateProfile, profile, loading } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string>('');

  const roles = [
    {
      id: 'client',
      title: 'Client',
      description: 'Je recherche des services',
      icon: User,
      color: '#4CAF50',
    },
    {
      id: 'provider',
      title: 'Prestataire',
      description: 'Je fournis des services',
      icon: Wrench,
      color: '#FF7A00',
    },
    {
      id: 'business',
      title: 'Entreprise',
      description: 'Je gère une entreprise',
      icon: Building,
      color: '#2196F3',
    },
  ];

  const handleContinue = async () => {
    if (!selectedRole) {
      Alert.alert('Erreur', 'Veuillez sélectionner un rôle');
      return;
    }

    try {
      // Update user profile with selected role
      const result = await updateProfile({
        role: selectedRole as 'client' | 'provider' | 'admin' | 'moderator' | 'verifier',
      });

      if (result.error) {
        Alert.alert('Erreur', result.error);
        return;
      }

      // Navigate based on role
      if (selectedRole === 'provider') {
        router.push('/verification');
      } else {
        router.push('/(tabs)');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur s\'est produite lors de la mise à jour');
    }
  };

  return (
    <LinearGradient
      colors={['#FF7A00', '#FF9500']}
      style={styles.container}
    >
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Choisissez votre rôle</Text>
          <Text style={styles.subtitle}>
            Comment souhaitez-vous utiliser TâcheSûre?
          </Text>
          {profile && (
            <Text style={styles.welcomeText}>
              Bienvenue {profile.full_name}!
            </Text>
          )}
        </View>

        <View style={styles.rolesContainer}>
          {roles.map((role) => (
            <TouchableOpacity
              key={role.id}
              style={[
                styles.roleCard,
                selectedRole === role.id && styles.selectedRoleCard,
              ]}
              onPress={() => setSelectedRole(role.id)}
            >
              <View style={[styles.roleIcon, { backgroundColor: role.color }]}>
                <role.icon size={32} color="#FFFFFF" />
              </View>
              <View style={styles.roleInfo}>
                <Text style={styles.roleTitle}>{role.title}</Text>
                <Text style={styles.roleDescription}>{role.description}</Text>
              </View>
              <View style={styles.roleSelector}>
                <View
                  style={[
                    styles.radioButton,
                    selectedRole === role.id && styles.selectedRadioButton,
                  ]}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            (!selectedRole || loading) && styles.disabledButton,
          ]}
          onPress={handleContinue}
          disabled={!selectedRole || loading}
        >
          <Text style={styles.continueButtonText}>
            {loading ? 'Chargement...' : 'Continuer'}
          </Text>
          {!loading && <ArrowRight size={20} color="#FFFFFF" />}
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
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 8,
  },
  welcomeText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.8,
    textAlign: 'center',
    marginTop: 8,
  },
  rolesContainer: {
    marginBottom: 40,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  selectedRoleCard: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  roleIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  roleInfo: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  roleDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 4,
  },
  roleSelector: {
    marginLeft: 16,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  selectedRadioButton: {
    backgroundColor: '#FF7A00',
    borderColor: '#FF7A00',
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