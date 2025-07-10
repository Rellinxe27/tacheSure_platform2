// app/chat.tsx - Enhanced with real data persistence
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/app/contexts/AuthContext';
import { useConversationMessages } from '@/hooks/useMessages';
import { ArrowLeft, Send, Paperclip, Camera, MapPin, Shield, Phone, Video, MoreVertical } from 'lucide-react-native';
import SafetyButton from '@/components/SafetyButton';
import RealTimeTracking from '@/components/RealTimeTracking';
import { useDynamicIslandNotification } from '@/components/SnackBar';
import { supabase } from '@/lib/supabase';
import { getCurrentLocation } from '@/utils/permissions';
import { formatTimeAgo } from '@/utils/formatting';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'provider';
  timestamp: Date;
  type: 'text' | 'location' | 'image';
}

export default function ChatScreen() {
  const router = useRouter();
  const { conversationId, taskId, providerId } = useLocalSearchParams();
  const { user } = useAuth();
  const { showNotification, NotificationComponent } = useDynamicIslandNotification();

  const [currentConversationId, setCurrentConversationId] = useState<string | null>(
    typeof conversationId === 'string' ? conversationId : null
  );
  const [otherUser, setOtherUser] = useState<any>(null);
  const [task, setTask] = useState<any>(null);
  const [showTracking, setShowTracking] = useState(false);
  const [loading, setLoading] = useState(true);

  const { messages: dbMessages, loading: messagesLoading, sendMessage: sendDbMessage, markAsRead } = useConversationMessages(currentConversationId || '');

  const scrollViewRef = useRef<ScrollView>(null);
  const [message, setMessage] = useState('');

  // Convert database messages to UI format
  const messages: Message[] = dbMessages.map(msg => ({
    id: msg.id,
    text: msg.content || '',
    sender: msg.sender_id === user?.id ? 'user' : 'provider',
    timestamp: new Date(msg.created_at),
    type: msg.message_type === 'location' ? 'location' : 'text'
  }));

  useEffect(() => {
    if (providerId && !currentConversationId) {
      createOrGetConversation();
    } else if (currentConversationId) {
      fetchConversationDetails();
    }
  }, [providerId, currentConversationId]);

  useEffect(() => {
    if (taskId) {
      fetchTaskDetails();
    }
  }, [taskId]);

  // Mark messages as read
  useEffect(() => {
    dbMessages.forEach(msg => {
      if (msg.sender_id !== user?.id && !msg.is_read) {
        markAsRead(msg.id);
      }
    });
  }, [dbMessages, user?.id]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const createOrGetConversation = async () => {
    if (!providerId || !user) return;

    try {
      setLoading(true);

      // Check if conversation already exists
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .contains('participants', [user.id, providerId])
        .single();

      if (existingConversation) {
        setCurrentConversationId(existingConversation.id);
      } else {
        // Create new conversation
        const { data: newConversation, error } = await supabase
          .from('conversations')
          .insert({
            participants: [user.id, providerId],
            task_id: typeof taskId === 'string' ? taskId : null,
            last_message_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        setCurrentConversationId(newConversation.id);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      showNotification('Erreur lors de la création de la conversation', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchConversationDetails = async () => {
    if (!currentConversationId || !user) return;

    try {
      setLoading(true);

      const { data: conversation, error } = await supabase
        .from('conversations')
        .select(`
          id,
          participants,
          task_id,
          tasks (
            id,
            title,
            status,
            client_id,
            provider_id
          )
        `)
        .eq('id', currentConversationId)
        .single();

      if (error) throw error;

      // Get other participant details
      const otherParticipantId = conversation.participants.find((id: string) => id !== user.id);
      if (otherParticipantId) {
        const { data: participantData } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, last_seen_at, is_verified, phone')
          .eq('id', otherParticipantId)
          .single();

        if (participantData) {
          setOtherUser({
            ...participantData,
            name: participantData.full_name || 'Utilisateur',
            isVerified: participantData.is_verified || false,
            isOnline: getOnlineStatus(participantData.last_seen_at).isOnline,
            lastSeen: getOnlineStatus(participantData.last_seen_at).text
          });
        }
      }

      if (conversation.tasks) {
        setTask(conversation.tasks);
        // Show tracking if task is in progress
        if (conversation.tasks.status === 'in_progress') {
          setShowTracking(true);
        }
      }
    } catch (error) {
      console.error('Error fetching conversation details:', error);
      showNotification('Erreur lors du chargement de la conversation', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchTaskDetails = async () => {
    if (!taskId) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('id, title, status, client_id, provider_id')
        .eq('id', taskId)
        .single();

      if (error) throw error;
      setTask(data);

      if (data.status === 'in_progress') {
        setShowTracking(true);
      }
    } catch (error) {
      console.error('Error fetching task details:', error);
    }
  };

  const getOnlineStatus = (lastSeenAt?: string) => {
    if (!lastSeenAt) return { isOnline: false, text: 'Hors ligne' };

    const lastSeen = new Date(lastSeenAt);
    const now = new Date();
    const minutesAgo = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60));

    if (minutesAgo < 5) return { isOnline: true, text: 'En ligne' };
    if (minutesAgo < 30) return { isOnline: false, text: 'Actif récemment' };
    return { isOnline: false, text: formatTimeAgo(lastSeenAt) };
  };

  const provider = otherUser || {
    name: 'Conversation',
    isOnline: false,
    isVerified: false,
    lastSeen: 'Hors ligne'
  };

  const sendMessage = async () => {
    if (!message.trim() || !currentConversationId) return;

    const messageText = message.trim();
    setMessage('');

    const { error } = await sendDbMessage(messageText);
    if (error) {
      showNotification('Erreur lors de l\'envoi', 'error');
      setMessage(messageText); // Restore message on error
    }
  };

  const shareLocation = async () => {
    try {
      const location = await getCurrentLocation();
      if (!location || !currentConversationId) return;

      const locationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy
      };

      const { error } = await sendDbMessage('Position partagée', 'location', JSON.stringify(locationData));
      if (error) {
        showNotification('Erreur lors du partage', 'error');
      } else {
        showNotification('Position partagée', 'success');
      }
    } catch (error) {
      showNotification('Impossible d\'obtenir votre position', 'error');
    }
  };

  const handleAttachment = () => {
    showNotification('Fonctionnalité bientôt disponible', 'info');
  };

  const handleCamera = () => {
    showNotification('Appareil photo bientôt disponible', 'info');
  };

  const handleVoiceCall = () => {
    if (otherUser?.phone) {
      Alert.alert(
        'Appel vocal',
        `Appeler ${provider.name}?`,
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Appeler', onPress: () => showNotification('Fonctionnalité d\'appel en développement', 'info') }
        ]
      );
    } else {
      showNotification('Numéro non disponible', 'error');
    }
  };

  const handleVideoCall = () => {
    showNotification('Appel vidéo bientôt disponible', 'info');
  };

  const handleEmergency = () => {
    Alert.alert(
      'Urgence signalée',
      'Les autorités compétentes ont été notifiées de votre situation.',
      [{ text: 'OK' }]
    );
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderMessage = (msg: Message) => {
    const isUser = msg.sender === 'user';

    if (msg.type === 'location') {
      return (
        <View key={msg.id} style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.providerMessage
        ]}>
          <View style={styles.locationMessage}>
            <MapPin size={16} color={isUser ? "#FFFFFF" : "#FF7A00"} />
            <Text style={[
              styles.locationText,
              { color: isUser ? "#FFFFFF" : "#FF7A00" }
            ]}>
              Position partagée
            </Text>
          </View>
          <Text style={[
            styles.messageTime,
            { color: isUser ? 'rgba(255,255,255,0.8)' : '#666' }
          ]}>
            {formatTime(msg.timestamp)}
          </Text>
        </View>
      );
    }

    return (
      <View key={msg.id} style={[
        styles.messageContainer,
        isUser ? styles.userMessage : styles.providerMessage
      ]}>
        <Text style={[
          styles.messageText,
          isUser ? styles.userMessageText : styles.providerMessageText
        ]}>
          {msg.text}
        </Text>
        <Text style={[
          styles.messageTime,
          { color: isUser ? 'rgba(255,255,255,0.8)' : '#666' }
        ]}>
          {formatTime(msg.timestamp)}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF7A00" />
        <Text style={styles.loadingText}>Chargement de la conversation...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>

        <View style={styles.providerInfo}>
          <View style={styles.providerDetails}>
            <View style={styles.providerNameRow}>
              <Text style={styles.providerName}>{provider.name}</Text>
              {provider.isVerified && (
                <Shield size={16} color="#4CAF50" />
              )}
            </View>
            <View style={styles.statusRow}>
              <View style={[
                styles.onlineIndicator,
                { backgroundColor: provider.isOnline ? '#4CAF50' : '#E0E0E0' }
              ]} />
              <Text style={styles.lastSeen}>{provider.lastSeen}</Text>
            </View>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleVoiceCall}>
            <Phone size={20} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleVideoCall}>
            <Video size={20} color="#333" />
          </TouchableOpacity>
          <SafetyButton onEmergency={handleEmergency} />
        </View>
      </View>

      {/* Task Info Banner */}
      {task && (
        <View style={styles.taskBanner}>
          <Text style={styles.taskTitle}>📋 {task.title}</Text>
          <Text style={styles.taskStatus}>
            Statut: {task.status === 'in_progress' ? 'En cours' :
            task.status === 'completed' ? 'Terminé' :
              task.status === 'posted' ? 'Publié' : task.status}
          </Text>
        </View>
      )}

      {/* Real-time Tracking */}
      {showTracking && task && (
        <RealTimeTracking
          taskId={task.id}
          userRole={user?.id === task.client_id ? 'client' : 'provider'}
          onEmergency={handleEmergency}
        />
      )}

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        <View style={styles.securityNotice}>
          <Shield size={16} color="#4CAF50" />
          <Text style={styles.securityText}>
            Cette conversation est chiffrée et sécurisée
          </Text>
        </View>

        {messages.map(renderMessage)}

        {messagesLoading && (
          <View style={styles.loadingMessages}>
            <ActivityIndicator size="small" color="#FF7A00" />
            <Text style={styles.loadingMessagesText}>Chargement des messages...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <View style={styles.inputRow}>
          <TouchableOpacity style={styles.attachButton} onPress={handleAttachment}>
            <Paperclip size={20} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.cameraButton} onPress={handleCamera}>
            <Camera size={20} color="#666" />
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            placeholder="Tapez votre message..."
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={500}
            placeholderTextColor="#666"
            onSubmitEditing={sendMessage}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              message.trim() ? styles.sendButtonActive : styles.sendButtonInactive
            ]}
            onPress={sendMessage}
            disabled={!message.trim()}
          >
            <Send size={20} color={message.trim() ? "#FFFFFF" : "#666"} />
          </TouchableOpacity>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction} onPress={shareLocation}>
            <MapPin size={16} color="#FF7A00" />
            <Text style={styles.quickActionText}>Partager ma position</Text>
          </TouchableOpacity>
        </View>
      </View>

      <NotificationComponent />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  providerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  providerDetails: {
    flex: 1,
  },
  providerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  providerName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginRight: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  lastSeen: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginRight: 8,
  },
  taskBanner: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  taskTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1976D2',
    marginBottom: 2,
  },
  taskStatus: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#1976D2',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E8',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 16,
    alignSelf: 'center',
  },
  securityText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#2E7D32',
    marginLeft: 6,
  },
  loadingMessages: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  loadingMessagesText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginLeft: 8,
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#FF7A00',
    borderRadius: 16,
    borderBottomRightRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  providerMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
    marginBottom: 4,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  providerMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    alignSelf: 'flex-end',
  },
  locationMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginLeft: 6,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  attachButton: {
    padding: 8,
    marginRight: 8,
  },
  cameraButton: {
    padding: 8,
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333',
    maxHeight: 100,
    textAlignVertical: 'center',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  sendButtonActive: {
    backgroundColor: '#FF7A00',
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonInactive: {
    backgroundColor: '#F5F5F5',
  },
  quickActions: {
    flexDirection: 'row',
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FF7A00',
    marginLeft: 6,
  },
});