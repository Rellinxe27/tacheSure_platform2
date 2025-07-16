// app/task-creation.tsx - Enhanced with photo upload functionality
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/app/contexts/AuthContext';
import { useTasks } from '@/hooks/useTasks';
import { useCategories } from '@/hooks/useCategories';
import { MapPin, DollarSign, Clock, Camera, X, Upload } from 'lucide-react-native';
import { validateTaskData } from '@/utils/validation';
import { useDynamicIslandNotification } from '@/components/SnackBar';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

// Enhanced upload function for task images
const uploadDocumentToSupabase = async (
  imageUri: string,
  userId: string,
  filename: string
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const fileName = `${filename}_${timestamp}_${randomId}.jpg`;
    const filePath = `task-images/${userId}/${fileName}`;

    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convert base64 to ArrayBuffer
    const arrayBuffer = decode(base64);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('task-images')
      .upload(filePath, arrayBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return { success: false, error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('task-images')
      .getPublicUrl(filePath);

    return {
      success: true,
      url: urlData.publicUrl
    };

  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: 'Failed to upload image'
    };
  }
};

export default function TaskCreationScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { createTask } = useTasks();
  const { categories } = useCategories();
  const { showNotification, NotificationComponent } = useDynamicIslandNotification();

  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    category_id: '',
    budget_min: '',
    budget_max: '',
    urgency: 'normal' as const,
    location: { lat: 5.3600, lng: -4.0083 },
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

  const [selectedImages, setSelectedImages] = useState<{ uri: string; uploaded?: boolean }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission nécessaire', 'Veuillez autoriser l\'accès à la galerie photo');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map(asset => ({ uri: asset.uri, uploaded: false }));
        setSelectedImages(prev => [...prev, ...newImages]);
      }
    } catch (error) {
      showNotification('Erreur lors de la sélection des images', 'error');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission nécessaire', 'Veuillez autoriser l\'accès à la caméra');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets?.[0]) {
        const newImage = { uri: result.assets[0].uri, uploaded: false };
        setSelectedImages(prev => [...prev, newImage]);
      }
    } catch (error) {
      showNotification('Erreur lors de la prise de photo', 'error');
    }
  };

  const uploadImages = async (): Promise<string[]> => {
    if (selectedImages.length === 0) return [];

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < selectedImages.length; i++) {
        const image = selectedImages[i];
        if (image.uploaded) continue;

        const timestamp = Date.now();
        const filename = `task_${user?.id}_${timestamp}_${i}`;

        // Upload to Supabase storage
        const uploadResult = await uploadDocumentToSupabase(
          image.uri,
          user?.id || '',
          filename
        );

        if (uploadResult.success && uploadResult.url) {
          uploadedUrls.push(uploadResult.url);
          // Mark as uploaded
          setSelectedImages(prev =>
            prev.map((img, index) =>
              index === i ? { ...img, uploaded: true } : img
            )
          );
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      showNotification('Erreur lors du téléchargement des images', 'error');
    } finally {
      setUploading(false);
    }

    return uploadedUrls;
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

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
      // Upload images first
      const uploadedImageUrls = await uploadImages();

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
        images: uploadedImageUrls,
        status: 'posted'
      });

      if (result.error) {
        Alert.alert('Erreur', result.error);
      } else {
        showNotification('Tâche créée avec succès!', 'success');
        router.push(`/task-details?taskId=${result.data.id}`);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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

        {/* Photo Upload Section */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Photos (optionnel)</Text>
          <Text style={styles.sublabel}>Ajoutez des photos pour mieux décrire votre tâche</Text>

          <View style={styles.photoActions}>
            <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
              <Camera size={20} color="#FF7A00" />
              <Text style={styles.photoButtonText}>Prendre une photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
              <Upload size={20} color="#FF7A00" />
              <Text style={styles.photoButtonText}>Galerie</Text>
            </TouchableOpacity>
          </View>

          {selectedImages.length > 0 && (
            <View style={styles.imageGrid}>
              {selectedImages.map((image, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image source={{ uri: image.uri }} style={styles.selectedImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <X size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                  {image.uploaded && (
                    <View style={styles.uploadedBadge}>
                      <Text style={styles.uploadedText}>✓</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, (loading || uploading) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading || uploading}
        >
          <Text style={styles.submitButtonText}>
            {uploading ? 'Téléchargement...' : loading ? 'Création...' : 'Publier la tâche'}
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
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
  sublabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 12,
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
  photoActions: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  photoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  photoButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FF7A00',
    marginLeft: 8,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FF5722',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadedBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadedText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
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