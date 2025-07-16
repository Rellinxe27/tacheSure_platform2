// app/(tabs)/_layout.tsx - Final Fix
import { Tabs } from 'expo-router';
import { Chrome as Home, Search, MessageCircle, User, Plus, Shield, Calendar, Briefcase } from 'lucide-react-native';
import { useAuth } from '@/app/contexts/AuthContext';
import { useEffect } from 'react';

export default function TabLayout() {
  const { profile, loading } = useAuth();

  // Debug logging
  useEffect(() => {
    if (profile) {
      console.log('🔍 Profile Role:', profile.role);
      console.log('🔍 Role Type:', typeof profile.role);
      console.log('🔍 Is Admin Check:', profile.role === 'admin' || profile.role === 'moderator');
    }
  }, [profile]);

  if (loading || !profile) return null;

  const isProvider = profile.role === 'provider';
  const isAdmin = profile.role === 'admin' || profile.role === 'moderator';

  console.log('🎯 Final render - isAdmin:', isAdmin, 'role:', profile.role);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF7A00',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Inter-Medium',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} />
          ),
        }}
      />

      {/* Search tab - Only for clients and admins */}
      <Tabs.Screen
        name="search"
        options={{
          title: 'Recherche',
          tabBarIcon: ({ size, color }) => (
            <Search size={size} color={color} />
          ),
          href: isProvider ? null : '/search',
        }}
      />

      {/* Calendar tab - Only for providers */}
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Planning',
          tabBarIcon: ({ size, color }) => (
            <Calendar size={size} color={color} />
          ),
          href: isProvider ? '/availability-calendar' : null,
        }}
      />

      <Tabs.Screen
        name="post-task"
        options={{
          title: isProvider ? 'Services' : 'Publier',
          tabBarIcon: ({ size, color }) => (
            isProvider ? <Briefcase size={size} color={color} /> : <Plus size={size} color={color} />
          ),
          href: isProvider ? '/service-management' : '/post-task',
        }}
      />

      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ size, color }) => (
            <MessageCircle size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ size, color }) => (
            <User size={size} color={color} />
          ),
        }}
      />

      {/* Admin tab - CRITICAL FIX */}
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Admin',
          tabBarIcon: ({ size, color }) => (
            <Shield size={size} color={color} />
          ),
          href: isAdmin ? '/admin' : null,
        }}
      />
    </Tabs>
  );
}