// hooks/useMessages.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { useAuth } from '@/app/contexts/AuthContext';

type Conversation = Database['public']['Tables']['conversations']['Row'];
type Message = Database['public']['Tables']['messages']['Row'];

export const useMessages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      try {
        const { data, error } = await supabase
          .from('conversations')
          .select('*')
          .contains('participants', [user.id])
          .order('last_message_at', { ascending: false });

        if (error) {
          console.error('Error fetching conversations:', error);
        } else {
          setConversations(data || []);
        }
      } catch (err) {
        console.error('Error fetching conversations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    // Subscribe to real-time conversation updates
    const subscription = supabase
      .channel('conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const createConversation = async (participants: string[], taskId?: string) => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          participants,
          task_id: taskId,
        })
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      setConversations(prev => [data, ...prev]);
      return { data };
    } catch (err) {
      return { error: 'Failed to create conversation' };
    }
  };

  return {
    conversations,
    loading,
    createConversation,
  };
};

export const useConversationMessages = (conversationId: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conversationId) return;

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching messages:', error);
        } else {
          setMessages(data || []);
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Subscribe to real-time message updates
    const subscription = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [conversationId]);

  const sendMessage = async (content: string, messageType: string = 'text') => {
    if (!user || !conversationId) return { error: 'Missing required data' };

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          message_type: messageType,
        })
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      // Update conversation last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

      return { data };
    } catch (err) {
      return { error: 'Failed to send message' };
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', messageId);

      if (!error) {
        setMessages(prev =>
          prev.map(m => m.id === messageId ? { ...m, is_read: true } : m)
        );
      }
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  };

  return {
    messages,
    loading,
    sendMessage,
    markAsRead,
  };
};