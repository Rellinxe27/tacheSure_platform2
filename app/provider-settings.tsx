import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, Shield, MapPin, Clock, DollarSign, User, Phone, Mail, Lock, HelpCircle, LogOut } from 'lucide-react-native';
import { useAuth } from '@/app/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProviderSettingsScreen() {
  const router = useRouter();
  const { profile, signOut } = useAuth();
  const [settings, setSettings] = useState({
    notifications: {
      newRequests: true,
      messages: true,
      taskReminders: true,
      paymentUpdates: true,
      marketingEmails: false
    },
    privacy: {
      showLocation: true,
      showPhoneNumber: false,
      allowReviews: true,
      shareAnalytics: true
    },
    availability: {
      autoAccept: false,
      instantBooking: true,
      weekendWork: true,
      emergencyTasks: true
    }
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(`settings_${profile?.id}`);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings: typeof settings) => {
    try {
      await AsyncStorage.setItem(`settings_${profile?.id}`, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleToggleSetting = async (category: keyof typeof settings, setting: string) => {
    const newSettings = {
      ...settings,
      [category]: {
        ...settings[category],
        [setting]: !settings[category][setting as keyof typeof settings[category]]
      }
    };

    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            Alert.alert('Déconnecté', 'Vous avez été déconnecté avec succès');
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Supprimer le compte',
      'Cette action est irréversible. Toutes vos données seront supprimées définitivement.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Compte supprimé', 'Votre compte a été supprimé avec succès');
            router.push('/auth/login');
          }
        }
      ]
    );
  };

  const menuItems = [
    {
      section: 'Compte',
      items: [
        { id: 'profile', title: 'Informations personnelles', icon: User, route: '/personal-info' },
        { id: 'verification', title: 'Vérification d\'identité', icon: Shield, route: '/verification-status' },
        { id: 'password', title: 'Mot de passe et sécurité', icon: Lock, route: '/security-settings' }
      ]
    },
    ...(profile?.role === 'provider' ? [{
      section: 'Services',
      items: [
        { id: 'services', title: 'Gérer mes services', icon: DollarSign, route: '/service-management' },
        { id: 'availability', title: 'Calendrier de disponibilité', icon: Clock, route: '/availability-calendar' },
        { id: 'pricing', title: 'Tarifs et conditions', icon: DollarSign, route: '/pricing-settings' }
      ]
    }] : []),
    {
      section: 'Support',
      items: [
        { id: 'help', title: 'Centre d\'aide', icon: HelpCircle, route: '/help-support' },
        { id: 'contact_support', title: 'Contacter le support', icon: Phone, route: '/contact-support' },
        { id: 'feedback', title: 'Envoyer des commentaires', icon: Mail, route: '/send-feedback' }
      ]
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paramètres</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Bell size={18} color="#333" /> Notifications
          </Text>

          <View style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Nouvelles demandes de tâches</Text>
              <Switch
                value={settings.notifications.newRequests}
                onValueChange={() => handleToggleSetting('notifications', 'newRequests')}
                trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                thumbColor={settings.notifications.newRequests ? '#FFFFFF' : '#F4F3F4'}
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Messages des clients</Text>
              <Switch
                value={settings.notifications.messages}
                onValueChange={() => handleToggleSetting('notifications', 'messages')}
                trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                thumbColor={settings.notifications.messages ? '#FFFFFF' : '#F4F3F4'}
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Rappels de tâches</Text>
              <Switch
                value={settings.notifications.taskReminders}
                onValueChange={() => handleToggleSetting('notifications', 'taskReminders')}
                trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                thumbColor={settings.notifications.taskReminders ? '#FFFFFF' : '#F4F3F4'}
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Mises à jour de paiement</Text>
              <Switch
                value={settings.notifications.paymentUpdates}
                onValueChange={() => handleToggleSetting('notifications', 'paymentUpdates')}
                trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                thumbColor={settings.notifications.paymentUpdates ? '#FFFFFF' : '#F4F3F4'}
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Emails marketing</Text>
              <Switch
                value={settings.notifications.marketingEmails}
                onValueChange={() => handleToggleSetting('notifications', 'marketingEmails')}
                trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                thumbColor={settings.notifications.marketingEmails ? '#FFFFFF' : '#F4F3F4'}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Shield size={18} color="#333" /> Confidentialité
          </Text>

          <View style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Afficher ma localisation</Text>
              <Switch
                value={settings.privacy.showLocation}
                onValueChange={() => handleToggleSetting('privacy', 'showLocation')}
                trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                thumbColor={settings.privacy.showLocation ? '#FFFFFF' : '#F4F3F4'}
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Afficher mon numéro de téléphone</Text>
              <Switch
                value={settings.privacy.showPhoneNumber}
                onValueChange={() => handleToggleSetting('privacy', 'showPhoneNumber')}
                trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                thumbColor={settings.privacy.showPhoneNumber ? '#FFFFFF' : '#F4F3F4'}
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Autoriser les avis clients</Text>
              <Switch
                value={settings.privacy.allowReviews}
                onValueChange={() => handleToggleSetting('privacy', 'allowReviews')}
                trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                thumbColor={settings.privacy.allowReviews ? '#FFFFFF' : '#F4F3F4'}
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Partager les données analytiques</Text>
              <Switch
                value={settings.privacy.shareAnalytics}
                onValueChange={() => handleToggleSetting('privacy', 'shareAnalytics')}
                trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                thumbColor={settings.privacy.shareAnalytics ? '#FFFFFF' : '#F4F3F4'}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Clock size={18} color="#333" /> Disponibilité
          </Text>

          <View style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Acceptation automatique des demandes</Text>
              <Switch
                value={settings.availability.autoAccept}
                onValueChange={() => handleToggleSetting('availability', 'autoAccept')}
                trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                thumbColor={settings.availability.autoAccept ? '#FFFFFF' : '#F4F3F4'}
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Réservation instantanée</Text>
              <Switch
                value={settings.availability.instantBooking}
                onValueChange={() => handleToggleSetting('availability', 'instantBooking')}
                trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                thumbColor={settings.availability.instantBooking ? '#FFFFFF' : '#F4F3F4'}
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Disponible le week-end</Text>
              <Switch
                value={settings.availability.weekendWork}
                onValueChange={() => handleToggleSetting('availability', 'weekendWork')}
                trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                thumbColor={settings.availability.weekendWork ? '#FFFFFF' : '#F4F3F4'}
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Accepter les tâches d'urgence</Text>
              <Switch
                value={settings.availability.emergencyTasks}
                onValueChange={() => handleToggleSetting('availability', 'emergencyTasks')}
                trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                thumbColor={settings.availability.emergencyTasks ? '#FFFFFF' : '#F4F3F4'}
              />
            </View>
          </View>
        </View>

        {menuItems.map((menuSection) => (
          <View key={menuSection.section} style={styles.section}>
            <Text style={styles.sectionTitle}>{menuSection.section}</Text>
            <View style={styles.menuCard}>
              {menuSection.items.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.menuItem,
                    index === menuSection.items.length - 1 && styles.lastMenuItem
                  ]}
                  onPress={() => router.push(item.route as any)}
                >
                  <View style={styles.menuItemContent}>
                    <item.icon size={20} color="#666" />
                    <Text style={styles.menuItemText}>{item.title}</Text>
                  </View>
                  <Text style={styles.menuItemArrow}>→</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions du compte</Text>
          <View style={styles.actionsCard}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <LogOut size={20} color="#FF5722" />
              <Text style={styles.logoutButtonText}>Déconnexion</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
              <Text style={styles.deleteButtonText}>Supprimer mon compte</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333',
    flex: 1,
    marginRight: 16,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333',
    marginLeft: 12,
  },
  menuItemArrow: {
    fontSize: 16,
    color: '#666',
  },
  actionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEBEE',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  logoutButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FF5722',
    marginLeft: 8,
  },
  deleteButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  deleteButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#999',
    textDecorationLine: 'underline',
  },
});