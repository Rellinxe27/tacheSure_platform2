// app/(tabs)/post-task.tsx (Updated for role-based functionality)
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Camera, MapPin, Calendar, DollarSign, Clock, Shield } from 'lucide-react-native';
import { useAuth } from '@/app/contexts/AuthContext';
import { useTasks } from '@/hooks/useTasks';
import RoleBasedAccess from '@/components/RoleBasedAccess';

export default function PostTaskScreen() {
  const { profile, user } = useAuth();
  const { createTask } = useTasks();
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    budget_min: '',
    budget_max: '',
    urgency: 'normal' as 'low' | 'normal' | 'high' | 'emergency',
    photos: [],
  });

  const categories = [
    { id: 'home_services', name: 'Nettoyage', icon: '🧹' },
    { id: 'professional_services', name: 'Réparation', icon: '🔧' },
    { id: 'transport_logistics', name: 'Livraison', icon: '🚚' },
    { id: 'professional_services', name: 'Tutorat', icon: '📚' },
    { id: 'home_services', name: 'Jardinage', icon: '🌱' },
    { id: 'events_hospitality', name: 'Cuisine', icon: '👨‍🍳' },
  ];

  const urgencyLevels = [
    { id: 'low', name: 'Pas urgent', color: '#4CAF50' },
    { id: 'normal', name: 'Normal', color: '#FF9800' },
    { id: 'high', name: 'Urgent', color: '#FF5722' },
  ];

  const handleSubmit = async () => {
    if (!taskData.title || !taskData.description || !taskData.category) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!user) {
      Alert.alert('Erreur', 'Vous devez être connecté pour publier une tâche');
      return;
    }

    const taskPayload = {
      client_id: user.id,
      title: taskData.title,
      description: taskData.description,
      category_id: taskData.category,
      location: { type: 'Point', coordinates: [0, 0] }, // TODO: Get actual location
      address: {
        street: taskData.location,
        city: 'Abidjan',
        country: 'Côte d\'Ivoire'
      },
      budget_min: taskData.budget_min ? parseInt(taskData.budget_min) : null,
      budget_max: taskData.budget_max ? parseInt(taskData.budget_max) : null,
      urgency: taskData.urgency,
      status: 'posted' as const,
      preferred_language: 'Français',
    };

    const { error } = await createTask(taskPayload);

    if (error) {
      Alert.alert('Erreur', error);
    } else {
      Alert.alert(
        'Tâche publiée!',
        'Votre tâche a été publiée avec succès. Vous recevrez des candidatures bientôt.',
        [
          { text: 'OK', onPress: () => {
              setTaskData({
                title: '',
                description: '',
                category: '',
                location: '',
                budget_min: '',
                budget_max: '',
                urgency: 'normal',
                photos: [],
              });
            }}
        ]
      );
    }
  };

  // Show different content based on user role
  if (profile?.role === 'provider') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Mes Services</Text>
          <Text style={styles.subtitle}>Gérez vos services et disponibilités</Text>
        </View>
        {/* TODO: Implement provider services management */}
        <View style={styles.content}>
          <Text>Interface de gestion des services en cours de développement...</Text>
        </View>
      </View>
    );
  }

  return (
    <RoleBasedAccess allowedRoles={['client']} fallback={
      <View style={styles.container}>
        <Text>Accès non autorisé</Text>
      </View>
    }>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Publier une tâche</Text>
          <Text style={styles.subtitle}>Décrivez votre besoin en détail</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Titre de la tâche *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Réparation de plomberie urgente"
              value={taskData.title}
              onChangeText={(text) => setTaskData({...taskData, title: text})}
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description détaillée *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Décrivez votre tâche en détail..."
              value={taskData.description}
              onChangeText={(text) => setTaskData({...taskData, description: text})}
              multiline
              numberOfLines={4}
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Catégorie *</Text>
            <View style={styles.categoriesGrid}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryCard,
                    taskData.category === category.id && styles.selectedCategory,
                  ]}
                  onPress={() => setTaskData({...taskData, category: category.id})}
                >
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <Text
                    style={[
                      styles.categoryText,
                      taskData.category === category.id && styles.selectedCategoryText,
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Localisation</Text>
            <View style={styles.locationContainer}>
              <MapPin size={20} color="#666" />
              <TextInput
                style={styles.locationInput}
                placeholder="Entrez votre adresse"
                value={taskData.location}
                onChangeText={(text) => setTaskData({...taskData, location: text})}
                placeholderTextColor="#666"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Budget approximatif (FCFA)</Text>
            <View style={styles.budgetRow}>
              <View style={styles.budgetContainer}>
                <DollarSign size={20} color="#666" />
                <TextInput
                  style={styles.budgetInput}
                  placeholder="Min"
                  value={taskData.budget_min}
                  onChangeText={(text) => setTaskData({...taskData, budget_min: text})}
                  keyboardType="numeric"
                  placeholderTextColor="#666"
                />
              </View>
              <Text style={styles.budgetSeparator}>à</Text>
              <View style={styles.budgetContainer}>
                <DollarSign size={20} color="#666" />
                <TextInput
                  style={styles.budgetInput}
                  placeholder="Max"
                  value={taskData.budget_max}
                  onChangeText={(text) => setTaskData({...taskData, budget_max: text})}
                  keyboardType="numeric"
                  placeholderTextColor="#666"
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Urgence</Text>
            <View style={styles.urgencyContainer}>
              {urgencyLevels.map((level) => (
                <TouchableOpacity
                  key={level.id}
                  style={[
                    styles.urgencyButton,
                    taskData.urgency === level.id && styles.selectedUrgency,
                    { borderColor: level.color },
                  ]}
                  onPress={() => setTaskData({...taskData, urgency: level.id as any})}
                >
                  <Clock size={16} color={level.color} />
                  <Text
                    style={[
                      styles.urgencyText,
                      { color: level.color },
                      taskData.urgency === level.id && styles.selectedUrgencyText,
                    ]}
                  >
                    {level.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photos (optionnel)</Text>
            <TouchableOpacity style={styles.photoButton}>
              <Camera size={24} color="#666" />
              <Text style={styles.photoButtonText}>Ajouter des photos</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.safetyNote}>
            <Shield size={20} color="#4CAF50" />
            <Text style={styles.safetyText}>
              Vos informations sont sécurisées. Seuls les prestataires vérifiés peuvent voir vos détails.
            </Text>
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Publier la tâche</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </RoleBasedAccess>
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
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '30%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedCategory: {
    borderColor: '#FF7A00',
    backgroundColor: '#FFF3E0',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
    textAlign: 'center',
  },
  selectedCategoryText: {
    color: '#FF7A00',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  locationInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  budgetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flex: 1,
  },
  budgetInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
  budgetSeparator: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginHorizontal: 16,
  },
  urgencyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  urgencyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderWidth: 1,
  },
  selectedUrgency: {
    backgroundColor: '#FFF3E0',
  },
  urgencyText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
  },
  selectedUrgencyText: {
    fontFamily: 'Inter-SemiBold',
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 20,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  photoButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginLeft: 8,
  },
  safetyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  safetyText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#333',
    marginLeft: 8,
    lineHeight: 16,
  },
  submitButton: {
    backgroundColor: '#FF7A00',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 40,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});