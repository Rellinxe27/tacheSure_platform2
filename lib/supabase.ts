// lib/supabase.ts - Enhanced configuration for real-time
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

console.log('🔗 Supabase URL:', supabaseUrl);
console.log('🔑 Supabase Key exists:', !!supabaseAnonKey);

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
  },
  global: {
    headers: {
      'X-Client-Info': 'tachesure-mobile',
    },
  },
});

// Test connection
supabase.auth.onAuthStateChange((event, session) => {
  console.log('🔐 Auth state changed:', event, session?.user?.id);
});

// Test real-time connection
const testChannel = supabase.channel('connection-test');
testChannel.subscribe((status) => {
  console.log('📡 Real-time connection status:', status);
});