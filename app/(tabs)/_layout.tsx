// app/(tabs)/_layout.tsx - Enhanced with notification badges
import { Tabs } from 'expo-router';
import { Chrome as Home, Search, MessageCircle, User, Plus, Shield, Calendar, Briefcase, Bell } from 'lucide-react-native';
import { useAuth } from '@/app/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { useMessages } from '@/hooks/useMessages';
import { View, Text, StyleSheet } from 'react-native';

// Notification Badge Component
function NotificationBadge({ count, style }: { count: number; style?: any }) {
  if (count === 0) return null;

  return (
    <View style={[styles.badge, style]}>
      <Text style={styles.badgeText}>
        {count > 99 ? '99+' : count.toString()}
      </Text>
    </View>
  );
}

// Tab Icon with Badge Component
function TabIconWithBadge({
                            Icon,
                            size,
                            color,
                            badgeCount = 0,
                            badgeColor = '#FF5722'
                          }: {
  Icon: any;
  size: number;
  color: string;
  badgeCount?: number;
  badgeColor?: string;
}) {
  return (
    <View style={styles.iconContainer}>
      <Icon size={size} color={color} />
      {badgeCount > 0 && (
        <NotificationBadge
          count={badgeCount}
          style={[styles.tabBadge, { backgroundColor: badgeColor }]}
        />
      )}
    </View>
  );
}

export default function TabLayout() {
  const { profile, loading } = useAuth();
  const { unreadCount: notificationCount } = useNotifications();
  const { conversations } = useMessages();

  if (loading || !profile) return null;

  const isProvider = profile.role === 'provider';
  const isAdmin = profile.role === 'admin' || profile.role === 'moderator';

  // Calculate unread messages count
  const unreadMessagesCount = conversations.reduce((total, conv) =>
    total + (conv.unread_count || 0), 0
  );

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
            <TabIconWithBadge
              Icon={Home}
              size={size}
              color={color}
            />
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
        name="notifications"
        options={{
          title: 'Notifications',
          tabBarIcon: ({ size, color }) => (
            <TabIconWithBadge
              Icon={Bell}
              size={size}
              color={color}
              badgeCount={notificationCount}
              badgeColor="#FF5722"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ size, color }) => (
            <TabIconWithBadge
              Icon={MessageCircle}
              size={size}
              color={color}
              badgeCount={unreadMessagesCount}
              badgeColor="#4CAF50"
            />
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

const styles = StyleSheet.create({
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -12,
    backgroundColor: '#FF5722',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  tabBadge: {
    position: 'absolute',
    top: -6,
    right: -10,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    lineHeight: 12,
  },
});