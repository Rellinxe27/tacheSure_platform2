// app/contact-support.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Phone, Mail, MessageCircle, Clock, Send, User, AlertCircle } from 'lucide-react-native';

export default function ContactSupportScreen() {
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [urgency, setUrgency] = useState('normal');
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: 'technical', label: 'Problème technique', icon: '🔧' },
    { id: 'payment', label: 'Problème de paiement', icon: '💳' },
    { id: 'account', label: 'Compte utilisateur', icon: '👤' },
    { id: 'safety', label: 'Sécurité', icon: '🛡️' },
    { id: 'service', label: 'Service client', icon: '🤝' },
    { id: 'other', label: 'Autre', icon: '📝' }
  ];

  const urgencyLevels = [
    { id: 'low', label: 'Faible', color: '#4CAF50', time: '2-3 jours' },
    { id: 'normal', label: 'Normal', color: '#FF9800', time: '24-48h' },
    { id: 'high', label: 'Urgent', color: '#FF5722', time: '2-6h' },
    { id: 'emergency', label: 'Urgence', color: '#F44336', time: 'Immédiat' }
  ];

  const handleSubmit = async () => {
    if (!selectedCategory || !subject.trim() || !message.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      Alert.alert(
        'Demande envoyée',
        'Votre demande a été envoyée avec succès. Notre équipe vous répondra dans les plus brefs délais.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'envoyer votre demande. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneCall = () => {
    Alert.alert(
      'Appeler le support',
      'Voulez-vous appeler notre ligne d\'assistance?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Appeler',
          onPress: () => {
            Linking.openURL('tel:+2250505050505');
          }
        }
      ]
    );
  };

  const handleWhatsApp = () => {
    const whatsappUrl = 'whatsapp://send?phone=+2250505050505&text=Bonjour, j\'ai besoin d\'aide avec TâcheSûre';
    Linking.openURL(whatsappUrl).catch(() => {
      Alert.alert('Erreur', 'WhatsApp n\'est pas installé sur votre appareil');
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contacter le support</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Contact Options */}
        <View style={styles.quickContactSection}>
          <Text style={styles.sectionTitle}>Contact rapide</Text>

          <View style={styles.quickContactGrid}>
            <TouchableOpacity style={styles.contactCard} onPress={handlePhoneCall}>
              <Phone size={24} color="#FF7A00" />
              <Text style={styles.contactLabel}>Appeler</Text>
              <Text style={styles.contactSubtext}>+225 05 05 05 05 05</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactCard} onPress={handleWhatsApp}>
              <MessageCircle size={24} color="#25D366" />
              <Text style={styles.contactLabel}>WhatsApp</Text>
              <Text style={styles.contactSubtext}>Chat direct</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactCard}>
              <Mail size={24} color="#2196F3" />
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactSubtext}>support@tachesure.ci</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Support Hours */}
        <View style={styles.hoursCard}>
          <Clock size={20} color="#666" />
          <View style={styles.hoursInfo}>
            <Text style={styles.hoursTitle}>Heures d'ouverture</Text>
            <Text style={styles.hoursText}>Lun - Ven: 8h00 - 18h00</Text>
            <Text style={styles.hoursText}>Sam: 9h00 - 15h00</Text>
            <Text style={styles.hoursText}>Dim: Urgences uniquement</Text>
          </View>
        </View>

        {/* Support Form */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Envoyer une demande</Text>

          {/* Category Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Catégorie *</Text>
            <View style={styles.categoriesGrid}>
              {categories.map(category => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category.id && styles.selectedCategory
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <Text style={[
                    styles.categoryText,
                    selectedCategory === category.id && styles.selectedCategoryText
                  ]}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Urgency Level */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Niveau d'urgence</Text>
            <View style={styles.urgencyContainer}>
              {urgencyLevels.map(level => (
                <TouchableOpacity
                  key={level.id}
                  style={[
                    styles.urgencyChip,
                    urgency === level.id && styles.selectedUrgency,
                    { borderColor: level.color }
                  ]}
                  onPress={() => setUrgency(level.id)}
                >
                  <Text style={[
                    styles.urgencyLabel,
                    urgency === level.id && { color: level.color }
                  ]}>
                    {level.label}
                  </Text>
                  <Text style={styles.urgencyTime}>{level.time}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Subject */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sujet *</Text>
            <TextInput
              style={styles.input}
              value={subject}
              onChangeText={setSubject}
              placeholder="Décrivez brièvement votre problème"
              maxLength={100}
            />
            <Text style={styles.charCount}>{subject.length}/100</Text>
          </View>

          {/* Message */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description détaillée *</Text>
            <TextInput
              style={styles.textArea}
              value={message}
              onChangeText={setMessage}
              placeholder="Décrivez votre problème en détail. Plus vous fournirez d'informations, plus nous pourrons vous aider efficacement."
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={1000}
            />
            <Text style={styles.charCount}>{message.length}/1000</Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Send size={20} color="#FFFFFF" />
            <Text style={styles.submitButtonText}>
              {loading ? 'Envoi en cours...' : 'Envoyer la demande'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* FAQ Quick Links */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Questions fréquentes</Text>

          <TouchableOpacity style={styles.faqItem} onPress={() => router.push('/help-support')}>
            <Text style={styles.faqQuestion}>Comment puis-je modifier mon profil?</Text>
            <Text style={styles.faqArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.faqItem} onPress={() => router.push('/help-support')}>
            <Text style={styles.faqQuestion}>Problème de paiement?</Text>
            <Text style={styles.faqArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.faqItem} onPress={() => router.push('/help-support')}>
            <Text style={styles.faqQuestion}>Comment signaler un utilisateur?</Text>
            <Text style={styles.faqArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Emergency Contact */}
        <View style={styles.emergencyCard}>
          <AlertCircle size={20} color="#FF5722" />
          <View style={styles.emergencyContent}>
            <Text style={styles.emergencyTitle}>Urgence sécurité?</Text>
            <Text style={styles.emergencyText}>
              En cas d'urgence immédiate concernant votre sécurité, contactez directement:
            </Text>
            <TouchableOpacity
              style={styles.emergencyButton}
              onPress={() => Linking.openURL('tel:119')}
            >
              <Text style={styles.emergencyButtonText}>Appeler 119</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
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
  quickContactSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  quickContactGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  contactCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginTop: 8,
  },
  contactSubtext: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  hoursCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hoursInfo: {
    marginLeft: 12,
  },
  hoursTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  hoursText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 16,
  },
  formSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333',
    marginBottom: 8,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 8,
  },
  selectedCategory: {
    backgroundColor: '#FF7A00',
    borderColor: '#FF7A00',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  urgencyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  urgencyChip: {
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 80,
  },
  selectedUrgency: {
    backgroundColor: '#FFF8F0',
  },
  urgencyLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#666',
  },
  urgencyTime: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#999',
    marginTop: 2,
  },
  input: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
  textArea: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
    minHeight: 120,
  },
  charCount: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF7A00',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  faqSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  faqItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  faqQuestion: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333',
    flex: 1,
  },
  faqArrow: {
    fontSize: 16,
    color: '#FF7A00',
    fontFamily: 'Inter-Bold',
  },
  emergencyCard: {
    flexDirection: 'row',
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#FF5722',
  },
  emergencyContent: {
    marginLeft: 12,
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FF5722',
    marginBottom: 4,
  },
  emergencyText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 16,
    marginBottom: 12,
  },
  emergencyButton: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  emergencyButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});