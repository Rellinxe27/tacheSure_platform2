// app/report-user.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Shield, AlertTriangle, Camera, FileText } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/app/contexts/AuthContext';

export default function ReportUserScreen() {
  const router = useRouter();
  const { userId, taskId } = useLocalSearchParams();
  const { user } = useAuth();

  const [reportedUser, setReportedUser] = useState<any>(null);
  const [selectedIncidentType, setSelectedIncidentType] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUserInfo();
    }
  }, [userId]);

  const incidentTypes = [
    { id: 'safety', name: 'Problème de sécurité', description: 'Comportement dangereux ou menaçant' },
    { id: 'payment', name: 'Problème de paiement', description: 'Fraude ou problème de transaction' },
    { id: 'behavior', name: 'Comportement inapproprié', description: 'Harcèlement, langage inapproprié' },
    { id: 'fraud', name: 'Fraude', description: 'Fausse identité ou escroquerie' },
    { id: 'technical', name: 'Problème technique', description: 'Bug ou dysfonctionnement' },
    { id: 'other', name: 'Autre', description: 'Autre type de problème' }
  ];

  const priorityLevels = [
    { id: 'low', name: 'Faible', color: '#4CAF50', description: 'Problème mineur' },
    { id: 'medium', name: 'Moyen', color: '#FF9800', description: 'Problème notable' },
    { id: 'high', name: 'Élevé', color: '#FF5722', description: 'Problème sérieux' },
    { id: 'critical', name: 'Critique', color: '#D32F2F', description: 'Danger immédiat' }
  ];

  const fetchUserInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setReportedUser(data);
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const handleSubmitReport = async () => {
    if (!selectedIncidentType || !title.trim() || !description.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setIsSubmitting(true);

      const reportData = {
        reporter_id: user?.id,
        reported_user_id: userId,
        task_id: typeof taskId === 'string' ? taskId : null,
        incident_type: selectedIncidentType,
        priority: selectedPriority,
        title: title.trim(),
        description: description.trim(),
        evidence_urls: evidenceUrls,
        status: 'open',
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('safety_incidents')
        .insert(reportData);

      if (error) throw error;

      // Create notification for admins
      const { data: admins } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin');

      if (admins) {
        const notifications = admins.map(admin => ({
          user_id: admin.id,
          title: 'Nouveau signalement',
          message: `Incident ${selectedIncidentType} signalé par ${user?.email}`,
          type: 'safety_incident',
          data: { incident_id: reportData.reporter_id, priority: selectedPriority },
          created_at: new Date().toISOString()
        }));

        await supabase
          .from('notifications')
          .insert(notifications);
      }

      Alert.alert(
        'Signalement envoyé',
        'Votre signalement a été envoyé à notre équipe de modération. Nous examinerons votre rapport dans les plus brefs délais.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );

    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer le signalement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddEvidence = () => {
    Alert.alert(
      'Ajouter une preuve',
      'Fonctionnalité d\'ajout de preuves en cours de développement',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Signaler un utilisateur</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info */}
        {reportedUser && (
          <View style={styles.userInfo}>
            <Shield size={24} color="#FF5722" />
            <View style={styles.userDetails}>
              <Text style={styles.userName}>
                Signalement concernant: {reportedUser.full_name}
              </Text>
              <Text style={styles.userRole}>
                {reportedUser.role === 'provider' ? 'Prestataire' : 'Client'}
              </Text>
            </View>
          </View>
        )}

        {/* Incident Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Type d'incident *</Text>
          {incidentTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.optionCard,
                selectedIncidentType === type.id && styles.selectedOptionCard
              ]}
              onPress={() => setSelectedIncidentType(type.id)}
            >
              <View style={styles.optionHeader}>
                <Text style={[
                  styles.optionName,
                  selectedIncidentType === type.id && styles.selectedOptionText
                ]}>
                  {type.name}
                </Text>
              </View>
              <Text style={styles.optionDescription}>{type.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Priority Level */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Niveau de priorité *</Text>
          <View style={styles.priorityContainer}>
            {priorityLevels.map((priority) => (
              <TouchableOpacity
                key={priority.id}
                style={[
                  styles.priorityButton,
                  selectedPriority === priority.id && styles.selectedPriorityButton,
                  { borderColor: priority.color }
                ]}
                onPress={() => setSelectedPriority(priority.id as any)}
              >
                <Text style={[
                  styles.priorityText,
                  { color: priority.color },
                  selectedPriority === priority.id && styles.selectedPriorityText
                ]}>
                  {priority.name}
                </Text>
                <Text style={styles.priorityDescription}>
                  {priority.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Titre du signalement *</Text>
          <TextInput
            style={styles.input}
            placeholder="Résumé court du problème"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
            placeholderTextColor="#666"
          />
          <Text style={styles.characterCount}>{title.length}/100</Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description détaillée *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Décrivez en détail ce qui s'est passé, quand et dans quel contexte..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={6}
            maxLength={1000}
            placeholderTextColor="#666"
          />
          <Text style={styles.characterCount}>{description.length}/1000</Text>
        </View>

        {/* Evidence */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preuves (optionnel)</Text>
          <Text style={styles.sectionDescription}>
            Ajoutez des captures d'écran ou documents pour appuyer votre signalement
          </Text>

          <View style={styles.evidenceContainer}>
            <TouchableOpacity style={styles.addEvidenceButton} onPress={handleAddEvidence}>
              <Camera size={24} color="#666" />
              <Text style={styles.addEvidenceText}>Ajouter une photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.addEvidenceButton} onPress={handleAddEvidence}>
              <FileText size={24} color="#666" />
              <Text style={styles.addEvidenceText}>Ajouter un document</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Warning */}
        <View style={styles.warningContainer}>
          <AlertTriangle size={20} color="#FF9800" />
          <Text style={styles.warningText}>
            Les signalements abusifs ou non fondés peuvent entraîner des sanctions sur votre compte.
            Assurez-vous que votre signalement est justifié et véridique.
          </Text>
        </View>

        {/* Safety Info */}
        <View style={styles.safetyInfo}>
          <Shield size={20} color="#4CAF50" />
          <Text style={styles.safetyText}>
            Votre signalement sera traité de manière confidentielle par notre équipe de modération.
            En cas d'urgence immédiate, contactez les autorités locales.
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!selectedIncidentType || !title.trim() || !description.trim() || isSubmitting) &&
            styles.submitButtonDisabled
          ]}
          onPress={handleSubmitReport}
          disabled={!selectedIncidentType || !title.trim() || !description.trim() || isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Envoi en cours...' : 'Envoyer le signalement'}
          </Text>
        </TouchableOpacity>
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
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
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
  userDetails: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  userRole: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 2,
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
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 16,
  },
  optionCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOptionCard: {
    borderColor: '#FF7A00',
    backgroundColor: '#FFF3E0',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  optionName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  selectedOptionText: {
    color: '#FF7A00',
  },
  optionDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  priorityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  priorityButton: {
    width: '48%',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  selectedPriorityButton: {
    backgroundColor: '#FFF3E0',
  },
  priorityText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  selectedPriorityText: {
    color: '#FF7A00',
  },
  priorityDescription: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  evidenceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addEvidenceButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  addEvidenceText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  warningContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#F57C00',
    marginLeft: 8,
    lineHeight: 16,
  },
  safetyInfo: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  safetyText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#2E7D32',
    marginLeft: 8,
    lineHeight: 16,
  },
  submitButton: {
    backgroundColor: '#FF5722',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 40,
  },
  submitButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});