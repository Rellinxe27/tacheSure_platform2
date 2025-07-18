// utils/notificationService.ts
import { supabase } from '@/lib/supabase';

interface NotificationData {
  user_id: string;
  title: string;
  message: string;
  type: 'task_update' | 'message' | 'payment' | 'review' | 'alert' | 'promotion';
  data?: any;
  action_url?: string;
}

interface PushNotificationData {
  title: string;
  body: string;
  data?: any;
  sound?: string;
  badge?: number;
}

export class NotificationService {
  /**
   * Create a notification in the database
   */
  static async createNotification(notificationData: NotificationData): Promise<{ success: boolean; id?: string }> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          ...notificationData,
          is_read: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, id: data.id };
    } catch (error) {
      console.error('Error creating notification:', error);
      return { success: false };
    }
  }

  /**
   * Send push notification to user
   */
  static async sendPushNotification(userId: string, notification: PushNotificationData): Promise<boolean> {
    try {
      // Get user's active push tokens
      const { data: pushTokens } = await supabase
        .from('push_tokens')
        .select('token, platform')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (!pushTokens || pushTokens.length === 0) {
        console.log(`No active push tokens for user ${userId}`);
        return false;
      }

      // Send to each token
      const pushPromises = pushTokens.map(tokenData =>
        this.sendToPushToken(tokenData.token, notification)
      );

      const results = await Promise.allSettled(pushPromises);
      const successCount = results.filter(result => result.status === 'fulfilled').length;

      return successCount > 0;
    } catch (error) {
      console.error('Error sending push notifications:', error);
      return false;
    }
  }

  /**
   * Send notification to specific push token
   */
  private static async sendToPushToken(pushToken: string, notification: PushNotificationData): Promise<void> {
    const message = {
      to: pushToken,
      sound: notification.sound || 'default',
      title: notification.title,
      body: notification.body,
      data: notification.data || {},
      badge: notification.badge,
    };

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`Push notification failed: ${response.statusText}`);
    }
  }

  /**
   * Create notification and send push notification
   */
  static async notifyUser(
    notificationData: NotificationData,
    pushData?: PushNotificationData
  ): Promise<{ success: boolean; notificationId?: string }> {
    try {
      // Create database notification
      const dbResult = await this.createNotification(notificationData);

      if (!dbResult.success) {
        return { success: false };
      }

      // Send push notification if data provided
      if (pushData) {
        await this.sendPushNotification(notificationData.user_id, pushData);
      }

      return { success: true, notificationId: dbResult.id };
    } catch (error) {
      console.error('Error in notifyUser:', error);
      return { success: false };
    }
  }

  /**
   * Notify provider about new booking
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

    const pushData: PushNotificationData = {
      title: 'Nouvelle demande de service',
      body: `${clientName} souhaite réserver ${serviceName}`,
      data: {
        task_id: taskId,
        type: 'task_booking',
        action_url: `/task/${taskId}`
      },
      badge: 1
    };

    const result = await this.notifyUser(notificationData, pushData);
    return result.success;
  }

  /**
   * Notify client about booking status change
   */
  static async notifyClientOfBookingUpdate(
    clientId: string,
    providerName: string,
    serviceName: string,
    status: string,
    taskId: string
  ): Promise<boolean> {
    const statusMessages = {
      accepted: `${providerName} a accepté votre demande pour ${serviceName}`,
      rejected: `${providerName} a décliné votre demande pour ${serviceName}`,
      completed: `${providerName} a marqué ${serviceName} comme terminé`,
      cancelled: `${providerName} a annulé ${serviceName}`
    };

    const message = statusMessages[status as keyof typeof statusMessages] ||
      `Mise à jour de votre réservation: ${status}`;

    const notificationData: NotificationData = {
      user_id: clientId,
      title: 'Mise à jour de réservation',
      message,
      type: 'task_update',
      data: {
        task_id: taskId,
        provider_name: providerName,
        service_name: serviceName,
        status: status,
        action_text: 'Voir les détails'
      },
      action_url: `/task/${taskId}`
    };

    const pushData: PushNotificationData = {
      title: 'Mise à jour de réservation',
      body: message,
      data: {
        task_id: taskId,
        type: 'task_update',
        action_url: `/task/${taskId}`
      },
      badge: 1
    };

    const result = await this.notifyUser(notificationData, pushData);
    return result.success;
  }

  /**
   * Notify about payment events
   */
  static async notifyPaymentUpdate(
    userId: string,
    amount: number,
    status: string,
    taskId?: string
  ): Promise<boolean> {
    const statusMessages = {
      completed: `Paiement de ${amount} FCFA reçu avec succès`,
      failed: `Échec du paiement de ${amount} FCFA`,
      refunded: `Remboursement de ${amount} FCFA effectué`,
      pending: `Paiement de ${amount} FCFA en cours de traitement`
    };

    const message = statusMessages[status as keyof typeof statusMessages] ||
      `Mise à jour de paiement: ${status}`;

    const notificationData: NotificationData = {
      user_id: userId,
      title: 'Mise à jour de paiement',
      message,
      type: 'payment',
      data: {
        amount,
        status,
        task_id: taskId,
        action_text: 'Voir les détails'
      },
      action_url: taskId ? `/task/${taskId}` : '/payments'
    };

    const pushData: PushNotificationData = {
      title: 'Mise à jour de paiement',
      body: message,
      data: {
        amount,
        status,
        task_id: taskId,
        type: 'payment'
      },
      badge: 1
    };

    const result = await this.notifyUser(notificationData, pushData);
    return result.success;
  }

  /**
   * Notify about new messages
   */
  static async notifyNewMessage(
    userId: string,
    senderName: string,
    messagePreview: string,
    conversationId: string
  ): Promise<boolean> {
    const notificationData: NotificationData = {
      user_id: userId,
      title: `Message de ${senderName}`,
      message: messagePreview,
      type: 'message',
      data: {
        sender_name: senderName,
        conversation_id: conversationId,
        action_text: 'Répondre'
      },
      action_url: `/chat?conversationId=${conversationId}`
    };

    const pushData: PushNotificationData = {
      title: `Message de ${senderName}`,
      body: messagePreview,
      data: {
        conversation_id: conversationId,
        type: 'message',
        action_url: `/chat?conversationId=${conversationId}`
      },
      badge: 1
    };

    const result = await this.notifyUser(notificationData, pushData);
    return result.success;
  }
}