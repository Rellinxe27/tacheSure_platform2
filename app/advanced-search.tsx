// app/advanced-search.tsx (Updated with fixed defaults and removed search requirement)
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
    budget: { min: 1000, max: 100000 }, // More inclusive range
    urgency: 'normal' as 'low' | 'normal' | 'high',
    skills: [] as string[],
    language: 'Français',
    timePreference: 'anytime' as 'morning' | 'afternoon' | 'evening' | 'anytime',
    minRating: 0, // Accept all ratings
    minTrustScore: 0, // Accept all trust scores
    verificationLevel: 'any' as 'any' | 'basic' | 'government' | 'enhanced',
    availability: 'any' as 'any' | 'available' | 'busy', // Accept all availability
    selectedCategories: [] as string[],
    priceUnit: 'heure' as 'heure' | 'jour' | 'tâche',
    emergencyOnly: false,
    insuranceRequired: false,
    experienceLevel: 'any' as 'any' | 'beginner' | 'intermediate' | 'expert'
  });

  const languages = ['Français', 'Anglais', 'Dioula', 'Baoulé', 'Malinké'];

  const verificationLevels = [
    { id: 'any', name: 'Tous niveaux' },
    { id: 'basic', name: 'Vérification basique' },
    { id: 'government', name: 'Vérifié par l\'État' },
    { id: 'enhanced', name: 'Vérification renforcée' }
  ];

  const availabilityOptions = [
    { id: 'any', name: 'Tous' },
    { id: 'available', name: 'Disponible' },
    { id: 'busy', name: 'Occupé' }
  ];

  const experienceLevels = [
    { id: 'any', name: 'Tous niveaux' },
    { id: 'beginner', name: 'Débutant' },
    { id: 'intermediate', name: 'Intermédiaire' },
    { id: 'expert', name: 'Expert' }
  ];

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

      const updatedSearches = [newSearch, ...savedSearches.slice(0, 9)];
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
    // Remove the requirement for search query or categories
    // Add search query to skills if provided
    const searchSkills = searchQuery.trim() ?
      [...filters.skills, ...searchQuery.split(' ').filter(term => term.length > 2)] :
      filters.skills;

    const updatedFilters = { ...filters, skills: searchSkills };
    setFilters(updatedFilters);
    await saveFilters(updatedFilters);

    // Save this search
    await saveSearch({ resultCount: 0 });

    setShowResults(true);
  };

  const handleProviderSelect = (provider: any) => {
    Alert.alert(
      'Prestataire sélectionné',
      `Voulez-vous voir le profil de ${provider.full_name} ou le contacter directement ?`,
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

  const clearFilters = async () => {
    const defaultFilters = {
      location: { lat: 5.3600, lng: -4.0083, address: 'Abidjan, Côte d\'Ivoire' },
      radius: 10,
      budget: { min: 1000, max: 100000 },
      urgency: 'normal' as const,
      skills: [],
      language: 'Français',
      timePreference: 'anytime' as const,
      minRating: 0,
      minTrustScore: 0,
      verificationLevel: 'any' as const,
      availability: 'any' as const,
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
        </View>

        {/* Language Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Langue</Text>
          <View style={styles.languageContainer}>
            {languages.map((language) => (
              <TouchableOpacity
                key={language}
                style={[
                  styles.languageButton,
                  filters.language === language && styles.languageButtonSelected
                ]}
                onPress={() => {
                  const newFilters = { ...filters, language };
                  setFilters(newFilters);
                  saveFilters(newFilters);
                }}
              >
                <Text style={[
                  styles.languageButtonText,
                  filters.language === language && styles.languageButtonTextSelected
                ]}>
                  {language}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Rating & Trust Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Note et confiance</Text>

          <View style={styles.ratingContainer}>
            <Text style={styles.ratingLabel}>Note minimum: {filters.minRating === 0 ? 'Tous' : filters.minRating}/5</Text>
            <View style={styles.ratingButtons}>
              {[0, 3, 4, 4.5, 5].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={[
                    styles.ratingButton,
                    filters.minRating === rating && styles.ratingButtonSelected
                  ]}
                  onPress={() => {
                    const newFilters = { ...filters, minRating: rating };
                    setFilters(newFilters);
                    saveFilters(newFilters);
                  }}
                >
                  <Star size={16} color={filters.minRating === rating ? "#FFFFFF" : "#FFD700"}
                        fill={rating > 0 ? "#FFD700" : "none"} />
                  <Text style={[
                    styles.ratingButtonText,
                    filters.minRating === rating && styles.ratingButtonTextSelected
                  ]}>
                    {rating === 0 ? 'Tous' : rating}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.trustContainer}>
            <Text style={styles.trustLabel}>Score de confiance min: {filters.minTrustScore === 0 ? 'Tous' : filters.minTrustScore + '%'}</Text>
            <View style={styles.trustButtons}>
              {[0, 50, 70, 85, 95].map((score) => (
                <TouchableOpacity
                  key={score}
                  style={[
                    styles.trustButton,
                    filters.minTrustScore === score && styles.trustButtonSelected
                  ]}
                  onPress={() => {
                    const newFilters = { ...filters, minTrustScore: score };
                    setFilters(newFilters);
                    saveFilters(newFilters);
                  }}
                >
                  <Text style={[
                    styles.trustButtonText,
                    filters.minTrustScore === score && styles.trustButtonTextSelected
                  ]}>
                    {score === 0 ? 'Tous' : `${score}%`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Verification Level */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Niveau de vérification</Text>
          <View style={styles.verificationContainer}>
            {verificationLevels.map((level) => (
              <TouchableOpacity
                key={level.id}
                style={[
                  styles.verificationButton,
                  filters.verificationLevel === level.id && styles.verificationButtonSelected
                ]}
                onPress={() => {
                  const newFilters = { ...filters, verificationLevel: level.id as any };
                  setFilters(newFilters);
                  saveFilters(newFilters);
                }}
              >
                <Shield size={16} color={filters.verificationLevel === level.id ? "#FFFFFF" : "#4CAF50"} />
                <Text style={[
                  styles.verificationButtonText,
                  filters.verificationLevel === level.id && styles.verificationButtonTextSelected
                ]}>
                  {level.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Availability Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Disponibilité</Text>
          <View style={styles.availabilityContainer}>
            {availabilityOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.availabilityButton,
                  filters.availability === option.id && styles.availabilityButtonSelected
                ]}
                onPress={() => {
                  const newFilters = { ...filters, availability: option.id as any };
                  setFilters(newFilters);
                  saveFilters(newFilters);
                }}
              >
                <Text style={[
                  styles.availabilityButtonText,
                  filters.availability === option.id && styles.availabilityButtonTextSelected
                ]}>
                  {option.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

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

// Styles remain the same as before...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
  loadingText: { fontSize: 16, fontFamily: 'Inter-Regular', color: '#666', marginTop: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: '#FFFFFF' },
  headerTitle: { fontSize: 18, fontFamily: 'Inter-SemiBold', color: '#333' },
  clearText: { fontSize: 14, fontFamily: 'Inter-Medium', color: '#FF7A00' },
  content: { flex: 1, paddingHorizontal: 20 },
  searchSection: { marginTop: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontFamily: 'Inter-SemiBold', color: '#333', marginBottom: 12 },
  subsectionTitle: { fontSize: 14, fontFamily: 'Inter-Medium', color: '#666', marginBottom: 8 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: '#E0E0E0' },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 16, fontFamily: 'Inter-Regular', color: '#333' },
  savedSearchesSection: { marginTop: 16 },
  savedSearchItem: { backgroundColor: '#FFFFFF', borderRadius: 8, padding: 12, marginRight: 12, borderWidth: 1, borderColor: '#E0E0E0', minWidth: 120 },
  savedSearchText: { fontSize: 12, fontFamily: 'Inter-Medium', color: '#333' },
  savedSearchDate: { fontSize: 10, fontFamily: 'Inter-Regular', color: '#666', marginTop: 4 },
  section: { marginBottom: 24 },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  categoryCard: { width: '48%', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0' },
  categoryCardSelected: { borderColor: '#FF7A00', backgroundColor: '#FFF3E0' },
  categoryIcon: { fontSize: 24, marginBottom: 8 },
  categoryName: { fontSize: 12, fontFamily: 'Inter-Medium', color: '#333', textAlign: 'center' },
  categoryNameSelected: { color: '#FF7A00' },
  locationContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 12 },
  locationText: { flex: 1, fontSize: 14, fontFamily: 'Inter-Regular', color: '#333', marginLeft: 12 },
  locationButton: { backgroundColor: '#FF7A00', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, minWidth: 80, alignItems: 'center' },
  locationButtonText: { fontSize: 12, fontFamily: 'Inter-Medium', color: '#FFFFFF' },
  radiusContainer: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16 },
  radiusLabel: { fontSize: 14, fontFamily: 'Inter-Medium', color: '#333', marginBottom: 12 },
  radiusButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  radiusButton: { flex: 1, backgroundColor: '#F5F5F5', borderRadius: 8, paddingVertical: 8, alignItems: 'center', marginHorizontal: 4 },
  radiusButtonSelected: { backgroundColor: '#FF7A00' },
  radiusButtonText: { fontSize: 12, fontFamily: 'Inter-Medium', color: '#666' },
  radiusButtonTextSelected: { color: '#FFFFFF' },
  budgetContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  budgetInput: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: '#E0E0E0' },
  budgetInputText: { flex: 1, marginLeft: 8, fontSize: 14, fontFamily: 'Inter-Regular', color: '#333' },
  budgetSeparator: { fontSize: 14, fontFamily: 'Inter-Regular', color: '#666', marginHorizontal: 12 },
  languageContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  languageButton: { backgroundColor: '#FFFFFF', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: '#E0E0E0' },
  languageButtonSelected: { backgroundColor: '#FF7A00', borderColor: '#FF7A00' },
  languageButtonText: { fontSize: 12, fontFamily: 'Inter-Medium', color: '#666' },
  languageButtonTextSelected: { color: '#FFFFFF' },
  ratingContainer: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12 },
  ratingLabel: { fontSize: 14, fontFamily: 'Inter-Medium', color: '#333', marginBottom: 12 },
  ratingButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  ratingButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F5', borderRadius: 8, paddingVertical: 8, marginHorizontal: 2 },
  ratingButtonSelected: { backgroundColor: '#FF7A00' },
  ratingButtonText: { fontSize: 12, fontFamily: 'Inter-Medium', color: '#666', marginLeft: 4 },
  ratingButtonTextSelected: { color: '#FFFFFF' },
  trustContainer: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16 },
  trustLabel: { fontSize: 14, fontFamily: 'Inter-Medium', color: '#333', marginBottom: 12 },
  trustButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  trustButton: { flex: 1, backgroundColor: '#F5F5F5', borderRadius: 8, paddingVertical: 8, alignItems: 'center', marginHorizontal: 2 },
  trustButtonSelected: { backgroundColor: '#4CAF50' },
  trustButtonText: { fontSize: 12, fontFamily: 'Inter-Medium', color: '#666' },
  trustButtonTextSelected: { color: '#FFFFFF' },
  verificationContainer: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16 },
  verificationButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 16, marginBottom: 8 },
  verificationButtonSelected: { backgroundColor: '#4CAF50' },
  verificationButtonText: { fontSize: 12, fontFamily: 'Inter-Medium', color: '#666', marginLeft: 8 },
  verificationButtonTextSelected: { color: '#FFFFFF' },
  availabilityContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  availabilityButton: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginHorizontal: 4, borderWidth: 1, borderColor: '#E0E0E0' },
  availabilityButtonSelected: { backgroundColor: '#FF7A00', borderColor: '#FF7A00' },
  availabilityButtonText: { fontSize: 12, fontFamily: 'Inter-Medium', color: '#666' },
  availabilityButtonTextSelected: { color: '#FFFFFF' },
  searchButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FF7A00', borderRadius: 12, paddingVertical: 16, marginBottom: 40 },
  searchButtonText: { fontSize: 16, fontFamily: 'Inter-SemiBold', color: '#FFFFFF', marginLeft: 8 },
});