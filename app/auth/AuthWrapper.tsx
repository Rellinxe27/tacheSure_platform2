// app/auth/AuthWrapper.tsx
import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter, useSegments } from 'expo-router';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'auth';
    const isIndex = segments.length === 0 || segments[0] === 'index';

    // Prevent multiple navigation calls
    if (hasNavigated.current) return;

    if (!user && !inAuthGroup && !isIndex) {
      hasNavigated.current = true;
      router.replace('/auth/login');
    } else if (user && (inAuthGroup || isIndex)) {
      hasNavigated.current = true;
      router.replace('/(tabs)');
    }

    // Reset navigation flag after a delay
    if (hasNavigated.current) {
      setTimeout(() => {
        hasNavigated.current = false;
      }, 1000);
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF7A00" />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
});