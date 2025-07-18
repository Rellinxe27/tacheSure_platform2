// app/notifications.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert
} from 'react-native';
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Calendar,
  MessageCircle,
  DollarSign,
  Star,
  AlertTriangle,
  Info,
  Gift,
  Settings
} from 'lucide-react-native';
import { useNotifications } from '@/hooks/useNotifications';
import { formatTimeAgo } from '@/utils/formatting';
import { useDynamicIslandNotification } from '@/components/SnackBar';
import { useRouter } from 'expo-router';


interface NotificationIconProps {
  type: string;
  size: number;
  color: string;
}

function NotificationIcon({ type, size, color }: NotificationIconProps) {
  switch (type) {
    case 'service_booking':
      return <Calendar size={size} color={color} />;
    case 'message':
      return <MessageCircle size={size} color={color} />;
    case 'payment':
      return <DollarSign size={size} color={color} />;
    case 'review':
      return <Star size={size} color={color} />;
    case 'alert':
      return <AlertTriangle size={size} color={color} />;
    case 'promotion':
      return <Gift size={size} color={color} />;
    default:
      return <Info size={size} color={color} />;
  }
}

function getNotificationColor(type: string): string {
  switch (type) {
    case 'service_booking': return '#FF7A00';
    case 'message': return '#4CAF50';
    case 'payment': return '#2196F3';
    case 'review': return '#FFD700';
    case 'alert': return '#FF5722';
    case 'promotion': return '#9C27B0';
    default: return '#666';
  }
}

export default function NotificationsScreen() {
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { showNotification, NotificationComponent } = useDynamicIslandNotification();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Trigger refetch (would be implemented in hook)
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
    showNotification('Notification marquée comme lue', 'success');
  };

  const router = useRouter();

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;

    Alert.alert(
      'Marquer tout comme lu',
      `Marquer ${unreadCount} notifications comme lues ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            await markAllAsRead();
            showNotification('Toutes les notifications marquées comme lues', 'success');
          }
        }
      ]
    );
  };

  const handleNotificationTap = (notification: any) => {
    console.log('Action URL:', notification.action_url); // Check this
    console.log('Full notification:', notification);
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.action_url) {
      // Handle navigation to specific screen
      router.push(notification.action_url as any);
    }
  };

  return (
    <View style={styles.container}>
      <NotificationComponent />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Bell size={24} color="#FF7A00" />
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.markAllButton}
              onPress={handleMarkAllAsRead}
            >
              <CheckCheck size={20} color="#FF7A00" />
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.settingsButton}>
            <Settings size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Notifications List */}
      <ScrollView
        style={styles.notificationsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Chargement des notifications...</Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <BellOff size={48} color="#CCC" />
            <Text style={styles.emptyTitle}>Aucune notification</Text>
            <Text style={styles.emptySubtitle}>
              Vous serez notifié des mises à jour importantes ici
            </Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationCard,
                !notification.is_read && styles.unreadCard
              ]}
              onPress={() => handleNotificationTap(notification)}
            >
              <View style={styles.notificationIcon}>
                <NotificationIcon
                  type={notification.type}
                  size={20}
                  color={getNotificationColor(notification.type)}
                />
              </View>

              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <Text style={[
                    styles.notificationTitle,
                    !notification.is_read && styles.unreadTitle
                  ]}>
                    {notification.title}
                  </Text>
                  <Text style={styles.notificationTime}>
                    {formatTimeAgo(notification.created_at)}
                  </Text>
                </View>

                <Text style={styles.notificationMessage}>
                  {notification.message}
                </Text>

                {notification.data?.action_text && (
                  <View style={styles.actionContainer}>
                    <Text style={styles.actionText}>
                      {notification.data.action_text}
                    </Text>
                  </View>
                )}
              </View>

              {!notification.is_read && (
                <TouchableOpacity
                  style={styles.markReadButton}
                  onPress={() => handleMarkAsRead(notification.id)}
                >
                  <Check size={16} color="#4CAF50" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickAction}>
          <MessageCircle size={20} color="#FF7A00" />
          <Text style={styles.quickActionText}>Messages</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickAction}>
          <Calendar size={20} color="#FF7A00" />
          <Text style={styles.quickActionText}>Agenda</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickAction}>
          <DollarSign size={20} color="#FF7A00" />
          <Text style={styles.quickActionText}>Paiements</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginLeft: 12,
  },
  unreadBadge: {
    backgroundColor: '#FF5722',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    paddingHorizontal: 4,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markAllButton: {
    padding: 8,
    marginRight: 8,
  },
  settingsButton: {
    padding: 8,
  },
  notificationsList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 250,
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF7A00',
    backgroundColor: '#FFF8F3',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  unreadTitle: {
    fontFamily: 'Inter-SemiBold',
  },
  notificationTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#999',
  },
  notificationMessage: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 18,
  },
  actionContainer: {
    marginTop: 8,
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FF7A00',
  },
  markReadButton: {
    padding: 4,
    marginLeft: 8,
  },
  quickActions: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FF7A00',
    marginTop: 4,
  },
});