import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Camera, MapPin, Calendar, DollarSign, Clock, Shield } from 'lucide-react-native';

export default function PostTaskScreen() {
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    budget: '',
    urgency: 'normal',
    photos: [],
  });

  const categories = [
    { id: 'cleaning', name: 'Nettoyage', icon: '🧹' },
    { id: 'repair', name: 'Réparation', icon: '🔧' },
    { id: 'delivery', name: 'Livraison', icon: '🚚' },
    { id: 'tutoring', name: 'Tutorat', icon: '📚' },
    { id: 'gardening', name: 'Jardinage', icon: '🌱' },
    { id: 'cooking', name: 'Cuisine', icon: '👨‍🍳' },
  ];

  const urgencyLevels = [
    { id: 'low', name: 'Pas urgent', color: '#4CAF50' },
    { id: 'normal', name: 'Normal', color: '#FF9800' },
    { id: 'high', name: 'Urgent', color: '#FF5722' },
  ];

  const handleSubmit = () => {
    if (!taskData.title || !taskData.description || !taskData.category) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    Alert.alert(
      'Tâche publiée!',
      'Votre tâche a été publiée avec succès. Vous recevrez des candidatures bientôt.',
      [
        { text: 'OK', onPress: () => {
          // Reset form
          setTaskData({
            title: '',
            description: '',
            category: '',
            location: '',
            budget: '',
            urgency: 'normal',
            photos: [],
          });
        }}
      ]
    );
  };

  return (
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
          <Text style={styles.sectionTitle}>Budget approximatif</Text>
          <View style={styles.budgetContainer}>
            <DollarSign size={20} color="#666" />
            <TextInput
              style={styles.budgetInput}
              placeholder="Ex: 25,000 FCFA"
              value={taskData.budget}
              onChangeText={(text) => setTaskData({...taskData, budget: text})}
              keyboardType="numeric"
              placeholderTextColor="#666"
            />
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
                onPress={() => setTaskData({...taskData, urgency: level.id})}
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
  budgetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  budgetInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
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