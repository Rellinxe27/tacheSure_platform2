// app/chat.tsx - Complete chat screen matching your design
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/app/contexts/AuthContext';
import { useConversationMessages } from '@/hooks/useMessages';
import { ArrowLeft, Send, Paperclip, Camera, MapPin, Shield } from 'lucide-react-native';
import SafetyButton from '@/components/SafetyButton';
import { useWhatsAppBottomNotification } from '@/components/SnackBar';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'provider';
  timestamp: Date;
  type: 'text' | 'location' | 'image';
}

export default function ChatScreen() {
  const router = useRouter();
  const { conversationId, taskId } = useLocalSearchParams();
  const { user } = useAuth();
  const { messages: dbMessages, loading, sendMessage: sendDbMessage, markAsRead } = useConversationMessages(conversationId as string);
  const { showNotification, NotificationComponent } = useWhatsAppBottomNotification();

  const scrollViewRef = useRef<ScrollView>(null);
  const [message, setMessage] = useState('');
  const [otherUser, setOtherUser] = useState<any>(null);

  // Convert database messages to UI format
  const messages: Message[] = dbMessages.map(msg => ({
    id: msg.id,
    text: msg.content || '',
    sender: msg.sender_id === user?.id ? 'user' : 'provider',
    timestamp: new Date(msg.created_at),
    type: msg.message_type === 'location' ? 'location' : 'text'
  }));

  // Mark messages as read
  useEffect(() => {
    dbMessages.forEach(msg => {
      if (msg.sender_id !== user?.id && !msg.is_read) {
        markAsRead(msg.id);
      }
    });
  }, [dbMessages, user?.id]);

  // Get other user info from conversation
  useEffect(() => {
    if (dbMessages.length > 0 && user) {
      // TODO: Fetch actual user profile from participants
      setOtherUser({
        name: 'Utilisateur',
        isOnline: true,
        isVerified: true,
        lastSeen: 'En ligne'
      });
    }
  }, [dbMessages, user]);

  const provider = otherUser || {
    name: 'Conversation',
    isOnline: false,
    isVerified: false,
    lastSeen: 'Hors ligne'
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const messageText = message.trim();
    setMessage('');

    // Send to database
    if (conversationId) {
      const result = await sendDbMessage(messageText);
      if (result.error) {
        showNotification('Erreur lors de l\'envoi', 'error');
        setMessage(messageText); // Restore message on error
      }
    } else {
      showNotification('Conversation non trouvée', 'error');
    }
  };

  const shareLocation = async () => {
    if (conversationId) {
      const result = await sendDbMessage('Position partagée', 'location');
      if (result.error) {
        showNotification('Erreur lors du partage', 'error');
      } else {
        showNotification('Position partagée', 'success');
      }
    }
  };

  const handleAttachment = () => {
    showNotification('Fonctionnalité bientôt disponible', 'info');
  };

  const handleCamera = () => {
    showNotification('Appareil photo bientôt disponible', 'info');
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
            <MapPin size={16} color="#FF7A00" />
            <Text style={styles.locationText}>Position partagée</Text>
          </View>
          <Text style={styles.messageTime}>{formatTime(msg.timestamp)}</Text>
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
        <Text style={styles.messageTime}>{formatTime(msg.timestamp)}</Text>
      </View>
    );
  };

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
        <SafetyButton />
      </View>

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
    color: '#666',
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
    color: '#FF7A00',
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