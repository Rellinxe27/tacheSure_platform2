// app/(tabs)/calendar.tsx
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '@/app/contexts/AuthContext';

export default function CalendarTab() {
  const router = useRouter();
  const { profile } = useAuth();

  useEffect(() => {
    if (profile?.role === 'provider') {
      router.replace('/availability-calendar');
    } else {
      router.replace('/(tabs)/index');
    }
  }, [profile]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FF7A00" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
});