// hooks/useMessages.ts - Fixed real-time subscriptions
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { useAuth } from '@/app/contexts/AuthContext';

type Conversation = Database['public']['Tables']['conversations']['Row'] & {
  other_participant?: any;
  unread_count?: number;
  last_message?: string;
};
type Message = Database['public']['Tables']['messages']['Row'];

export const useMessages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    fetchConversations();

    // Real-time subscription for conversations and messages
    const channel = supabase
      .channel('realtime-conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        () => fetchConversations()
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        () => fetchConversations()
      )
      .subscribe((status) => {
        console.log('Conversations subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      const { data: conversationsData, error } = await supabase
        .from('conversations')
        .select('*')
        .contains('participants', [user.id])
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        return;
      }

      const processedConversations = await Promise.all(
        (conversationsData || []).map(async (conv) => {
          const otherParticipantIds = conv.participants.filter(id => id !== user.id);

          if (otherParticipantIds.length > 0) {
            const { data: participantData } = await supabase
              .from('profiles')
              .select('id, full_name, avatar_url, last_seen_at')
              .eq('id', otherParticipantIds[0])
              .single();

            const { count: unreadCount } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('conversation_id', conv.id)
              .neq('sender_id', user.id)
              .eq('is_read', false);

            const { data: lastMessage } = await supabase
              .from('messages')
              .select('content')
              .eq('conversation_id', conv.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            return {
              ...conv,
              other_participant: participantData,
              unread_count: unreadCount || 0,
              last_message: lastMessage?.content || 'Nouvelle conversation',
            };
          }
          return conv;
        })
      );

      setConversations(processedConversations);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (participants: string[], taskId?: string) => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          participants,
          task_id: taskId,
          last_message_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) return { error: error.message };
      return { data };
    } catch (err) {
      return { error: 'Failed to create conversation' };
    }
  };

  return { conversations, loading, createConversation, refetch: fetchConversations };
};

export const useConversationMessages = (conversationId: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conversationId) return;

    fetchMessages();

    // Real-time subscription for this conversation's messages
    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          console.log('🔥 New message received:', payload.new);
          const newMessage = payload.new as Message;

          setMessages(prev => {
            // Avoid duplicates
            if (prev.some(m => m.id === newMessage.id)) {
              return prev;
            }
            // Add new message and sort by timestamp
            return [...prev, newMessage].sort((a, b) =>
              new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
            );
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          console.log('📝 Message updated:', payload.new);
          const updatedMessage = payload.new as Message;
          setMessages(prev =>
            prev.map(m => m.id === updatedMessage.id ? updatedMessage : m)
          );
        }
      )
      .subscribe((status) => {
        console.log(`📡 Messages subscription for ${conversationId}:`, status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time messages active');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Real-time subscription failed');
        }
      });

    return () => {
      console.log('🔌 Unsubscribing from messages channel');
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const fetchMessages = async () => {
    if (!conversationId) return;

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
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string, messageType: string = 'text', metadata?: string) => {
    if (!user || !conversationId || !content.trim()) return { error: 'Missing data' };

    try {
      console.log('📤 Sending message:', content);

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim(),
          message_type: messageType,
          metadata: metadata ? JSON.parse(metadata) : null,
          is_read: false,
        })
        .select()
        .single();

      if (error) {
        console.error('Send message error:', error);
        return { error: error.message };
      }

      console.log('✅ Message sent successfully:', data.id);

      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

      // Don't add to local state - real-time subscription will handle it
      return { data };
    } catch (err) {
      console.error('Send error:', err);
      return { error: 'Failed to send message' };
    }
  };

  const markAsRead = async (messageId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('messages')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .neq('sender_id', user.id);
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  return { messages, loading, sendMessage, markAsRead };
};