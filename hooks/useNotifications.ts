// hooks/useNotifications.ts - Fixed real-time subscription
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
  const channelRef = useRef<any>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    fetchNotifications();
    setupRealTimeSubscription();

    return () => {
      cleanup();
    };
  }, [user?.id]);

  const cleanup = () => {
    if (channelRef.current) {
      console.log('🔌 Cleaning up notifications channel');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  };

  const fetchNotifications = async () => {
    if (!user?.id) return;

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
        setUnreadCount(data?.filter(n => !n.is_read).length || 0);
      }
    } catch (err) {
      console.error('Notifications fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeSubscription = () => {
    if (!user?.id || channelRef.current) return;

    console.log('🔧 Setting up notifications subscription for:', user.id);

    // Create a unique channel name
    const channelName = `notifications_${user.id}_${Date.now()}`;

    channelRef.current = supabase
      .channel(channelName)
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
            // Prevent duplicates
            if (prev.find(n => n.id === newNotification.id)) {
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
            prev.map(n =>
              n.id === updatedNotification.id ? updatedNotification : n
            )
          );

          // Update unread count if marked as read
          if (updatedNotification.is_read) {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Notifications subscription status:', status);

        switch (status) {
          case 'SUBSCRIBED':
            console.log('✅ Real-time notifications active');
            // Clear any retry timeout
            if (retryTimeoutRef.current) {
              clearTimeout(retryTimeoutRef.current);
              retryTimeoutRef.current = null;
            }
            break;

          case 'CHANNEL_ERROR':
          case 'TIMED_OUT':
          case 'CLOSED':
            console.error('❌ Notifications subscription failed:', status);
            // Cleanup current channel
            if (channelRef.current) {
              supabase.removeChannel(channelRef.current);
              channelRef.current = null;
            }

            // Retry with exponential backoff
            retryTimeoutRef.current = setTimeout(() => {
              console.log('🔄 Retrying notifications subscription...');
              setupRealTimeSubscription();
            }, 3000);
            break;
        }
      });
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // Optimistic update
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Server update
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        // Revert optimistic update on error
        await fetchNotifications();
      }
    } catch (err) {
      console.error('Mark as read error:', err);
      // Revert optimistic update
      await fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;

    try {
      // Optimistic update
      const unreadNotifications = notifications.filter(n => !n.is_read);
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);

      // Server update
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        // Revert optimistic update
        await fetchNotifications();
      }
    } catch (err) {
      console.error('Mark all as read error:', err);
      // Revert optimistic update
      await fetchNotifications();
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