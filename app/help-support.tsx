// app/help-support.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Search,
  MessageCircle,
  Phone,
  Mail,
  Book,
  HelpCircle,
  FileText,
  Send,
  Shield
} from 'lucide-react-native';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export default function HelpSupportScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const faqData: FAQItem[] = [
    {
      id: '1',
      question: 'Comment créer une tâche?',
      answer: 'Pour créer une tâche, appuyez sur le bouton "+" dans l\'onglet principal, remplissez les détails de votre tâche, définissez votre budget et publiez.',
      category: 'Utilisation'
    },
    {
      id: '2',
      question: 'Comment devenir prestataire?',
      answer: 'Allez dans les paramètres, sélectionnez "Devenir prestataire", complétez votre profil professionnel et passez la vérification d\'identité.',
      category: 'Compte'
    },
    {
      id: '3',
      question: 'Quels sont les moyens de paiement acceptés?',
      answer: 'Nous acceptons MTN Money, Orange Money, Moov Money, Wave, virements bancaires et paiements en espèces.',
      category: 'Paiement'
    },
    {
      id: '4',
      question: 'Comment signaler un problème?',
      answer: 'Utilisez le bouton "Signaler" dans le chat ou contactez notre support via l\'onglet "Contacter le support".',
      category: 'Sécurité'
    },
    {
      id: '5',
      question: 'Que faire en cas d\'urgence?',
      answer: 'Utilisez le bouton d\'urgence rouge dans l\'application ou appelez directement les services d\'urgence.',
      category: 'Sécurité'
    }
  ];

  const categories = ['Tout', 'Utilisation', 'Compte', 'Paiement', 'Sécurité'];
  const [selectedCategory, setSelectedCategory] = useState('Tout');

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Tout' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleContactSupport = () => {
    router.push('/contact-support');
  };

  const handleSendFeedback = () => {
    router.push('/send-feedback');
  };

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Aide et Support</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher dans l'aide..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionCard} onPress={handleContactSupport}>
            <Phone size={24} color="#FF7A00" />
            <Text style={styles.actionTitle}>Contacter le support</Text>
            <Text style={styles.actionDescription}>Parlez à notre équipe</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={handleSendFeedback}>
            <Send size={24} color="#4CAF50" />
            <Text style={styles.actionTitle}>Envoyer feedback</Text>
            <Text style={styles.actionDescription}>Partagez vos suggestions</Text>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Catégories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {categories.map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.categoryChipActive
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* FAQ Section */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Questions fréquentes</Text>
          {filteredFAQs.map(faq => (
            <TouchableOpacity
              key={faq.id}
              style={styles.faqItem}
              onPress={() => toggleFAQ(faq.id)}
            >
              <View style={styles.faqHeader}>
                <HelpCircle size={18} color="#666" />
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Text style={styles.faqToggle}>
                  {expandedFAQ === faq.id ? '−' : '+'}
                </Text>
              </View>
              {expandedFAQ === faq.id && (
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Help Resources */}
        <View style={styles.resourcesSection}>
          <Text style={styles.sectionTitle}>Ressources utiles</Text>

          <TouchableOpacity style={styles.resourceItem}>
            <Book size={20} color="#2196F3" />
            <View style={styles.resourceInfo}>
              <Text style={styles.resourceTitle}>Guide d'utilisation</Text>
              <Text style={styles.resourceDescription}>Apprenez à utiliser l'application</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resourceItem}>
            <Shield size={20} color="#4CAF50" />
            <View style={styles.resourceInfo}>
              <Text style={styles.resourceTitle}>Conseils de sécurité</Text>
              <Text style={styles.resourceDescription}>Restez en sécurité sur la plateforme</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resourceItem}>
            <FileText size={20} color="#FF9800" />
            <View style={styles.resourceInfo}>
              <Text style={styles.resourceTitle}>Conditions d'utilisation</Text>
              <Text style={styles.resourceDescription}>Nos termes et conditions</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Emergency Info */}
        <View style={styles.emergencyCard}>
          <View style={styles.emergencyHeader}>
            <Text style={styles.emergencyTitle}>Urgence?</Text>
            <Text style={styles.emergencyNumber}>Emergency: 119</Text>
          </View>
          <Text style={styles.emergencyText}>
            En cas d'urgence réelle, contactez directement les services d'urgence.
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
  quickActions: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginTop: 8,
  },
  actionDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  categoriesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 12,
  },
  categoriesScroll: {
    flexDirection: 'row',
  },
  categoryChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryChipActive: {
    backgroundColor: '#FF7A00',
    borderColor: '#FF7A00',
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  faqSection: {
    marginBottom: 24,
  },
  faqItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333',
    marginLeft: 12,
  },
  faqToggle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FF7A00',
  },
  faqAnswer: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 20,
    marginTop: 12,
    marginLeft: 30,
  },
  resourcesSection: {
    marginBottom: 24,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resourceInfo: {
    marginLeft: 16,
    flex: 1,
  },
  resourceTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333',
  },
  resourceDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 2,
  },
  emergencyCard: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 40,
    borderLeftWidth: 4,
    borderLeftColor: '#FF5722',
  },
  emergencyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  emergencyTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FF5722',
  },
  emergencyNumber: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#FF5722',
  },
  emergencyText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 16,
  },
});