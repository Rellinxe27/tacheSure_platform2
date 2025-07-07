import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Search, MessageCircle, Clock, Shield, Phone, Video } from 'lucide-react-native';

export default function MessagesScreen() {
  const conversations = [
    {
      id: 1,
      name: 'Kouadio Jean',
      service: 'Plomberie',
      lastMessage: 'Je serai là dans 30 minutes',
      time: '10:30',
      unread: 2,
      online: true,
      verified: true,
    },
    {
      id: 2,
      name: 'Aminata Traoré',
      service: 'Nettoyage',
      lastMessage: 'Merci pour votre confiance!',
      time: '09:15',
      unread: 0,
      online: false,
      verified: true,
    },
    {
      id: 3,
      name: 'Bakary Koné',
      service: 'Livraison',
      lastMessage: 'Colis livré avec succès',
      time: 'Hier',
      unread: 0,
      online: true,
      verified: true,
    },
    {
      id: 4,
      name: 'Fatou Diallo',
      service: 'Tutorat',
      lastMessage: 'À quelle heure demain?',
      time: 'Hier',
      unread: 1,
      online: false,
      verified: true,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <View style={styles.searchContainer}>
          <Search size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une conversation..."
            placeholderTextColor="#666"
          />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {conversations.map((conversation) => (
          <TouchableOpacity key={conversation.id} style={styles.conversationCard}>
            <View style={styles.conversationInfo}>
              <View style={styles.conversationHeader}>
                <View style={styles.nameContainer}>
                  <Text style={styles.conversationName}>{conversation.name}</Text>
                  {conversation.verified && (
                    <Shield size={14} color="#4CAF50" />
                  )}
                  <View
                    style={[
                      styles.onlineStatus,
                      { backgroundColor: conversation.online ? '#4CAF50' : '#E0E0E0' },
                    ]}
                  />
                </View>
                <Text style={styles.conversationTime}>{conversation.time}</Text>
              </View>
              
              <Text style={styles.conversationService}>{conversation.service}</Text>
              
              <View style={styles.messageContainer}>
                <Text
                  style={[
                    styles.lastMessage,
                    conversation.unread > 0 && styles.unreadMessage,
                  ]}
                  numberOfLines={1}
                >
                  {conversation.lastMessage}
                </Text>
                {conversation.unread > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadCount}>{conversation.unread}</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.conversationActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Phone size={18} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Video size={18} color="#666" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.emptyState}>
          <MessageCircle size={60} color="#E0E0E0" />
          <Text style={styles.emptyStateTitle}>Communications sécurisées</Text>
          <Text style={styles.emptyStateText}>
            Tous vos messages sont chiffrés et sécurisés. Communiquez en toute confiance avec vos prestataires.
          </Text>
        </View>
      </ScrollView>
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  conversationName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginRight: 8,
  },
  onlineStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 4,
  },
  conversationTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  conversationService: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FF7A00',
    marginBottom: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  unreadMessage: {
    fontFamily: 'Inter-Medium',
    color: '#333',
  },
  unreadBadge: {
    backgroundColor: '#FF7A00',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  unreadCount: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  conversationActions: {
    flexDirection: 'row',
    marginLeft: 16,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
});