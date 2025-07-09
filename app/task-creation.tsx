// app/task-creation.tsx - Connected to database
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/app/contexts/AuthContext';
import { useTasks } from '@/hooks/useTasks';
import { useCategories } from '@/hooks/useCategories';
import { MapPin, DollarSign, Clock, Camera } from 'lucide-react-native';
import { validateTaskData } from '@/utils/validation';
import { useWhatsAppBottomNotification } from '@/components/SnackBar';

export default function TaskCreationScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { createTask } = useTasks();
  const { categories } = useCategories();
  const { showNotification, NotificationComponent } = useWhatsAppBottomNotification();

  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    category_id: '',
    budget_min: '',
    budget_max: '',
    urgency: 'normal' as const,
    location: { lat: 5.3600, lng: -4.0083 }, // Default to Abidjan
    address: {
      street: '',
      city: 'Abidjan',
      district: '',
      country: 'Côte d\'Ivoire'
    },
    skills_needed: [] as string[],
    requirements: [] as string[],
    images: [] as string[]
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const validation = validateTaskData(taskData);
    if (!validation.isValid) {
      Alert.alert('Erreur', validation.errors.join('\n'));
      return;
    }

    if (!user) {
      Alert.alert('Erreur', 'Vous devez être connecté pour créer une tâche');
      return;
    }

    setLoading(true);
    try {
      const result = await createTask({
        client_id: user.id,
        title: taskData.title,
        description: taskData.description,
        category_id: taskData.category_id || null,
        location: taskData.location,
        address: taskData.address,
        budget_min: taskData.budget_min ? parseInt(taskData.budget_min) : null,
        budget_max: taskData.budget_max ? parseInt(taskData.budget_max) : null,
        urgency: taskData.urgency,
        skills_needed: taskData.skills_needed,
        requirements: taskData.requirements,
        images: taskData.images,
        status: 'posted'
      });

      if (result.error) {
        Alert.alert('Erreur', result.error);
      } else {
        showNotification('Tâche créée avec succès!', 'success');
        router.push(`/task-status?taskId=${result.data.id}`);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Créer une nouvelle tâche</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Titre de la tâche *</Text>
          <TextInput
            style={styles.input}
            value={taskData.title}
            onChangeText={(text) => setTaskData(prev => ({ ...prev, title: text }))}
            placeholder="Ex: Réparation de plomberie"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={taskData.description}
            onChangeText={(text) => setTaskData(prev => ({ ...prev, description: text }))}
            placeholder="Décrivez votre tâche en détail..."
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Catégorie</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  taskData.category_id === category.id && styles.categoryButtonActive
                ]}
                onPress={() => setTaskData(prev => ({ ...prev, category_id: category.id }))}
              >
                <Text style={[
                  styles.categoryButtonText,
                  taskData.category_id === category.id && styles.categoryButtonTextActive
                ]}>
                  {category.name_fr}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.budgetRow}>
          <View style={styles.budgetInput}>
            <Text style={styles.label}>Budget min (FCFA)</Text>
            <TextInput
              style={styles.input}
              value={taskData.budget_min}
              onChangeText={(text) => setTaskData(prev => ({ ...prev, budget_min: text }))}
              placeholder="10000"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.budgetInput}>
            <Text style={styles.label}>Budget max (FCFA)</Text>
            <TextInput
              style={styles.input}
              value={taskData.budget_max}
              onChangeText={(text) => setTaskData(prev => ({ ...prev, budget_max: text }))}
              placeholder="25000"
              keyboardType="numeric"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Création...' : 'Publier la tâche'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <NotificationComponent />
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
    padding: 20,
    paddingTop: 60,
  },
  greeting: {
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchPlaceholder: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginLeft: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FF7A00',
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#333',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
  },
  taskCard: {
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
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    flex: 1,
  },
  taskBudget: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#FF7A00',
  },
  taskDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 12,
    lineHeight: 18,
  },
  taskMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taskMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskMetaText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginLeft: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF7A00',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryButton: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#FF7A00',
  },
  categoryButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  budgetInput: {
    flex: 1,
    marginRight: 8,
  },
  submitButton: {
    backgroundColor: '#FF7A00',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});