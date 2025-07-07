import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Send, Paperclip, Camera, MapPin, Shield } from 'lucide-react-native';
import SafetyButton from '@/components/SafetyButton';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'provider';
  timestamp: Date;
  type: 'text' | 'location' | 'image';
}

export default function ChatScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Bonjour! J\'ai vu votre demande de réparation de plomberie. Je suis disponible cet après-midi.',
      sender: 'provider',
      timestamp: new Date(Date.now() - 3600000),
      type: 'text'
    },
    {
      id: '2',
      text: 'Parfait! À quelle heure pouvez-vous passer?',
      sender: 'user',
      timestamp: new Date(Date.now() - 3300000),
      type: 'text'
    },
    {
      id: '3',
      text: 'Je peux être là vers 14h30. Avez-vous tous les outils nécessaires?',
      sender: 'provider',
      timestamp: new Date(Date.now() - 3000000),
      type: 'text'
    },
    {
      id: '4',
      text: 'Oui, j\'ai tout le matériel. Pouvez-vous me confirmer l\'adresse exacte?',
      sender: 'provider',
      timestamp: new Date(Date.now() - 2700000),
      type: 'text'
    },
    {
      id: '5',
      text: 'Bien sûr, voici ma localisation:',
      sender: 'user',
      timestamp: new Date(Date.now() - 2400000),
      type: 'location'
    }
  ]);

  const provider = {
    name: 'Kouadio Jean',
    isOnline: true,
    isVerified: true,
    lastSeen: 'En ligne'
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: message.trim(),
        sender: 'user',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages([...messages, newMessage]);
      setMessage('');
      
      // Simulate provider response
      setTimeout(() => {
        const responses = [
          'Merci pour l\'information!',
          'Parfait, je serai là à l\'heure.',
          'D\'accord, à tout à l\'heure.',
          'Reçu, merci!'
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        const providerMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: randomResponse,
          sender: 'provider',
          timestamp: new Date(),
          type: 'text'
        };
        setMessages(prev => [...prev, providerMessage]);
      }, 1000);
    }
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
          <TouchableOpacity style={styles.attachButton}>
            <Paperclip size={20} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.cameraButton}>
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
          <TouchableOpacity style={styles.quickAction}>
            <MapPin size={16} color="#FF7A00" />
            <Text style={styles.quickActionText}>Partager ma position</Text>
          </TouchableOpacity>
        </View>
      </View>
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