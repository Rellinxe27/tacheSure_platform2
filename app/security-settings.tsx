// app/security-settings.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Lock, Eye, EyeOff, Shield, Smartphone, Key, AlertTriangle } from 'lucide-react-native';
import { useAuth } from '@/app/contexts/AuthContext';

export default function SecuritySettingsScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    biometricLogin: true,
    loginNotifications: true,
    sessionTimeout: true,
    deviceTracking: true
  });

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Erreur', 'Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Erreur', 'Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    try {
      // Simulate password change - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 2000));
      Alert.alert('Succès', 'Mot de passe modifié avec succès');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de modifier le mot de passe');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSetting = (setting: keyof typeof securitySettings) => {
    setSecuritySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleSignOutAllDevices = () => {
    Alert.alert(
      'Déconnexion de tous les appareils',
      'Cette action va vous déconnecter de tous vos appareils. Vous devrez vous reconnecter partout.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            Alert.alert('Déconnecté', 'Vous avez été déconnecté de tous les appareils');
          }
        }
      ]
    );
  };

  const activeTwoFactor = () => {
    Alert.alert(
      'Authentification à deux facteurs',
      'Cette fonctionnalité sera bientôt disponible. Vous serez notifié dès qu\'elle sera prête.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mot de passe et sécurité</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Password Change Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Lock size={20} color="#333" />
            <Text style={styles.sectionTitle}>Changer le mot de passe</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mot de passe actuel</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Entrez votre mot de passe actuel"
                secureTextEntry={!showCurrentPassword}
              />
              <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                {showCurrentPassword ?
                  <EyeOff size={20} color="#666" /> :
                  <Eye size={20} color="#666" />
                }
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nouveau mot de passe</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Entrez le nouveau mot de passe"
                secureTextEntry={!showNewPassword}
              />
              <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                {showNewPassword ?
                  <EyeOff size={20} color="#666" /> :
                  <Eye size={20} color="#666" />
                }
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmer le nouveau mot de passe</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirmez le nouveau mot de passe"
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ?
                  <EyeOff size={20} color="#666" /> :
                  <Eye size={20} color="#666" />
                }
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.changePasswordButton, loading && styles.disabledButton]}
            onPress={handlePasswordChange}
            disabled={loading}
          >
            <Text style={styles.changePasswordText}>
              {loading ? 'Modification...' : 'Changer le mot de passe'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Security Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shield size={20} color="#333" />
            <Text style={styles.sectionTitle}>Paramètres de sécurité</Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Authentification à deux facteurs</Text>
              <Text style={styles.settingDescription}>Protection supplémentaire par SMS</Text>
            </View>
            <TouchableOpacity
              style={styles.enableButton}
              onPress={activeTwoFactor}
            >
              <Text style={styles.enableButtonText}>Activer</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Connexion biométrique</Text>
              <Text style={styles.settingDescription}>Empreinte digitale ou reconnaissance faciale</Text>
            </View>
            <Switch
              value={securitySettings.biometricLogin}
              onValueChange={() => handleToggleSetting('biometricLogin')}
              trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
              thumbColor={securitySettings.biometricLogin ? '#FFFFFF' : '#F4F3F4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Notifications de connexion</Text>
              <Text style={styles.settingDescription}>Alerte en cas de nouvelle connexion</Text>
            </View>
            <Switch
              value={securitySettings.loginNotifications}
              onValueChange={() => handleToggleSetting('loginNotifications')}
              trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
              thumbColor={securitySettings.loginNotifications ? '#FFFFFF' : '#F4F3F4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Déconnexion automatique</Text>
              <Text style={styles.settingDescription}>Après 30 minutes d'inactivité</Text>
            </View>
            <Switch
              value={securitySettings.sessionTimeout}
              onValueChange={() => handleToggleSetting('sessionTimeout')}
              trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
              thumbColor={securitySettings.sessionTimeout ? '#FFFFFF' : '#F4F3F4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Suivi des appareils</Text>
              <Text style={styles.settingDescription}>Surveiller les connexions suspectes</Text>
            </View>
            <Switch
              value={securitySettings.deviceTracking}
              onValueChange={() => handleToggleSetting('deviceTracking')}
              trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
              thumbColor={securitySettings.deviceTracking ? '#FFFFFF' : '#F4F3F4'}
            />
          </View>
        </View>

        {/* Account Security Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Smartphone size={20} color="#333" />
            <Text style={styles.sectionTitle}>Gestion des sessions</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Appareils connectés</Text>
            <Text style={styles.infoText}>
              Vous êtes actuellement connecté sur cet appareil.
              Dernière activité: {new Date().toLocaleDateString('fr-FR')}
            </Text>
          </View>

          <TouchableOpacity style={styles.dangerButton} onPress={handleSignOutAllDevices}>
            <AlertTriangle size={20} color="#FF5722" />
            <Text style={styles.dangerButtonText}>Déconnecter tous les appareils</Text>
          </TouchableOpacity>
        </View>

        {/* Security Tips */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Key size={20} color="#333" />
            <Text style={styles.sectionTitle}>Conseils de sécurité</Text>
          </View>

          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Text style={styles.tipText}>• Utilisez un mot de passe fort et unique</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipText}>• Ne partagez jamais vos identifiants</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipText}>• Méfiez-vous des emails de phishing</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipText}>• Utilisez un réseau WiFi sécurisé</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipText}>• Mettez à jour régulièrement l'application</Text>
            </View>
          </View>
        </View>

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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginLeft: 8,
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
  changePasswordButton: {
    backgroundColor: '#FF7A00',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  changePasswordText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333',
  },
  settingDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 2,
  },
  enableButton: {
    backgroundColor: '#FF7A00',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  enableButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  infoCard: {
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 16,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEBEE',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF5722',
  },
  dangerButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FF5722',
    marginLeft: 8,
  },
  tipsList: {
    marginTop: 8,
  },
  tipItem: {
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 20,
  },
});