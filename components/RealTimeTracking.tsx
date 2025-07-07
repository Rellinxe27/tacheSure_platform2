import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MapPin, Clock, Shield, Phone, TriangleAlert as AlertTriangle } from 'lucide-react-native';

interface RealTimeTrackingProps {
  taskId: string;
  userRole: 'client' | 'provider';
  onEmergency?: () => void;
}

interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: Date;
  accuracy: number;
}

interface TaskStatus {
  status: 'en_route' | 'arrived' | 'in_progress' | 'completed';
  estimatedArrival?: Date;
  actualArrival?: Date;
  startTime?: Date;
  endTime?: Date;
}

export default function RealTimeTracking({ taskId, userRole, onEmergency }: RealTimeTrackingProps) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [taskStatus, setTaskStatus] = useState<TaskStatus>({ status: 'en_route' });
  const [isTracking, setIsTracking] = useState(false);
  const [lastCheckIn, setLastCheckIn] = useState<Date | null>(null);

  useEffect(() => {
    // Simulate real-time location updates
    if (isTracking) {
      const interval = setInterval(() => {
        // Mock location data - in real app, use expo-location
        setLocation({
          latitude: 5.3600 + (Math.random() - 0.5) * 0.01,
          longitude: -4.0083 + (Math.random() - 0.5) * 0.01,
          timestamp: new Date(),
          accuracy: 10
        });
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isTracking]);

  const handleCheckIn = () => {
    const now = new Date();
    setLastCheckIn(now);
    
    if (taskStatus.status === 'en_route') {
      setTaskStatus({ ...taskStatus, status: 'arrived', actualArrival: now });
      Alert.alert('Arrivée confirmée', 'Vous avez confirmé votre arrivée sur le lieu de la tâche');
    } else if (taskStatus.status === 'arrived') {
      setTaskStatus({ ...taskStatus, status: 'in_progress', startTime: now });
      Alert.alert('Tâche commencée', 'Vous avez commencé la tâche');
    }
  };

  const handleCheckOut = () => {
    const now = new Date();
    setTaskStatus({ ...taskStatus, status: 'completed', endTime: now });
    setIsTracking(false);
    Alert.alert('Tâche terminée', 'Vous avez marqué la tâche comme terminée');
  };

  const startTracking = () => {
    setIsTracking(true);
    Alert.alert('Suivi activé', 'Le suivi GPS en temps réel a été activé');
  };

  const stopTracking = () => {
    setIsTracking(false);
    Alert.alert('Suivi désactivé', 'Le suivi GPS a été désactivé');
  };

  const getStatusText = () => {
    switch (taskStatus.status) {
      case 'en_route': return 'En route';
      case 'arrived': return 'Arrivé sur place';
      case 'in_progress': return 'Tâche en cours';
      case 'completed': return 'Tâche terminée';
      default: return 'Statut inconnu';
    }
  };

  const getStatusColor = () => {
    switch (taskStatus.status) {
      case 'en_route': return '#FF9800';
      case 'arrived': return '#2196F3';
      case 'in_progress': return '#FF7A00';
      case 'completed': return '#4CAF50';
      default: return '#666';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
        <TouchableOpacity style={styles.emergencyButton} onPress={onEmergency}>
          <AlertTriangle size={20} color="#FF5722" />
        </TouchableOpacity>
      </View>

      {location && (
        <View style={styles.locationCard}>
          <View style={styles.locationHeader}>
            <MapPin size={20} color="#FF7A00" />
            <Text style={styles.locationTitle}>Position actuelle</Text>
          </View>
          <Text style={styles.locationText}>
            Lat: {location.latitude.toFixed(6)}, Lng: {location.longitude.toFixed(6)}
          </Text>
          <Text style={styles.locationAccuracy}>
            Précision: ±{location.accuracy}m
          </Text>
          <Text style={styles.locationTime}>
            Dernière mise à jour: {location.timestamp.toLocaleTimeString()}
          </Text>
        </View>
      )}

      <View style={styles.trackingControls}>
        {userRole === 'provider' && (
          <>
            <TouchableOpacity
              style={[styles.trackingButton, isTracking ? styles.stopButton : styles.startButton]}
              onPress={isTracking ? stopTracking : startTracking}
            >
              <Shield size={20} color="#FFFFFF" />
              <Text style={styles.trackingButtonText}>
                {isTracking ? 'Arrêter le suivi' : 'Démarrer le suivi'}
              </Text>
            </TouchableOpacity>

            {isTracking && taskStatus.status !== 'completed' && (
              <TouchableOpacity style={styles.checkInButton} onPress={handleCheckIn}>
                <Clock size={20} color="#FFFFFF" />
                <Text style={styles.checkInButtonText}>
                  {taskStatus.status === 'en_route' ? 'Confirmer arrivée' : 'Commencer tâche'}
                </Text>
              </TouchableOpacity>
            )}

            {taskStatus.status === 'in_progress' && (
              <TouchableOpacity style={styles.checkOutButton} onPress={handleCheckOut}>
                <Text style={styles.checkOutButtonText}>Terminer la tâche</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {userRole === 'client' && isTracking && (
          <View style={styles.clientInfo}>
            <Text style={styles.clientInfoText}>
              Le prestataire partage sa position en temps réel
            </Text>
            <TouchableOpacity style={styles.contactButton}>
              <Phone size={16} color="#FF7A00" />
              <Text style={styles.contactButtonText}>Contacter</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {lastCheckIn && (
        <View style={styles.checkInInfo}>
          <Text style={styles.checkInText}>
            Dernier check-in: {lastCheckIn.toLocaleTimeString()}
          </Text>
        </View>
      )}

      <View style={styles.safetyInfo}>
        <Shield size={16} color="#4CAF50" />
        <Text style={styles.safetyText}>
          Suivi sécurisé - Vos données sont protégées
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  emergencyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFEBEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginLeft: 8,
  },
  locationText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 4,
  },
  locationAccuracy: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 4,
  },
  locationTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  trackingControls: {
    marginBottom: 16,
  },
  trackingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#FF5722',
  },
  trackingButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  checkInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  checkInButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  checkOutButton: {
    backgroundColor: '#FF7A00',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkOutButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  clientInfo: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  clientInfoText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#1976D2',
    textAlign: 'center',
    marginBottom: 8,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  contactButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FF7A00',
    marginLeft: 4,
  },
  checkInInfo: {
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
  checkInText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#2E7D32',
    textAlign: 'center',
  },
  safetyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  safetyText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#4CAF50',
    marginLeft: 6,
  },
});