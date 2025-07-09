// utils/permissions.ts
import * as Location from 'expo-location';
import { Camera } from 'expo-camera';
import { Alert } from 'react-native';

export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    // Check current permission status
    const { status: existingStatus } = await Location.getForegroundPermissionsAsync();

    if (existingStatus === 'granted') {
      return true;
    }

    // Request permission if not granted
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permission refusée',
        'L\'accès à la localisation est nécessaire pour utiliser cette fonctionnalité. Veuillez l\'activer dans les paramètres.',
        [{ text: 'OK' }]
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
};

export const requestCameraPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Camera.requestCameraPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting camera permission:', error);
    return false;
  }
};

export const getCurrentLocation = async (): Promise<Location.LocationObject | null> => {
  try {
    // Check if location services are enabled
    const isLocationEnabled = await Location.hasServicesEnabledAsync();
    if (!isLocationEnabled) {
      Alert.alert(
        'Localisation désactivée',
        'Veuillez activer les services de localisation dans les paramètres de votre appareil.'
      );
      return null;
    }

    // Request permissions
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      return null;
    }

    // Get location with timeout and fallback options
    return await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced, // Changed from High for better compatibility
      timeout: 15000, // 15 second timeout
      maximumAge: 10000, // Accept location up to 10 seconds old
    });
  } catch (error) {
    console.error('Error getting current location:', error);

    // Try with lower accuracy as fallback
    try {
      return await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low,
        timeout: 10000,
        maximumAge: 30000,
      });
    } catch (fallbackError) {
      console.error('Fallback location also failed:', fallbackError);
      Alert.alert(
        'Erreur GPS',
        'Impossible de récupérer votre position. Vérifiez que la localisation est activée et réessayez.'
      );
      return null;
    }
  }
};