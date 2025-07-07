import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Phone, MapPin, Shield, TriangleAlert as AlertTriangle, Clock, Users } from 'lucide-react-native';
import { Platform } from 'react-native';

export default function EmergencyCenterScreen() {
  const router = useRouter();
  const [emergencyContacts, setEmergencyContacts] = useState([
    { name: 'Police Nationale', number: '170', type: 'police' },
    { name: 'Sapeurs-Pompiers', number: '180', type: 'fire' },
    { name: 'SAMU', number: '185', type: 'medical' },
    { name: 'Gendarmerie', number: '172', type: 'police' }
  ]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [emergencyMode, setEmergencyMode] = useState(false);

  useEffect(() => {
    // Simulate getting user location
    setUserLocation({ lat: 5.3600, lng: -4.0083 });
  }, []);

  const handleEmergencyCall = (number: string, service: string) => {
    Alert.alert(
      'Appel d\'urgence',
      `Appeler ${service} au ${number}?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Appeler',
          style: 'destructive',
          onPress: () => {
            if (Platform.OS !== 'web') {
              Linking.openURL(`tel:${number}`);
            } else {
              Alert.alert('Simulation', `Appel vers ${number} simulé sur web`);
            }
          }
        }
      ]
    );
  };

  const activateEmergencyMode = () => {
    setEmergencyMode(true);
    Alert.alert(
      'Mode urgence activé',
      'Vos contacts d\'urgence ont été notifiés et votre position est partagée en temps réel.',
      [{ text: 'OK' }]
    );
  };

  const deactivateEmergencyMode = () => {
    setEmergencyMode(false);
    Alert.alert('Mode urgence désactivé', 'Le partage de position a été arrêté.');
  };

  const shareLocation = () => {
    if (userLocation) {
      const locationUrl = `https://maps.google.com/?q=${userLocation.lat},${userLocation.lng}`;
      Alert.alert(
        'Position partagée',
        `Votre position a été partagée: ${locationUrl}`,
        [{ text: 'OK' }]
      );
    }
  };

  const reportIncident = () => {
    Alert.alert(
      'Signaler un incident',
      'Quel type d\'incident souhaitez-vous signaler?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Comportement suspect', onPress: () => reportIncidentType('suspect') },
        { text: 'Agression', onPress: () => reportIncidentType('assault') },
        { text: 'Vol', onPress: () => reportIncidentType('theft') },
        { text: 'Autre', onPress: () => reportIncidentType('other') }
      ]
    );
  };

  const reportIncidentType = (type: string) => {
    Alert.alert(
      'Incident signalé',
      `Votre signalement de type "${type}" a été envoyé aux autorités compétentes et à l'équipe TâcheSûre.`
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Centre d'urgence</Text>
        <Shield size={24} color="#FFFFFF" />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {emergencyMode && (
          <View style={styles.emergencyModeCard}>
            <View style={styles.emergencyModeHeader}>
              <AlertTriangle size={24} color="#FF5722" />
              <Text style={styles.emergencyModeTitle}>MODE URGENCE ACTIVÉ</Text>
            </View>
            <Text style={styles.emergencyModeText}>
              Votre position est partagée en temps réel avec vos contacts d'urgence
            </Text>
            <TouchableOpacity
              style={styles.deactivateButton}
              onPress={deactivateEmergencyMode}
            >
              <Text style={styles.deactivateButtonText}>Désactiver</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.quickActionsCard}>
          <Text style={styles.cardTitle}>Actions rapides</Text>
          
          <TouchableOpacity
            style={[styles.emergencyButton, emergencyMode && styles.emergencyButtonActive]}
            onPress={emergencyMode ? deactivateEmergencyMode : activateEmergencyMode}
          >
            <AlertTriangle size={24} color="#FFFFFF" />
            <Text style={styles.emergencyButtonText}>
              {emergencyMode ? 'Désactiver urgence' : 'Activer mode urgence'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={shareLocation}>
            <MapPin size={20} color="#2196F3" />
            <Text style={styles.actionButtonText}>Partager ma position</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={reportIncident}>
            <Shield size={20} color="#FF9800" />
            <Text style={styles.actionButtonText}>Signaler un incident</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.emergencyContactsCard}>
          <Text style={styles.cardTitle}>Numéros d'urgence</Text>
          
          {emergencyContacts.map((contact, index) => (
            <TouchableOpacity
              key={index}
              style={styles.contactItem}
              onPress={() => handleEmergencyCall(contact.number, contact.name)}
            >
              <View style={styles.contactInfo}>
                <Phone size={20} color={getContactColor(contact.type)} />
                <View style={styles.contactDetails}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactNumber}>{contact.number}</Text>
                </View>
              </View>
              <View style={[styles.contactType, { backgroundColor: getContactColor(contact.type) }]}>
                <Text style={styles.contactTypeText}>{getContactTypeText(contact.type)}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.safetyTipsCard}>
          <Text style={styles.cardTitle}>Conseils de sécurité</Text>
          
          <View style={styles.tipItem}>
            <Clock size={16} color="#4CAF50" />
            <Text style={styles.tipText}>
              Informez toujours quelqu'un de vos déplacements
            </Text>
          </View>
          
          <View style={styles.tipItem}>
            <Users size={16} color="#4CAF50" />
            <Text style={styles.tipText}>
              Préférez les lieux publics pour les premiers rendez-vous
            </Text>
          </View>
          
          <View style={styles.tipItem}>
            <Shield size={16} color="#4CAF50" />
            <Text style={styles.tipText}>
              Vérifiez toujours l'identité du prestataire
            </Text>
          </View>
          
          <View style={styles.tipItem}>
            <Phone size={16} color="#4CAF50" />
            <Text style={styles.tipText}>
              Gardez votre téléphone chargé et accessible
            </Text>
          </View>
        </View>

        <View style={styles.platformSupportCard}>
          <Text style={styles.cardTitle}>Support TâcheSûre</Text>
          <Text style={styles.supportText}>
            Notre équipe de sécurité est disponible 24h/24 pour vous aider
          </Text>
          
          <TouchableOpacity style={styles.supportButton}>
            <Phone size={20} color="#FFFFFF" />
            <Text style={styles.supportButtonText}>Contacter le support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function getContactColor(type: string): string {
  switch (type) {
    case 'police': return '#2196F3';
    case 'fire': return '#FF5722';
    case 'medical': return '#4CAF50';
    default: return '#666';
  }
}

function getContactTypeText(type: string): string {
  switch (type) {
    case 'police': return 'Police';
    case 'fire': return 'Pompiers';
    case 'medical': return 'Médical';
    default: return 'Urgence';
  }
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
    backgroundColor: '#FF5722',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emergencyModeCard: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FF5722',
  },
  emergencyModeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emergencyModeTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FF5722',
    marginLeft: 8,
  },
  emergencyModeText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#D32F2F',
    marginBottom: 12,
  },
  deactivateButton: {
    backgroundColor: '#FF5722',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  deactivateButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  quickActionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF5722',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  emergencyButtonActive: {
    backgroundColor: '#D32F2F',
  },
  emergencyButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333',
    marginLeft: 12,
  },
  emergencyContactsCard: {
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
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactDetails: {
    marginLeft: 12,
  },
  contactName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  contactNumber: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 2,
  },
  contactType: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  contactTypeText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  safetyTipsCard: {
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
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
  },
  platformSupportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  supportText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 16,
    lineHeight: 18,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF7A00',
    paddingVertical: 12,
    borderRadius: 8,
  },
  supportButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});