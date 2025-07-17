import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import CulturalIntegration from '@/components/CulturalIntegration';

/**
 * Cultural Integration Screen
 * 
 * This screen provides access to cultural integration features specific to Côte d'Ivoire,
 * including community integration, cultural communication patterns, and social structure adaptation.
 */
export default function CulturalIntegrationScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Intégration Culturelle',
          headerShown: false,
        }} 
      />
      <CulturalIntegration />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
});