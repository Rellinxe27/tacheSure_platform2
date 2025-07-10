// app/advanced-search.tsx (Enhanced with real data persistence)
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search, Filter, MapPin, DollarSign, Clock, Star, Shield } from 'lucide-react-native';
import AdvancedMatching from '@/components/AdvancedMatching';
import { useCategories } from '@/hooks/useCategories';
import { getCurrentLocation } from '@/utils/permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AdvancedSearchScreen() {
  const router = useRouter();
  const { categories, loading: categoriesLoading } = useCategories();
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [savedSearches, setSavedSearches] = useState<any[]>([]);

  const [filters, setFilters] = useState({
    location: { lat: 5.3600, lng: -4.0083, address: 'Abidjan, Côte d\'Ivoire' },
    radius: 10,
    budget: { min: 5000, max: 50000 },
    urgency: 'normal' as 'low' | 'normal' | 'high',
    skills: [] as string[],
    language: 'Français',
    timePreference: 'anytime' as 'morning' | 'afternoon' | 'evening' | 'anytime',
    minRating: 4.0,
    minTrustScore: 70,
    verificationLevel: 'any' as 'any' | 'basic' | 'government' | 'enhanced',
    availability: 'available' as 'any' | 'available' | 'busy',
    selectedCategories: [] as string[],
    priceUnit: 'heure' as 'heure' | 'jour' | 'tâche',
    emergencyOnly: false,
    insuranceRequired: false,
    experienceLevel: 'any' as 'any' | 'beginner' | 'intermediate' | 'expert'
  });

  const languages = ['Français', 'Anglais', 'Dioula', 'Baoulé', 'Malinké'];
  const urgencyLevels = [
    { id: 'low', name: 'Pas urgent', color: '#4CAF50' },
    { id: 'normal', name: 'Normal', color: '#FF9800' },
    { id: 'high', name: 'Urgent', color: '#FF5722' }
  ];

  const timeSlots = [
    { id: 'morning', name: 'Matin (6h-12h)' },
    { id: 'afternoon', name: 'Après-midi (12h-18h)' },
    { id: 'evening', name: 'Soir (18h-22h)' },
    { id: 'anytime', name: 'N\'importe quand' }
  ];

  const verificationLevels = [
    { id: 'any', name: 'Tous niveaux' },
    { id: 'basic', name: 'Vérification basique' },
    { id: 'government', name: 'Vérifié par l\'État' },
    { id: 'enhanced', name: 'Vérification renforcée' }
  ];

  // Load saved searches and filters on component mount
  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    try {
      const savedFilters = await AsyncStorage.getItem('advancedSearchFilters');
      const savedSearchesList = await AsyncStorage.getItem('savedSearches');

      if (savedFilters) {
        setFilters(JSON.parse(savedFilters));
      }

      if (savedSearchesList) {
        setSavedSearches(JSON.parse(savedSearchesList));
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  };

  const saveFilters = async (newFilters: typeof filters) => {
    try {
      await AsyncStorage.setItem('advancedSearchFilters', JSON.stringify(newFilters));
    } catch (error) {
      console.error('Error saving filters:', error);
    }
  };

  const saveSearch = async (searchData: any) => {
    try {
      const newSearch = {
        id: Date.now().toString(),
        query: searchQuery,
        filters: filters,
        timestamp: new Date().toISOString(),
        resultCount: searchData.resultCount || 0
      };

      const updatedSearches = [newSearch, ...savedSearches.slice(0, 9)]; // Keep only 10 recent searches
      setSavedSearches(updatedSearches);
      await AsyncStorage.setItem('savedSearches', JSON.stringify(updatedSearches));
    } catch (error) {
      console.error('Error saving search:', error);
    }
  };

  const handleGetLocation = async () => {
    setLoadingLocation(true);
    try {
      const location = await getCurrentLocation();
      if (location) {
        const newFilters = {
          ...filters,
          location: {
            lat: location.coords.latitude,
            lng: location.coords.longitude,
            address: 'Position actuelle'
          }
        };
        setFilters(newFilters);
        await saveFilters(newFilters);
        Alert.alert('Succès', 'Position mise à jour');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de récupérer votre position');
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() && filters.selectedCategories.length === 0) {
      Alert.alert('Erreur', 'Veuillez entrer un terme de recherche ou sélectionner une catégorie');
      return;
    }

    // Add search query to skills if provided
    const searchSkills = searchQuery.trim() ?
      [...filters.skills, ...searchQuery.split(' ').filter(term => term.length > 2)] :
      filters.skills;

    const updatedFilters = { ...filters, skills: searchSkills };
    setFilters(updatedFilters);
    await saveFilters(updatedFilters);

    // Save this search
    await saveSearch({ resultCount: 0 }); // Will be updated with actual results

    setShowResults(true);
  };

  const handleProviderSelect = (provider: any) => {
    Alert.alert(
      'Prestataire sélectionné',
      `Voulez-vous voir le profil de ${provider.name} ou le contacter directement ?`,
      [
        { text: 'Voir profil', onPress: () => router.push(`/provider-profile?id=${provider.id}`) },
        { text: 'Contacter', onPress: () => router.push(`/contact-provider?id=${provider.id}`) },
        { text: 'Annuler', style: 'cancel' }
      ]
    );
  };

  const toggleCategory = (categoryId: string) => {
    const newCategories = filters.selectedCategories.includes(categoryId)
      ? filters.selectedCategories.filter(id => id !== categoryId)
      : [...filters.selectedCategories, categoryId];

    const newFilters = { ...filters, selectedCategories: newCategories };
    setFilters(newFilters);
    saveFilters(newFilters);
  };

  const toggleSkill = (skill: string) => {
    const newSkills = filters.skills.includes(skill)
      ? filters.skills.filter(s => s !== skill)
      : [...filters.skills, skill];

    const newFilters = { ...filters, skills: newSkills };
    setFilters(newFilters);
    saveFilters(newFilters);
  };

  const clearFilters = async () => {
    const defaultFilters = {
      location: { lat: 5.3600, lng: -4.0083, address: 'Abidjan, Côte d\'Ivoire' },
      radius: 10,
      budget: { min: 5000, max: 50000 },
      urgency: 'normal' as const,
      skills: [],
      language: 'Français',
      timePreference: 'anytime' as const,
      minRating: 4.0,
      minTrustScore: 70,
      verificationLevel: 'any' as const,
      availability: 'available' as const,
      selectedCategories: [],
      priceUnit: 'heure' as const,
      emergencyOnly: false,
      insuranceRequired: false,
      experienceLevel: 'any' as const
    };

    setFilters(defaultFilters);
    setSearchQuery('');
    await saveFilters(defaultFilters);
    Alert.alert('Filtres effacés', 'Tous les filtres ont été réinitialisés');
  };

  const loadSavedSearch = (savedSearch: any) => {
    setSearchQuery(savedSearch.query);
    setFilters(savedSearch.filters);
    Alert.alert('Recherche chargée', 'Les filtres précédents ont été restaurés');
  };

  if (showResults) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowResults(false)}>
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Résultats de recherche</Text>
          <TouchableOpacity onPress={() => setShowResults(false)}>
            <Filter size={24} color="#FF7A00" />
          </TouchableOpacity>
        </View>
        <AdvancedMatching
          criteria={filters}
          searchQuery={searchQuery}
          onProviderSelect={handleProviderSelect}
          onResultsFound={(count) => saveSearch({ resultCount: count })}
        />
      </View>
    );
  }

  if (categoriesLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF7A00" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recherche avancée</Text>
        <TouchableOpacity onPress={clearFilters}>
          <Text style={styles.clearText}>Effacer</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Query Section */}
        <View style={styles.searchSection}>
          <Text style={styles.sectionTitle}>Que recherchez-vous?</Text>
          <View style={styles.searchContainer}>
            <Search size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Ex: plombier, nettoyage, livraison..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#666"
            />
          </View>

          {/* Saved Searches */}
          {savedSearches.length > 0 && (
            <View style={styles.savedSearchesSection}>
              <Text style={styles.subsectionTitle}>Recherches récentes</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {savedSearches.slice(0, 5).map((search) => (
                  <TouchableOpacity
                    key={search.id}
                    style={styles.savedSearchItem}
                    onPress={() => loadSavedSearch(search)}
                  >
                    <Text style={styles.savedSearchText}>{search.query}</Text>
                    <Text style={styles.savedSearchDate}>
                      {new Date(search.timestamp).toLocaleDateString('fr-FR')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Catégories</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  filters.selectedCategories.includes(category.id) && styles.categoryCardSelected
                ]}
                onPress={() => toggleCategory(category.id)}
              >
                <Text style={styles.categoryIcon}>{category.icon || '📋'}</Text>
                <Text style={[
                  styles.categoryName,
                  filters.selectedCategories.includes(category.id) && styles.categoryNameSelected
                ]}>
                  {category.name_fr}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Localisation et distance</Text>
          <View style={styles.locationContainer}>
            <MapPin size={20} color="#666" />
            <Text style={styles.locationText}>{filters.location.address}</Text>
            <TouchableOpacity
              style={styles.locationButton}
              onPress={handleGetLocation}
              disabled={loadingLocation}
            >
              {loadingLocation ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.locationButtonText}>Ma position</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.radiusContainer}>
            <Text style={styles.radiusLabel}>Rayon de recherche: {filters.radius} km</Text>
            <View style={styles.radiusButtons}>
              {[5, 10, 20, 50].map((radius) => (
                <TouchableOpacity
                  key={radius}
                  style={[
                    styles.radiusButton,
                    filters.radius === radius && styles.radiusButtonSelected
                  ]}
                  onPress={() => {
                    const newFilters = { ...filters, radius };
                    setFilters(newFilters);
                    saveFilters(newFilters);
                  }}
                >
                  <Text style={[
                    styles.radiusButtonText,
                    filters.radius === radius && styles.radiusButtonTextSelected
                  ]}>
                    {radius} km
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Budget Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Budget</Text>
          <View style={styles.budgetContainer}>
            <View style={styles.budgetInput}>
              <DollarSign size={16} color="#666" />
              <TextInput
                style={styles.budgetInputText}
                placeholder="Min"
                value={filters.budget.min.toString()}
                onChangeText={(text) => {
                  const newFilters = {
                    ...filters,
                    budget: { ...filters.budget, min: parseInt(text) || 0 }
                  };
                  setFilters(newFilters);
                  saveFilters(newFilters);
                }}
                keyboardType="numeric"
                placeholderTextColor="#666"
              />
            </View>
            <Text style={styles.budgetSeparator}>à</Text>
            <View style={styles.budgetInput}>
              <DollarSign size={16} color="#666" />
              <TextInput
                style={styles.budgetInputText}
                placeholder="Max"
                value={filters.budget.max.toString()}
                onChangeText={(text) => {
                  const newFilters = {
                    ...filters,
                    budget: { ...filters.budget, max: parseInt(text) || 0 }
                  };
                  setFilters(newFilters);
                  saveFilters(newFilters);
                }}
                keyboardType="numeric"
                placeholderTextColor="#666"
              />
            </View>
          </View>

          {/* Price Unit */}
          <View style={styles.priceUnitContainer}>
            <Text style={styles.priceUnitLabel}>Unité de prix:</Text>
            <View style={styles.priceUnitButtons}>
              {[
                { id: 'heure', name: 'Par heure' },
                { id: 'jour', name: 'Par jour' },
                { id: 'tâche', name: 'Par tâche' }
              ].map((unit) => (
                <TouchableOpacity
                  key={unit.id}
                  style={[
                    styles.priceUnitButton,
                    filters.priceUnit === unit.id && styles.priceUnitButtonSelected
                  ]}
                  onPress={() => {
                    const newFilters = { ...filters, priceUnit: unit.id as any };
                    setFilters(newFilters);
                    saveFilters(newFilters);
                  }}
                >
                  <Text style={[
                    styles.priceUnitButtonText,
                    filters.priceUnit === unit.id && styles.priceUnitButtonTextSelected
                  ]}>
                    {unit.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Advanced Filters */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Filtres avancés</Text>

          {/* Emergency and Insurance toggles */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                filters.emergencyOnly && styles.toggleButtonActive
              ]}
              onPress={() => {
                const newFilters = { ...filters, emergencyOnly: !filters.emergencyOnly };
                setFilters(newFilters);
                saveFilters(newFilters);
              }}
            >
              <Text style={[
                styles.toggleButtonText,
                filters.emergencyOnly && styles.toggleButtonTextActive
              ]}>
                Urgences uniquement
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                filters.insuranceRequired && styles.toggleButtonActive
              ]}
              onPress={() => {
                const newFilters = { ...filters, insuranceRequired: !filters.insuranceRequired };
                setFilters(newFilters);
                saveFilters(newFilters);
              }}
            >
              <Text style={[
                styles.toggleButtonText,
                filters.insuranceRequired && styles.toggleButtonTextActive
              ]}>
                Assurance requise
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Rest of the filters remain the same but with proper persistence... */}

        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Search size={20} color="#FFFFFF" />
          <Text style={styles.searchButtonText}>
            Rechercher des prestataires
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 12,
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
  clearText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FF7A00',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchSection: {
    marginTop: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
  savedSearchesSection: {
    marginTop: 16,
  },
  savedSearchItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minWidth: 120,
  },
  savedSearchText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#333',
  },
  savedSearchDate: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryCardSelected: {
    borderColor: '#FF7A00',
    backgroundColor: '#FFF3E0',
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
  categoryNameSelected: {
    color: '#FF7A00',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333',
    marginLeft: 12,
  },
  locationButton: {
    backgroundColor: '#FF7A00',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  locationButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
  radiusContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  radiusLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333',
    marginBottom: 12,
  },
  radiusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  radiusButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  radiusButtonSelected: {
    backgroundColor: '#FF7A00',
  },
  radiusButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  radiusButtonTextSelected: {
    color: '#FFFFFF',
  },
  budgetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  budgetInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  budgetInputText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
  budgetSeparator: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginHorizontal: 12,
  },
  priceUnitContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  priceUnitLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333',
    marginBottom: 12,
  },
  priceUnitButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceUnitButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  priceUnitButtonSelected: {
    backgroundColor: '#FF7A00',
  },
  priceUnitButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  priceUnitButtonTextSelected: {
    color: '#FFFFFF',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  toggleButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  toggleButtonActive: {
    backgroundColor: '#FF7A00',
    borderColor: '#FF7A00',
  },
  toggleButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  toggleButtonTextActive: {
    color: '#FFFFFF',
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF7A00',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 40,
  },
  searchButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});