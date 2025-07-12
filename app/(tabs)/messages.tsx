// app/(tabs)/messages.tsx - Real-time messaging with Supabase
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/app/contexts/AuthContext';
import { useMessages } from '@/hooks/useMessages';
import { MessageCircle, Plus, Search } from 'lucide-react-native';
import { formatTimeAgo } from '@/utils/formatting';

export default function MessagesScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { conversations, loading } = useMessages();

  const handleConversationPress = (conversationId: string) => {
    router.push(`/chat?conversationId=${conversationId}`);
  };

  const handleNewMessage = () => {
    router.push('/new-conversation');
  };

  const renderConversationItem = ({ item }: { item: any }) => {
    // Get the other participant's info
    const otherParticipant = item.other_participant;
    const participantName = otherParticipant?.full_name || 'Utilisateur';
    const participantAvatar = otherParticipant?.avatar_url;

    // Determine online status
    const isOnline = otherParticipant?.last_seen_at
      ? new Date().getTime() - new Date(otherParticipant.last_seen_at).getTime() < 5 * 60 * 1000 // 5 minutes
      : false;

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => handleConversationPress(item.id)}
      >
        <View style={styles.avatarContainer}>
          {participantAvatar ? (
            <Image
              source={{ uri: participantAvatar }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.defaultAvatar}>
              <Text style={styles.avatarText}>
                {participantName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          {isOnline && <View style={styles.onlineIndicator} />}
        </View>

        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.participantName}>
              {participantName}
            </Text>
            <Text style={styles.timestamp}>
              {formatTimeAgo(item.last_message_at || item.created_at)}
            </Text>
          </View>

          <Text style={styles.lastMessage} numberOfLines={2}>
            {item.last_message || 'Nouvelle conversation'}
          </Text>

          {item.task_id && (
            <View style={styles.taskIndicator}>
              <Text style={styles.taskText}>📋 Tâche associée</Text>
            </View>
          )}
        </View>

        {item.unread_count > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadCount}>
              {item.unread_count > 99 ? '99+' : item.unread_count}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Pull to refresh functionality
  const handleRefresh = () => {
    refetch();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <MessageCircle size={40} color="#FF7A00" />
        <Text style={styles.loadingText}>Chargement des conversations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.searchButton}>
            <Search size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.newMessageButton} onPress={handleNewMessage}>
            <Plus size={24} color="#FF7A00" />
          </TouchableOpacity>
        </View>
      </View>

      {conversations.length === 0 ? (
        <View style={styles.emptyState}>
          <MessageCircle size={60} color="#E0E0E0" />
          <Text style={styles.emptyTitle}>Aucune conversation</Text>
          <Text style={styles.emptySubtitle}>
            Commencez à discuter avec des prestataires ou des clients
          </Text>
          <TouchableOpacity style={styles.startChatButton} onPress={handleNewMessage}>
            <Text style={styles.startChatText}>Nouvelle conversation</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.conversationsList}
          onRefresh={handleRefresh}
          refreshing={loading}
        />
      )}
    </View>
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
      backgroundColor: '#FFFFFF',
      paddingTop: 60,
      paddingHorizontal: 20,
      paddingBottom: 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: '#E0E0E0',
    },
    title: {
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      color: '#333',
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    searchButton: {
      padding: 8,
      marginRight: 8,
    },
    newMessageButton: {
      padding: 8,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    emptyTitle: {
      fontSize: 20,
      fontFamily: 'Inter-SemiBold',
      color: '#333',
      marginTop: 20,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: '#666',
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 32,
    },
    startChatButton: {
      backgroundColor: '#FF7A00',
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    startChatText: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: '#FFFFFF',
    },
    conversationsList: {
      paddingVertical: 8,
    },
    conversationItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
    },
    avatarContainer: {
      position: 'relative',
      marginRight: 12,
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
    },
    onlineIndicator: {
      position: 'absolute',
      bottom: 2,
      right: 2,
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: '#4CAF50',
      borderWidth: 2,
      borderColor: '#FFFFFF',
    },
    conversationContent: {
      flex: 1,
    },
    conversationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    participantName: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: '#333',
    },
    timestamp: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: '#666',
    },
    lastMessage: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: '#666',
      lineHeight: 18,
    },
    taskIndicator: {
      marginTop: 4,
    },
    taskText: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      color: '#FF7A00',
    },
    unreadBadge: {
      backgroundColor: '#FF7A00',
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 6,
    },
    unreadCount: {
      fontSize: 12,
      fontFamily: 'Inter-Bold',
      color: '#FFFFFF',
    },
    // Chat screen styles
    headerInfo: {
      flex: 1,
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: '#333',
    },
    headerSubtitle: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: '#4CAF50',
    },
    headerButton: {
      padding: 8,
      marginLeft: 8,
    },
    messagesList: {
      flex: 1,
      backgroundColor: '#F8F9FA',
    },
    messagesContent: {
      paddingVertical: 16,
    },
    messageContainer: {
      paddingHorizontal: 16,
      marginBottom: 8,
    },
    myMessageContainer: {
      alignItems: 'flex-end',
    },
    otherMessageContainer: {
      alignItems: 'flex-start',
    },
    messageBubble: {
      maxWidth: '80%',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
    },
    myMessageBubble: {
      backgroundColor: '#FF7A00',
      borderBottomRightRadius: 4,
    },
    otherMessageBubble: {
      backgroundColor: '#FFFFFF',
      borderBottomLeftRadius: 4,
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
    },
    myMessageText: {
      color: '#FFFFFF',
    },
    otherMessageText: {
      color: '#333',
    },
    messageTime: {
      fontSize: 10,
      fontFamily: 'Inter-Regular',
      marginTop: 4,
    },
    myMessageTime: {
      color: 'rgba(255,255,255,0.8)',
    },
    otherMessageTime: {
      color: '#666',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      backgroundColor: '#FFFFFF',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: '#E0E0E0',
    },
    attachButton: {
      padding: 8,
      marginRight: 8,
    },
    messageInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: '#E0E0E0',
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      maxHeight: 80,
      backgroundColor: '#F8F9FA',
    },
    sendButton: {
      backgroundColor: '#FF7A00',
      borderRadius: 20,
      padding: 8,
      marginLeft: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    voiceButton: {
      padding: 8,
      marginLeft: 8,
    },
  });