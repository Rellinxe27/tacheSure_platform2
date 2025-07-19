// lib/supabase.ts - Enhanced real-time configuration
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { Database } from './database.types';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
    heartbeatIntervalMs: 30000,
    reconnectAfterMs: (tries) => Math.min(tries * 1000, 30000),
  },
  global: {
    headers: {
      'X-Client-Info': 'tachesure-mobile',
    },
  },
});

// Enhanced connection monitoring
supabase.auth.onAuthStateChange((event, session) => {
  console.log('🔐 Auth state changed:', event, session?.user?.id);
});

// Connection test with better error handling
const testRealTimeConnection = () => {
  const testChannel = supabase.channel('connection-test');
  testChannel
    .subscribe((status) => {
      console.log('📡 Real-time connection test:', status);
      if (status === 'SUBSCRIBED') {
        console.log('✅ Real-time ready');
        // Clean up test channel
        setTimeout(() => supabase.removeChannel(testChannel), 1000);
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Real-time connection failed');
      }
    });
};

// Test connection when client is created
setTimeout(testRealTimeConnection, 1000);