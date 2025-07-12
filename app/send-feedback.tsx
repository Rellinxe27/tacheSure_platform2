// app/send-feedback.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Send, Star, Lightbulb, Bug, Heart, Zap, Camera } from 'lucide-react-native';

export default function SendFeedbackScreen() {
  const router = useRouter();

  const [feedbackType, setFeedbackType] = useState('');
  const [rating, setRating] = useState(0);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);

  const feedbackTypes = [
    { id: 'suggestion', label: 'Suggestion', icon: Lightbulb, color: '#FF9800', description: 'Idée d\'amélioration' },
    { id: 'bug', label: 'Bug/Problème', icon: Bug, color: '#FF5722', description: 'Signaler un dysfonctionnement' },
    { id: 'compliment', label: 'Compliment', icon: Heart, color: '#E91E63', description: 'Félicitation ou remerciement' },
    { id: 'feature', label: 'Nouvelle fonctionnalité', icon: Zap, color: '#9C27B0', description: 'Demande de nouvelles options' },
    { id: 'general', label: 'Général', icon: Camera, color: '#2196F3', description: 'Commentaire général' }
  ];

  const handleSubmit = async () => {
    if (!feedbackType || !subject.trim() || !message.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (feedbackType === 'compliment' && rating === 0) {
      Alert.alert('Erreur', 'Veuillez donner une note pour vos compliments');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      Alert.alert(
        'Merci pour votre retour!',
        'Votre feedback a été envoyé avec succès. Il nous aidera à améliorer TâcheSûre.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'envoyer votre feedback. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map(star => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            style={styles.starButton}
          >
            <Star
              size={32}
              color={star <= rating ? '#FFD700' : '#E0E0E0'}
              fill={star <= rating ? '#FFD700' : 'transparent'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Envoyer des commentaires</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Message */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Votre avis compte!</Text>
          <Text style={styles.welcomeText}>
            Aidez-nous à améliorer TâcheSûre en partageant vos idées, suggestions et commentaires.
          </Text>
        </View>

        {/* Feedback Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Type de commentaire *</Text>
          <View style={styles.typesContainer}>
            {feedbackTypes.map(type => {
              const IconComponent = type.icon;
              return (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeCard,
                    feedbackType === type.id && styles.selectedTypeCard
                  ]}
                  onPress={() => setFeedbackType(type.id)}
                >
                  <IconComponent
                    size={24}
                    color={feedbackType === type.id ? '#FFFFFF' : type.color}
                  />
                  <Text style={[
                    styles.typeLabel,
                    feedbackType === type.id && styles.selectedTypeLabel
                  ]}>
                    {type.label}
                  </Text>
                  <Text style={[
                    styles.typeDescription,
                    feedbackType === type.id && styles.selectedTypeDescription
                  ]}>
                    {type.description}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Rating Section - Only for compliments */}
        {feedbackType === 'compliment' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Votre note *</Text>
            <Text style={styles.ratingSubtext}>
              Donnez une note globale à votre expérience TâcheSûre
            </Text>
            {renderStars()}
            {rating > 0 && (
              <Text style={styles.ratingText}>
                {rating === 1 && 'Décevant'}
                {rating === 2 && 'Moyen'}
                {rating === 3 && 'Bien'}
                {rating === 4 && 'Très bien'}
                {rating === 5 && 'Excellent'}
              </Text>
            )}
          </View>
        )}

        {/* Subject */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sujet *</Text>
          <TextInput
            style={styles.input}
            value={subject}
            onChangeText={setSubject}
            placeholder={
              feedbackType === 'suggestion' ? 'Votre suggestion en quelques mots' :
                feedbackType === 'bug' ? 'Quel problème avez-vous rencontré?' :
                  feedbackType === 'compliment' ? 'Ce qui vous a plu' :
                    feedbackType === 'feature' ? 'Quelle fonctionnalité souhaitez-vous?' :
                      'Résumé de votre commentaire'
            }
            maxLength={100}
          />
          <Text style={styles.charCount}>{subject.length}/100</Text>
        </View>

        {/* Detailed Message */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Message détaillé *</Text>
          <TextInput
            style={styles.textArea}
            value={message}
            onChangeText={setMessage}
            placeholder={
              feedbackType === 'suggestion' ? 'Décrivez votre suggestion en détail. Comment cela améliorerait-il votre expérience?' :
                feedbackType === 'bug' ? 'Décrivez le problème rencontré, les étapes pour le reproduire, et l\'impact sur votre utilisation.' :
                  feedbackType === 'compliment' ? 'Partagez ce qui vous a particulièrement plu dans votre expérience.' :
                    feedbackType === 'feature' ? 'Décrivez la fonctionnalité souhaitée et comment elle vous aiderait.' :
                      'Partagez vos commentaires en détail...'
            }
            multiline
            numberOfLines={8}
            textAlignVertical="top"
            maxLength={1500}
          />
          <Text style={styles.charCount}>{message.length}/1500</Text>
        </View>

        {/* Anonymous Option */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.anonymousOption}
            onPress={() => setIsAnonymous(!isAnonymous)}
          >
            <View style={[styles.checkbox, isAnonymous && styles.checkedBox]}>
              {isAnonymous && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={styles.anonymousText}>
              <Text style={styles.anonymousLabel}>Envoyer anonymement</Text>
              <Text style={styles.anonymousDescription}>
                Votre nom ne sera pas associé à ce commentaire
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Feedback Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Évaluation rapide</Text>
          <Text style={styles.quickFeedbackSubtext}>
            Évaluez ces aspects de l'application (optionnel)
          </Text>

          <View style={styles.quickFeedbackContainer}>
            {[
              { label: 'Facilité d\'utilisation', key: 'usability' },
              { label: 'Design', key: 'design' },
              { label: 'Performance', key: 'performance' },
              { label: 'Fonctionnalités', key: 'features' }
            ].map(aspect => (
              <View key={aspect.key} style={styles.quickFeedbackItem}>
                <Text style={styles.aspectLabel}>{aspect.label}</Text>
                <View style={styles.quickStars}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <TouchableOpacity key={star} style={styles.quickStar}>
                      <Star size={16} color="#E0E0E0" />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Send size={20} color="#FFFFFF" />
          <Text style={styles.submitButtonText}>
            {loading ? 'Envoi en cours...' : 'Envoyer le feedback'}
          </Text>
        </TouchableOpacity>

        {/* Thank You Note */}
        <View style={styles.thankYouCard}>
          <Heart size={20} color="#E91E63" />
          <Text style={styles.thankYouText}>
            Merci de prendre le temps de nous aider à améliorer TâcheSûre.
            Chaque commentaire compte pour offrir la meilleure expérience possible.
          </Text>
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
  welcomeCard: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 20,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeCard: {
    width: '48%',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedTypeCard: {
    backgroundColor: '#FF7A00',
    borderColor: '#FF7A00',
  },
  typeLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  selectedTypeLabel: {
    color: '#FFFFFF',
  },
  typeDescription: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  selectedTypeDescription: {
    color: '#FFFFFF',
    opacity: 0.9,
  },
  ratingSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FF7A00',
    textAlign: 'center',
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
  anonymousOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkedBox: {
    backgroundColor: '#FF7A00',
    borderColor: '#FF7A00',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  anonymousText: {
    flex: 1,
  },
  anonymousLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333',
  },
  anonymousDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 2,
  },
  quickFeedbackSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 16,
  },
  quickFeedbackContainer: {
    gap: 12,
  },
  quickFeedbackItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aspectLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
  quickStars: {
    flexDirection: 'row',
    gap: 4,
  },
  quickStar: {
    padding: 2,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF7A00',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
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
  thankYouCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF0F5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'flex-start',
  },
  thankYouText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 18,
    marginLeft: 12,
    flex: 1,
  },
});