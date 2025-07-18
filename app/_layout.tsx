// app/_layout.tsx (Keep your existing code, just add AuthWrapper)
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { SplashScreen } from 'expo-router';
import { AuthProvider } from './contexts/AuthContext';
import AuthWrapper from './auth/AuthWrapper';

// Prevent auto-hide splash screen
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AuthProvider>
      <AuthWrapper>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/register" />
          <Stack.Screen name="auth/forgot-password" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="verification" />
          <Stack.Screen name="task-details" />
          <Stack.Screen name="task-status" />
          <Stack.Screen name="provider-profile" />
          <Stack.Screen name="provider-dashboard" />
          <Stack.Screen name="service-management" />
          <Stack.Screen name="availability-calendar" />
          <Stack.Screen name="edit-service" />
          <Stack.Screen name="earnings" />
          <Stack.Screen name="provider-settings" />
          <Stack.Screen name="verification-status" />
          <Stack.Screen name="document-scanner" />
          <Stack.Screen name="background-check" />
          <Stack.Screen name="references-form" />
          <Stack.Screen name="chat" />
          <Stack.Screen name="emergency-center" />
          <Stack.Screen name="advanced-search" />
          <Stack.Screen name="help-support" />
          <Stack.Screen name="personal-info" />
          <Stack.Screen name="security-settings" />
          <Stack.Screen name="pricing-settings" />
          <Stack.Screen name="contact-support" />
          <Stack.Screen name="send-feedback" />
          <Stack.Screen name="task-request/[id]" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </AuthWrapper>
    </AuthProvider>
  );
}