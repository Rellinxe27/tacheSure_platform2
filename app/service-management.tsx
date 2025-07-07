import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus, Edit3, Trash2, DollarSign, Clock, Camera, Upload } from 'lucide-react-native';

interface Service {
  id: string;
  name: string;
  description: string;
  priceMin: number;
  priceMax: number;
  duration: string;
  category: string;
  active: boolean;
  images: string[];
}

export default function ServiceManagementScreen() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([
    {
      id: '1',
      name: 'Réparation de fuite',
      description: 'Réparation rapide de fuites d\'eau, robinets et tuyauterie',
      priceMin: 15000,
      priceMax: 25000,
      duration: '1-2 heures',
      category: 'Plomberie',
      active: true,
      images: []
    },
    {
      id: '2',
      name: 'Installation sanitaire',
      description: 'Installation complète de sanitaires, douches et lavabos',
      priceMin: 50000,
      priceMax: 100000,
      duration: '4-6 heures',
      category: 'Plomberie',
      active: true,
      images: []
    },
    {
      id: '3',
      name: 'Débouchage canalisation',
      description: 'Débouchage professionnel de canalisations et évacuations',
      priceMin: 10000,
      priceMax: 20000,
      duration: '30min-1h',
      category: 'Plomberie',
      active: false,
      images: []
    }
  ]);

  const [showAddService, setShowAddService] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    priceMin: '',
    priceMax: '',
    duration: '',
    category: 'Plomberie'
  });

  const categories = [
    'Plomberie', 'Électricité', 'Menuiserie', 'Peinture', 'Nettoyage',
    'Jardinage', 'Livraison', 'Cuisine', 'Tutorat', 'Réparation'
  ];

  const handleToggleService = (serviceId: string) => {
    setServices(prev => prev.map(service =>
      service.id === serviceId
        ? { ...service, active: !service.active }
        : service
    ));
    Alert.alert('Service mis à jour', 'Le statut du service a été modifié');
  };

  const handleDeleteService = (serviceId: string) => {
    Alert.alert(
      'Supprimer le service',
      'Êtes-vous sûr de vouloir supprimer ce service?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            setServices(prev => prev.filter(service => service.id !== serviceId));
            Alert.alert('Service supprimé', 'Le service a été supprimé avec succès');
          }
        }
      ]
    );
  };

  const handleAddService = () => {
    if (!newService.name || !newService.description || !newService.priceMin || !newService.priceMax) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    const service: Service = {
      id: Date.now().toString(),
      name: newService.name,
      description: newService.description,
      priceMin: parseInt(newService.priceMin),
      priceMax: parseInt(newService.priceMax),
      duration: newService.duration,
      category: newService.category,
      active: true,
      images: []
    };

    setServices(prev => [...prev, service]);
    setNewService({ name: '', description: '', priceMin: '', priceMax: '', duration: '', category: 'Plomberie' });
    setShowAddService(false);
    Alert.alert('Service ajouté', 'Le nouveau service a été ajouté avec succès');
  };

  const handleEditService = (serviceId: string) => {
    router.push(`/edit-service?serviceId=${serviceId}`);
  };

  const handleAddPhotos = (serviceId: string) => {
    Alert.alert('Ajouter des photos', 'Cette fonctionnalité sera bientôt disponible');
  };

  if (showAddService) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowAddService(false)}>
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ajouter un service</Text>
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
              <Text style={styles.inputLabel}>Catégorie</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categorySelector}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryButton,
                        newService.category === category && styles.selectedCategory
                      ]}
                      onPress={() => setNewService(prev => ({ ...prev, category }))}
                    >
                      <Text style={[
                        styles.categoryButtonText,
                        newService.category === category && styles.selectedCategoryText
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
                  value={newService.priceMin}
                  onChangeText={(text) => setNewService(prev => ({ ...prev, priceMin: text }))}
                  keyboardType="numeric"
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.priceInput}>
                <Text style={styles.inputLabel}>Prix maximum (FCFA) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="25000"
                  value={newService.priceMax}
                  onChangeText={(text) => setNewService(prev => ({ ...prev, priceMax: text }))}
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
                value={newService.duration}
                onChangeText={(text) => setNewService(prev => ({ ...prev, duration: text }))}
                placeholderTextColor="#666"
              />
            </View>

            <TouchableOpacity style={styles.photoButton}>
              <Camera size={24} color="#666" />
              <Text style={styles.photoButtonText}>Ajouter des photos (optionnel)</Text>
            </TouchableOpacity>

            <View style={styles.formActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddService(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddService}
              >
                <Text style={styles.saveButtonText}>Ajouter le service</Text>
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
        <TouchableOpacity onPress={() => setShowAddService(true)}>
          <Plus size={24} color="#FF7A00" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{services.filter(s => s.active).length}</Text>
            <Text style={styles.statLabel}>Services actifs</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{services.length}</Text>
            <Text style={styles.statLabel}>Total services</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>4.8</Text>
            <Text style={styles.statLabel}>Note moyenne</Text>
          </View>
        </View>

        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>Liste des services</Text>

          {services.map((service) => (
            <View key={service.id} style={styles.serviceCard}>
              <View style={styles.serviceHeader}>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceCategory}>{service.category}</Text>
                </View>

                <View style={styles.serviceControls}>
                  <Switch
                    value={service.active}
                    onValueChange={() => handleToggleService(service.id)}
                    trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                    thumbColor={service.active ? '#FFFFFF' : '#F4F3F4'}
                  />
                </View>
              </View>

              <Text style={styles.serviceDescription}>{service.description}</Text>

              <View style={styles.serviceDetails}>
                <View style={styles.priceInfo}>
                  <DollarSign size={16} color="#FF7A00" />
                  <Text style={styles.priceText}>
                    {service.priceMin.toLocaleString()} - {service.priceMax.toLocaleString()} FCFA
                  </Text>
                </View>

                {service.duration && (
                  <View style={styles.durationInfo}>
                    <Clock size={16} color="#666" />
                    <Text style={styles.durationText}>{service.duration}</Text>
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
                  onPress={() => handleEditService(service.id)}
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
          ))}
        </View>

        <TouchableOpacity
          style={styles.addServiceButton}
          onPress={() => setShowAddService(true)}
        >
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.addServiceButtonText}>Ajouter un nouveau service</Text>
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
    alignItems: 'center',
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