import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Camera, Upload, Trash2 } from 'lucide-react-native';

export default function EditServiceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const serviceId = params.serviceId as string;

  // Mock service data - would fetch from API in real app
  const [serviceData, setServiceData] = useState({
    name: 'Réparation de fuite',
    description: 'Réparation rapide de fuites d\'eau, robinets et tuyauterie',
    priceMin: '15000',
    priceMax: '25000',
    duration: '1-2 heures',
    category: 'Plomberie',
    images: []
  });

  const categories = [
    'Plomberie', 'Électricité', 'Menuiserie', 'Peinture', 'Nettoyage',
    'Jardinage', 'Livraison', 'Cuisine', 'Tutorat', 'Réparation'
  ];

  const handleSave = () => {
    if (!serviceData.name || !serviceData.description || !serviceData.priceMin || !serviceData.priceMax) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    Alert.alert(
      'Service modifié',
      'Les modifications ont été enregistrées avec succès',
      [
        { text: 'OK', onPress: () => router.back() }
      ]
    );
  };

  const handleAddPhotos = () => {
    Alert.alert('Ajouter des photos', 'Fonctionnalité de photos bientôt disponible');
  };

  const handleDeleteService = () => {
    Alert.alert(
      'Supprimer le service',
      'Êtes-vous sûr de vouloir supprimer définitivement ce service?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Service supprimé', 'Le service a été supprimé avec succès');
            router.back();
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Modifier le service</Text>
        <TouchableOpacity onPress={handleDeleteService}>
          <Trash2 size={24} color="#FF5722" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nom du service *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Réparation de plomberie"
              value={serviceData.name}
              onChangeText={(text) => setServiceData(prev => ({ ...prev, name: text }))}
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Décrivez votre service en détail..."
              value={serviceData.description}
              onChangeText={(text) => setServiceData(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={4}
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Catégorie</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categorySelector}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      serviceData.category === category && styles.selectedCategory
                    ]}
                    onPress={() => setServiceData(prev => ({ ...prev, category }))}
                  >
                    <Text style={[
                      styles.categoryButtonText,
                      serviceData.category === category && styles.selectedCategoryText
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.priceRow}>
            <View style={styles.priceInput}>
              <Text style={styles.inputLabel}>Prix minimum (FCFA) *</Text>
              <TextInput
                style={styles.input}
                placeholder="15000"
                value={serviceData.priceMin}
                onChangeText={(text) => setServiceData(prev => ({ ...prev, priceMin: text }))}
                keyboardType="numeric"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.priceInput}>
              <Text style={styles.inputLabel}>Prix maximum (FCFA) *</Text>
              <TextInput
                style={styles.input}
                placeholder="25000"
                value={serviceData.priceMax}
                onChangeText={(text) => setServiceData(prev => ({ ...prev, priceMax: text }))}
                keyboardType="numeric"
                placeholderTextColor="#666"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Durée estimée</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 1-2 heures"
              value={serviceData.duration}
              onChangeText={(text) => setServiceData(prev => ({ ...prev, duration: text }))}
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.photosSection}>
            <Text style={styles.inputLabel}>Photos du service</Text>
            <TouchableOpacity style={styles.photoButton} onPress={handleAddPhotos}>
              <Camera size={24} color="#666" />
              <Text style={styles.photoButtonText}>Ajouter des photos</Text>
            </TouchableOpacity>

            <View style={styles.photoGrid}>
              {/* Placeholder for existing photos */}
              <View style={styles.photoPlaceholder}>
                <Upload size={20} color="#666" />
                <Text style={styles.photoPlaceholderText}>Photo 1</Text>
              </View>
              <View style={styles.photoPlaceholder}>
                <Upload size={20} color="#666" />
                <Text style={styles.photoPlaceholderText}>Photo 2</Text>
              </View>
            </View>
          </View>

          <View style={styles.formActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Enregistrer</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.dangerZone}>
          <Text style={styles.dangerZoneTitle}>Zone de danger</Text>
          <Text style={styles.dangerZoneText}>
            Supprimez définitivement ce service. Cette action est irréversible.
          </Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteService}
          >
            <Trash2 size={16} color="#FFFFFF" />
            <Text style={styles.deleteButtonText}>Supprimer le service</Text>
          </TouchableOpacity>
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
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
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
  inputLabel: {
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
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categorySelector: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  categoryButton: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedCategory: {
    backgroundColor: '#FF7A00',
  },
  categoryButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceInput: {
    flex: 1,
    marginRight: 8,
  },
  photosSection: {
    marginBottom: 20,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 20,
    marginBottom: 16,
  },
  photoButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginLeft: 8,
  },
  photoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  photoPlaceholder: {
    width: '48%',
    height: 100,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  photoPlaceholderText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 8,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#FF7A00',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  dangerZone: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#FFEBEE',
  },
  dangerZoneTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FF5722',
    marginBottom: 8,
  },
  dangerZoneText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 16,
    lineHeight: 18,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF5722',
    paddingVertical: 12,
    borderRadius: 8,
  },
  deleteButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});