// utils/permissions.ts
import * as Location from 'expo-location';
import { Camera } from 'expo-camera';

export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
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
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return null;

    return await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
};