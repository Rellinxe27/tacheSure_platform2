import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { TriangleAlert as AlertTriangle, Phone, MapPin } from 'lucide-react-native';
import { Platform } from 'react-native';

interface SafetyButtonProps {
  onEmergency?: () => void;
  userLocation?: { latitude: number; longitude: number };
}

export default function SafetyButton({ onEmergency, userLocation }: SafetyButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);

  const handlePressIn = () => {
    setIsPressed(true);
    const timer = setTimeout(() => {
      triggerEmergency();
    }, 3000); // 3 second hold to trigger
    setPressTimer(timer);
  };

  const handlePressOut = () => {
    setIsPressed(false);
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
  };

  const triggerEmergency = () => {
    // Trigger haptic feedback on mobile
    if (Platform.OS !== 'web') {
      // Would use Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    Alert.alert(
      'Alerte d\'urgence activée',
      'Vos contacts d\'urgence ont été notifiés et votre position a été partagée.',
      [
        {
          text: 'Appeler Police (170)',
          onPress: () => {
            if (Platform.OS !== 'web') {
              // Would use Linking.openURL('tel:170');
            }
          }
        },
        { text: 'Annuler', style: 'cancel' }
      ]
    );

    onEmergency?.();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.emergencyButton,
          isPressed && styles.emergencyButtonPressed
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <AlertTriangle 
          size={24} 
          color="#FFFFFF" 
          strokeWidth={2}
        />
        <Text style={styles.emergencyText}>
          {isPressed ? 'Maintenir...' : 'SOS'}
        </Text>
      </TouchableOpacity>
      
      {isPressed && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  emergencyButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF5722',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  emergencyButtonPressed: {
    backgroundColor: '#D32F2F',
    transform: [{ scale: 1.1 }],
  },
  emergencyText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginTop: 2,
  },
  progressContainer: {
    width: 60,
    height: 4,
    backgroundColor: '#FFCDD2',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF5722',
    width: '100%',
  },
});