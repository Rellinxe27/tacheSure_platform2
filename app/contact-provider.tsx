// app/contact-provider.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Linking, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, MessageCircle, Phone, Mail, Calendar, Clock, User } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/app/contexts/AuthContext';
import { formatTimeAgo } from '@/utils/formatting';

export default function ContactProviderScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();

  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedContactMethod, setSelectedContactMethod] = useState<'message' | 'phone' | 'email' | null>(null);
  const [urgencyLevel, setUrgencyLevel] = useState<'normal' | 'urgent' | 'emergency'>('normal');

  useEffect(() => {
    if (id) {
      fetchProvider();
    }
  }, [id]);

  const fetchProvider = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          avatar_url,
          phone,
          email,
          trust_score,
          is_verified,
          verification_level,
          languages,
          last_seen_at,
          created_at
        `)
        .eq('id', id)
        .eq('role', 'provider')
        .single();

      if (error) throw error;
      setProvider(data);
    } catch (error) {
      console.error('Error fetching provider:', error);
      Alert.alert('Erreur', 'Impossible de charger les informations du prestataire');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un message');
      return;
    }

    if (!user?.id || !provider?.id) {
      Alert.alert('Erreur', 'Utilisateur ou prestataire non trouvé');
      return;
    }

    try {
      console.log('Sending message...', { userId: user.id, providerId: provider.id });

      // Check if conversation exists
      const { data: existingConversation, error: searchError } = await supabase
        .from('conversations')
        .select('id')
        .filter('participants', 'cs', `{${user.id}}`)
        .filter('participants', 'cs', `{${provider.id}}`)
        .limit(1);

      if (searchError) {
        console.error('Search error:', searchError);
        throw new Error(`Search failed: ${searchError.message}`);
      }

      let conversationId;

      if (existingConversation && existingConversation.length > 0) {
        conversationId = existingConversation[0].id;
        console.log('Using existing conversation:', conversationId);
      } else {
        // Create new conversation
        console.log('Creating new conversation...');
        const { data: newConversation, error: conversationError } = await supabase
          .from('conversations')
          .insert({
            participants: [user.id, provider.id],
            last_message_at: new Date().toISOString(),
            created_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (conversationError) {
          console.error('Conversation creation error:', conversationError);
          throw new Error(`Failed to create conversation: ${conversationError.message}`);
        }

        conversationId = newConversation.id;
        console.log('Created new conversation:', conversationId);
      }

      // Send message
      console.log('Sending message to conversation:', conversationId);
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: message.trim(),
          message_type: 'text',
          is_read: false,
          created_at: new Date().toISOString()
        });

      if (messageError) {
        console.error('Message creation error:', messageError);
        throw new Error(`Failed to send message: ${messageError.message}`);
      }

      // Update conversation timestamp
      const { error: updateError } = await supabase
        .from('conversations')
        .update({
          last_message_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      if (updateError) {
        console.warn('Failed to update conversation timestamp:', updateError);
        // Non-critical error, don't throw
      }

      console.log('Message sent successfully');

      Alert.alert(
        'Message envoyé!',
        'Votre message a été envoyé au prestataire.',
        [
          {
            text: 'OK',
            onPress: () => {
              setMessage(''); // Clear the message
              router.push(`/chat?conversationId=${conversationId}`);
            }
          }
        ]
      );

    } catch (error) {
      console.error('Full error details:', error);

      // More specific error messages
      let errorMessage = 'Impossible d\'envoyer le message';

      if (error.message.includes('RLS')) {
        errorMessage = 'Permissions insuffisantes. Veuillez vous reconnecter.';
      } else if (error.message.includes('network')) {
        errorMessage = 'Problème de connexion. Vérifiez votre internet.';
      } else if (error.message.includes('participants')) {
        errorMessage = 'Erreur de configuration utilisateur.';
      }

      Alert.alert('Erreur', `${errorMessage}\n\nDétails: ${error.message}`);
    }
  };

  const handlePhoneCall = () => {
    if (provider?.phone) {
      Alert.alert(
        'Appeler ce prestataire',
        `Voulez-vous appeler ${provider.full_name} au ${provider.phone}?`,
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Appeler',
            onPress: () => Linking.openURL(`tel:${provider.phone}`)
          }
        ]
      );
    } else {
      Alert.alert('Erreur', 'Numéro de téléphone non disponible');
    }
  };

  const handleEmailContact = () => {
    if (provider?.email) {
      const subject = `Contact depuis TâcheSûre - ${user?.full_name || 'Client'}`;
      const body = message || 'Bonjour, je souhaiterais discuter d\'un projet avec vous.';

      Linking.openURL(`mailto:${provider.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    } else {
      Alert.alert('Erreur', 'Adresse email non disponible');
    }
  };

  const handleBookService = () => {
    router.push(`/book-service?providerId=${provider.id}`);
  };

  const getAvailabilityStatus = () => {
    if (!provider?.last_seen_at) return { status: 'unknown', text: 'Statut inconnu', color: '#666' };

    const lastSeen = new Date(provider.last_seen_at);
    const now = new Date();
    const minutesAgo = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60));

    if (minutesAgo < 5) {
      return { status: 'online', text: 'En ligne', color: '#4CAF50' };
    } else if (minutesAgo < 30) {
      return { status: 'away', text: 'Absent', color: '#FF9800' };
    } else {
      return { status: 'offline', text: `Vu ${formatTimeAgo(provider.last_seen_at)}`, color: '#666' };
    }
  };

  const urgencyOptions = [
    { id: 'normal', name: 'Normal', color: '#4CAF50', description: 'Réponse sous 24h' },
    { id: 'urgent', name: 'Urgent', color: '#FF9800', description: 'Réponse sous 4h' },
    { id: 'emergency', name: 'Urgence', color: '#FF5722', description: 'Réponse immédiate' }
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF7A00" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (!provider) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Prestataire introuvable</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const availability = getAvailabilityStatus();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contacter</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Provider Info */}
        <View style={styles.providerInfo}>
          <View style={styles.providerHeader}>
            <View style={styles.avatarContainer}>
              <User size={40} color="#FFFFFF" />
            </View>
            <View style={styles.providerDetails}>
              <Text style={styles.providerName}>{provider.full_name}</Text>
              <View style={styles.statusContainer}>
                <View style={[styles.statusDot, { backgroundColor: availability.color }]} />
                <Text style={[styles.statusText, { color: availability.color }]}>
                  {availability.text}
                </Text>
              </View>
              <Text style={styles.joinedDate}>
                Membre depuis {formatTimeAgo(provider.created_at)}
              </Text>
            </View>
          </View>
        </View>

        {/* Contact Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choisir un moyen de contact</Text>

          <TouchableOpacity
            style={[
              styles.contactMethod,
              selectedContactMethod === 'message' && styles.selectedContactMethod
            ]}
            onPress={() => setSelectedContactMethod('message')}
          >
            <MessageCircle size={24} color="#FF7A00" />
            <View style={styles.contactMethodInfo}>
              <Text style={styles.contactMethodTitle}>Message sur TâcheSûre</Text>
              <Text style={styles.contactMethodDescription}>
                Communication sécurisée via l'application
              </Text>
            </View>
          </TouchableOpacity>

          {provider.phone && (
            <TouchableOpacity
              style={[
                styles.contactMethod,
                selectedContactMethod === 'phone' && styles.selectedContactMethod
              ]}
              onPress={() => setSelectedContactMethod('phone')}
            >
              <Phone size={24} color="#4CAF50" />
              <View style={styles.contactMethodInfo}>
                <Text style={styles.contactMethodTitle}>Appel téléphonique</Text>
                <Text style={styles.contactMethodDescription}>
                  {provider.phone}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {provider.email && (
            <TouchableOpacity
              style={[
                styles.contactMethod,
                selectedContactMethod === 'email' && styles.selectedContactMethod
              ]}
              onPress={() => setSelectedContactMethod('email')}
            >
              <Mail size={24} color="#2196F3" />
              <View style={styles.contactMethodInfo}>
                <Text style={styles.contactMethodTitle}>Email</Text>
                <Text style={styles.contactMethodDescription}>
                  {provider.email}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Urgency Level */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Niveau d'urgence</Text>
          {urgencyOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.urgencyOption,
                urgencyLevel === option.id && styles.selectedUrgencyOption,
                { borderColor: option.color }
              ]}
              onPress={() => setUrgencyLevel(option.id as any)}
            >
              <View style={styles.urgencyHeader}>
                <Text style={[styles.urgencyName, { color: option.color }]}>
                  {option.name}
                </Text>
                <Text style={styles.urgencyDescription}>
                  {option.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Message */}
        {selectedContactMethod === 'message' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Votre message</Text>
            <TextInput
              style={styles.messageInput}
              placeholder="Tapez votre message ici..."
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={4}
              placeholderTextColor="#666"
            />
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>

          <TouchableOpacity style={styles.quickAction} onPress={handleBookService}>
            <Calendar size={20} color="#FF7A00" />
            <Text style={styles.quickActionText}>Réserver un service</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push(`/provider-profile?id=${provider.id}`)}
          >
            <User size={20} color="#FF7A00" />
            <Text style={styles.quickActionText}>Voir le profil complet</Text>
          </TouchableOpacity>
        </View>

        {/* Contact Button */}
        <View style={styles.actions}>
          {selectedContactMethod === 'message' && (
            <TouchableOpacity
              style={styles.contactButton}
              onPress={handleSendMessage}
            >
              <MessageCircle size={20} color="#FFFFFF" />
              <Text style={styles.contactButtonText}>Envoyer le message</Text>
            </TouchableOpacity>
          )}

          {selectedContactMethod === 'phone' && (
            <TouchableOpacity
              style={styles.contactButton}
              onPress={handlePhoneCall}
            >
              <Phone size={20} color="#FFFFFF" />
              <Text style={styles.contactButtonText}>Appeler maintenant</Text>
            </TouchableOpacity>
          )}

          {selectedContactMethod === 'email' && (
            <TouchableOpacity
              style={styles.contactButton}
              onPress={handleEmailContact}
            >
              <Mail size={20} color="#FFFFFF" />
              <Text style={styles.contactButtonText}>Ouvrir l'application email</Text>
            </TouchableOpacity>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FF5722',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#FF7A00',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  providerInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF7A00',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  providerDetails: {
    flex: 1,
  },
  providerName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  joinedDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  contactMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedContactMethod: {
    borderColor: '#FF7A00',
    backgroundColor: '#FFF3E0',
  },
  contactMethodInfo: {
    marginLeft: 12,
    flex: 1,
  },
  contactMethodTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 2,
  },
  contactMethodDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  urgencyOption: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 2,
  },
  selectedUrgencyOption: {
    backgroundColor: '#FFF3E0',
  },
  urgencyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  urgencyName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  urgencyDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  messageInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333',
    textAlignVertical: 'top',
    height: 100,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333',
    marginLeft: 12,
  },
  actions: {
    marginBottom: 40,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF7A00',
    borderRadius: 12,
    paddingVertical: 16,
  },
  contactButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});