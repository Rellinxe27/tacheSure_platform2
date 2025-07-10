// app/service-management.tsx (Fixed with proper Supabase integration)
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Switch, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus, Edit3, Trash2, DollarSign, Clock, Camera, Upload } from 'lucide-react-native';
import { useAuth } from '@/app/contexts/AuthContext';
import { useServices } from '@/hooks/useServices';
import { useCategories } from '@/hooks/useCategories';
import { formatCurrency } from '@/utils/formatting';

export default function ServiceManagementScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { services, loading: servicesLoading, createService, updateService, deleteService } = useServices(user?.id);
  const { categories, loading: categoriesLoading } = useCategories();

  const [showAddService, setShowAddService] = useState(false);
  const [editingService, setEditingService] = useState<string | null>(null);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    price_min: '',
    price_max: '',
    duration_estimate: '',
    category_id: '',
    requirements: [] as string[],
    tags: [] as string[],
    is_emergency_available: false
  });

  const [stats, setStats] = useState({
    activeServices: 0,
    totalServices: 0,
    averageRating: 0
  });

  useEffect(() => {
    if (services.length > 0) {
      setStats({
        activeServices: services.filter(s => s.is_active).length,
        totalServices: services.length,
        averageRating: 4.8 // This would come from reviews in a real implementation
      });
    }
  }, [services]);

  const resetForm = () => {
    setNewService({
      name: '',
      description: '',
      price_min: '',
      price_max: '',
      duration_estimate: '',
      category_id: '',
      requirements: [],
      tags: [],
      is_emergency_available: false
    });
    setEditingService(null);
  };

  const handleToggleService = async (serviceId: string, isActive: boolean) => {
    const { error } = await updateService(serviceId, { is_active: isActive });

    if (error) {
      Alert.alert('Erreur', error);
    } else {
      Alert.alert('Succès', `Service ${isActive ? 'activé' : 'désactivé'} avec succès`);
    }
  };

  const handleDeleteService = (serviceId: string) => {
    Alert.alert(
      'Supprimer le service',
      'Êtes-vous sûr de vouloir supprimer ce service? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            const { error } = await deleteService(serviceId);
            if (error) {
              Alert.alert('Erreur', error);
            } else {
              Alert.alert('Service supprimé', 'Le service a été supprimé avec succès');
            }
          }
        }
      ]
    );
  };

  const validateServiceData = () => {
    if (!newService.name.trim()) {
      Alert.alert('Erreur', 'Le nom du service est obligatoire');
      return false;
    }
    if (!newService.description.trim()) {
      Alert.alert('Erreur', 'La description du service est obligatoire');
      return false;
    }
    if (!newService.price_min || !newService.price_max) {
      Alert.alert('Erreur', 'Les prix minimum et maximum sont obligatoires');
      return false;
    }
    if (parseInt(newService.price_min) > parseInt(newService.price_max)) {
      Alert.alert('Erreur', 'Le prix minimum ne peut pas être supérieur au prix maximum');
      return false;
    }
    if (!newService.category_id) {
      Alert.alert('Erreur', 'Veuillez sélectionner une catégorie');
      return false;
    }
    return true;
  };

  const handleSaveService = async () => {
    if (!validateServiceData()) return;
    if (!user) {
      Alert.alert('Erreur', 'Utilisateur non connecté');
      return;
    }

    const serviceData = {
      provider_id: user.id,
      name: newService.name.trim(),
      description: newService.description.trim(),
      price_min: parseInt(newService.price_min),
      price_max: parseInt(newService.price_max),
      price_unit: 'FCFA',
      duration_estimate: newService.duration_estimate || null,
      category_id: newService.category_id || null,
      requirements: newService.requirements,
      tags: newService.tags,
      is_active: true,
      is_emergency_available: newService.is_emergency_available,
      service_area: null, // Could be added later
      max_distance: 50, // Default 50km radius
      images: [] // Will be added when photo upload is implemented
    };

    let result;
    if (editingService) {
      result = await updateService(editingService, serviceData);
    } else {
      result = await createService(serviceData);
    }

    if (result.error) {
      Alert.alert('Erreur', result.error);
    } else {
      Alert.alert(
        'Succès',
        editingService ? 'Service mis à jour avec succès' : 'Service créé avec succès'
      );
      resetForm();
      setShowAddService(false);
    }
  };

  const handleEditService = (service: any) => {
    setNewService({
      name: service.name,
      description: service.description,
      price_min: service.price_min.toString(),
      price_max: service.price_max.toString(),
      duration_estimate: service.duration_estimate || '',
      category_id: service.category_id || '',
      requirements: service.requirements || [],
      tags: service.tags || [],
      is_emergency_available: service.is_emergency_available || false
    });
    setEditingService(service.id);
    setShowAddService(true);
  };

  const handleAddPhotos = (serviceId: string) => {
    Alert.alert(
      'Ajouter des photos',
      'La fonctionnalité d\'upload de photos sera bientôt disponible. En attendant, vous pouvez ajouter des photos via votre profil.'
    );
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name_fr : 'Catégorie inconnue';
  };

  if (showAddService) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => {
            resetForm();
            setShowAddService(false);
          }}>
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {editingService ? 'Modifier le service' : 'Ajouter un service'}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nom du service *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Réparation de plomberie"
                value={newService.name}
                onChangeText={(text) => setNewService(prev => ({ ...prev, name: text }))}
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Décrivez votre service en détail..."
                value={newService.description}
                onChangeText={(text) => setNewService(prev => ({ ...prev, description: text }))}
                multiline
                numberOfLines={4}
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Catégorie *</Text>
              {categoriesLoading ? (
                <Text style={styles.loadingText}>Chargement des catégories...</Text>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.categorySelector}>
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.categoryButton,
                          newService.category_id === category.id && styles.selectedCategory
                        ]}
                        onPress={() => setNewService(prev => ({ ...prev, category_id: category.id }))}
                      >
                        <Text style={styles.categoryIcon}>{category.icon || '📋'}</Text>
                        <Text style={[
                          styles.categoryButtonText,
                          newService.category_id === category.id && styles.selectedCategoryText
                        ]}>
                          {category.name_fr}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              )}
            </View>

            <View style={styles.priceRow}>
              <View style={styles.priceInput}>
                <Text style={styles.inputLabel}>Prix minimum (FCFA) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="15000"
                  value={newService.price_min}
                  onChangeText={(text) => setNewService(prev => ({ ...prev, price_min: text }))}
                  keyboardType="numeric"
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.priceInput}>
                <Text style={styles.inputLabel}>Prix maximum (FCFA) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="25000"
                  value={newService.price_max}
                  onChangeText={(text) => setNewService(prev => ({ ...prev, price_max: text }))}
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
                value={newService.duration_estimate}
                onChangeText={(text) => setNewService(prev => ({ ...prev, duration_estimate: text }))}
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.switchContainer}>
                <Text style={styles.inputLabel}>Service d'urgence disponible</Text>
                <Switch
                  value={newService.is_emergency_available}
                  onValueChange={(value) => setNewService(prev => ({ ...prev, is_emergency_available: value }))}
                  trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                  thumbColor={newService.is_emergency_available ? '#FFFFFF' : '#F4F3F4'}
                />
              </View>
              <Text style={styles.helperText}>
                Activez cette option si vous pouvez intervenir en urgence
              </Text>
            </View>

            <TouchableOpacity style={styles.photoButton} onPress={() => handleAddPhotos('new')}>
              <Camera size={24} color="#666" />
              <Text style={styles.photoButtonText}>Ajouter des photos (optionnel)</Text>
            </TouchableOpacity>

            <View style={styles.formActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  resetForm();
                  setShowAddService(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveService}
              >
                <Text style={styles.saveButtonText}>
                  {editingService ? 'Mettre à jour' : 'Créer le service'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes services</Text>
        <TouchableOpacity onPress={() => {
          resetForm();
          setShowAddService(true);
        }}>
          <Plus size={24} color="#FF7A00" />
        </TouchableOpacity>
      </View>

      {servicesLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF7A00" />
          <Text style={styles.loadingText}>Chargement des services...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.activeServices}</Text>
              <Text style={styles.statLabel}>Services actifs</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalServices}</Text>
              <Text style={styles.statLabel}>Total services</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.averageRating}</Text>
              <Text style={styles.statLabel}>Note moyenne</Text>
            </View>
          </View>

          <View style={styles.servicesSection}>
            <Text style={styles.sectionTitle}>Liste des services</Text>

            {services.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>Aucun service créé</Text>
                <Text style={styles.emptyStateSubtext}>
                  Commencez par créer votre premier service pour recevoir des demandes
                </Text>
                <TouchableOpacity
                  style={styles.emptyStateButton}
                  onPress={() => {
                    resetForm();
                    setShowAddService(true);
                  }}
                >
                  <Plus size={20} color="#FFFFFF" />
                  <Text style={styles.emptyStateButtonText}>Créer mon premier service</Text>
                </TouchableOpacity>
              </View>
            ) : (
              services.map((service) => (
                <View key={service.id} style={styles.serviceCard}>
                  <View style={styles.serviceHeader}>
                    <View style={styles.serviceInfo}>
                      <Text style={styles.serviceName}>{service.name}</Text>
                      <Text style={styles.serviceCategory}>
                        {getCategoryName(service.category_id || '')}
                      </Text>
                      {service.is_emergency_available && (
                        <View style={styles.emergencyBadge}>
                          <Text style={styles.emergencyText}>🚨 Urgence</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.serviceControls}>
                      <Switch
                        value={service.is_active || false}
                        onValueChange={(value) => handleToggleService(service.id, value)}
                        trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                        thumbColor={service.is_active ? '#FFFFFF' : '#F4F3F4'}
                      />
                    </View>
                  </View>

                  <Text style={styles.serviceDescription} numberOfLines={2}>
                    {service.description}
                  </Text>

                  <View style={styles.serviceDetails}>
                    <View style={styles.priceInfo}>
                      <DollarSign size={16} color="#FF7A00" />
                      <Text style={styles.priceText}>
                        {formatCurrency(service.price_min)} - {formatCurrency(service.price_max)}
                      </Text>
                    </View>

                    {service.duration_estimate && (
                      <View style={styles.durationInfo}>
                        <Clock size={16} color="#666" />
                        <Text style={styles.durationText}>{service.duration_estimate}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.serviceActions}>
                    <TouchableOpacity
                      style={styles.photoActionButton}
                      onPress={() => handleAddPhotos(service.id)}
                    >
                      <Upload size={16} color="#666" />
                      <Text style={styles.photoActionText}>Photos</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => handleEditService(service)}
                    >
                      <Edit3 size={16} color="#FF7A00" />
                      <Text style={styles.editButtonText}>Modifier</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteService(service.id)}
                    >
                      <Trash2 size={16} color="#FF5722" />
                      <Text style={styles.deleteButtonText}>Supprimer</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>

          {services.length > 0 && (
            <TouchableOpacity
              style={styles.addServiceButton}
              onPress={() => {
                resetForm();
                setShowAddService(true);
              }}
            >
              <Plus size={20} color="#FFFFFF" />
              <Text style={styles.addServiceButtonText}>Ajouter un nouveau service</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
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
    textAlign: 'center',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  servicesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF7A00',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  serviceCard: {
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
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  serviceCategory: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FF7A00',
    marginTop: 2,
  },
  emergencyBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  emergencyText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#FF5722',
  },
  serviceControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 12,
    lineHeight: 18,
  },
  serviceDetails: {
    marginBottom: 12,
  },
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  priceText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FF7A00',
    marginLeft: 8,
  },
  durationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginLeft: 8,
  },
  serviceActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
  },
  photoActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  photoActionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginLeft: 4,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FF7A00',
    marginLeft: 4,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FF5722',
    marginLeft: 4,
  },
  addServiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF7A00',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 40,
  },
  addServiceButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    marginBottom: 40,
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    alignItems: 'center',
    minWidth: 80,
  },
  selectedCategory: {
    backgroundColor: '#FF7A00',
  },
  categoryIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  categoryButtonText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#666',
    textAlign: 'center',
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
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  helperText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 4,
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
    marginBottom: 20,
  },
  photoButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginLeft: 8,
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
});