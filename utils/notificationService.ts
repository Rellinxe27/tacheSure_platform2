// utils/notificationService.ts - Fixed notification creation
export class NotificationService {
  /**
   * Create a notification in the database with immediate return
   */
  static async createNotification(notificationData: NotificationData): Promise<{ success: boolean; id?: string }> {
    try {
      console.log('Creating notification:', notificationData);

      const { data, error } = await supabase
        .from('notifications')
        .insert({
          ...notificationData,
          is_read: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Notification creation error:', error);
        throw error;
      }

      console.log('✅ Notification created successfully:', data.id);
      return { success: true, id: data.id };
    } catch (error) {
      console.error('Error creating notification:', error);
      return { success: false };
    }
  }

  /**
   * Notify provider about new booking - Fixed
   */
  static async notifyProviderOfBooking(
    providerId: string,
    clientName: string,
    serviceName: string,
    scheduledDate: string,
    scheduledTime: string,
    taskId: string,
    budget: number
  ): Promise<boolean> {
    console.log('Notifying provider:', providerId, 'about booking from:', clientName);

    const notificationData: NotificationData = {
      user_id: providerId,
      title: 'Nouvelle demande de service',
      message: `${clientName} souhaite réserver ${serviceName} pour le ${scheduledDate} à ${scheduledTime}`,
      type: 'task_update',
      data: {
        task_id: taskId,
        client_name: clientName,
        service_name: serviceName,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        budget: budget,
        action_text: 'Voir la demande'
      },
      action_url: `/task-request/${taskId}`
    };

    const result = await this.createNotification(notificationData);

    if (result.success) {
      // Also send push notification
      const pushData: PushNotificationData = {
        title: 'Nouvelle demande de service',
        body: `${clientName} souhaite réserver ${serviceName}`,
        data: {
          task_id: taskId,
          type: 'task_booking',
          action_url: `/task-request/${taskId}`
        },
        badge: 1
      };

      await this.sendPushNotification(providerId, pushData);
    }

    return result.success;
  }
}

// hooks/useNotifications.ts - Fixed version
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { useAuth } from '@/app/contexts/AuthContext';

type Notification = Database['public']['Tables']['notifications']['Row'];

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    if (!user) return;

    fetchNotifications();
    setupRealTimeSubscription();

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching notifications:', error);
      } else {
        setNotifications(data || []);
        const unread = data?.filter(n => !n.is_read).length || 0;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeSubscription = () => {
    if (!user || subscriptionRef.current) return;

    console.log('Setting up notifications subscription for user:', user.id);

    subscriptionRef.current = supabase
      .channel(`notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('🔥 New notification received:', payload.new);
          const newNotification = payload.new as Notification;

          setNotifications(prev => {
            // Check for duplicates
            if (prev.some(n => n.id === newNotification.id)) {
              return prev;
            }
            return [newNotification, ...prev];
          });

          setUnreadCount(prev => prev + 1);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('📝 Notification updated:', payload.new);
          const updatedNotification = payload.new as Notification;

          setNotifications(prev =>
            prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
          );

          // Auto-decrement count when notification is marked as read
          if (updatedNotification.is_read) {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Notifications subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time notifications active');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Notifications subscription failed');
          // Retry subscription after delay
          setTimeout(() => {
            if (subscriptionRef.current) {
              supabase.removeChannel(subscriptionRef.current);
              subscriptionRef.current = null;
            }
            setupRealTimeSubscription();
          }, 5000);
        }
      });
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (!error) {
        // Update local state immediately
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (!error) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, is_read: true }))
        );
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
};