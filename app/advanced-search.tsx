import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search, Filter, MapPin, DollarSign, Clock, Star, Shield } from 'lucide-react-native';
import AdvancedMatching from '@/components/AdvancedMatching';

export default function AdvancedSearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [filters, setFilters] = useState({
    location: { lat: 5.3600, lng: -4.0083 }, // Abidjan coordinates
    radius: 10,
    budget: { min: 5000, max: 50000 },
    urgency: 'normal' as 'low' | 'normal' | 'high',
    skills: [] as string[],
    language: 'Français',
    timePreference: 'anytime' as 'morning' | 'afternoon' | 'evening' | 'anytime',
    minRating: 4.0,
    minTrustScore: 70,
    verificationLevel: 'any' as 'any' | 'basic' | 'government' | 'enhanced',
    availability: 'available' as 'any' | 'available' | 'busy'
  });

  const categories = [
    { id: 'cleaning', name: 'Nettoyage', skills: ['Ménage', 'Nettoyage', 'Repassage'] },
    { id: 'repair', name: 'Réparation', skills: ['Plomberie', 'Électricité', 'Menuiserie'] },
    { id: 'delivery', name: 'Livraison', skills: ['Transport', 'Livraison', 'Déménagement'] },
    { id: 'tutoring', name: 'Tutorat', skills: ['Mathématiques', 'Français', 'Anglais'] },
    { id: 'cooking', name: 'Cuisine', skills: ['Cuisine', 'Pâtisserie', 'Traiteur'] },
    { id: 'gardening', name: 'Jardinage', skills: ['Jardinage', 'Élagage', 'Entretien'] }
  ];

  const languages = ['Français', 'Anglais', 'Dioula', 'Baoulé', 'Malinké'];
  const urgencyLevels = [
    { id: 'low', name: 'Pas urgent', color: '#4CAF50' },
    { id: 'normal', name: 'Normal', color: '#FF9800' },
    { id: 'high', name: 'Urgent', color: '#FF5722' }
  ];

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un terme de recherche');
      return;
    }
    
    // Add search query to skills
    const searchSkills = searchQuery.split(' ').filter(term => term.length > 2);
    setFilters(prev => ({ ...prev, skills: [...prev.skills, ...searchSkills] }));
    setShowResults(true);
  };

  const handleProviderSelect = (provider: any) => {
    Alert.alert('Prestataire sélectionné', `Vous avez sélectionné ${provider.name}`);
    router.back();
  };

  const toggleSkill = (skill: string) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
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
          onProviderSelect={handleProviderSelect}
        />
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
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Catégories</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryCard}
                onPress={() => setFilters(prev => ({ ...prev, skills: category.skills }))}
              >
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compétences spécifiques</Text>
          <View style={styles.skillsContainer}>
            {categories.flatMap(cat => cat.skills).map((skill, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.skillTag,
                  filters.skills.includes(skill) && styles.skillTagSelected
                ]}
                onPress={() => toggleSkill(skill)}
              >
                <Text style={[
                  styles.skillTagText,
                  filters.skills.includes(skill) && styles.skillTagTextSelected
                ]}>
                  {skill}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Localisation et distance</Text>
          <View style={styles.locationContainer}>
            <MapPin size={20} color="#666" />
            <Text style={styles.locationText}>Abidjan, Côte d'Ivoire</Text>
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
                  onPress={() => setFilters(prev => ({ ...prev, radius }))}
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Budget</Text>
          <View style={styles.budgetContainer}>
            <View style={styles.budgetInput}>
              <DollarSign size={16} color="#666" />
              <TextInput
                style={styles.budgetInputText}
                placeholder="Min"
                value={filters.budget.min.toString()}
                onChangeText={(text) => setFilters(prev => ({
                  ...prev,
                  budget: { ...prev.budget, min: parseInt(text) || 0 }
                }))}
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
                onChangeText={(text) => setFilters(prev => ({
                  ...prev,
                  budget: { ...prev.budget, max: parseInt(text) || 0 }
                }))}
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
                  filters.urgency === level.id && styles.urgencyButtonSelected,
                  { borderColor: level.color }
                ]}
                onPress={() => setFilters(prev => ({ ...prev, urgency: level.id as any }))}
              >
                <Clock size={16} color={level.color} />
                <Text style={[
                  styles.urgencyButtonText,
                  { color: level.color },
                  filters.urgency === level.id && styles.urgencyButtonTextSelected
                ]}>
                  {level.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Langue de communication</Text>
          <View style={styles.languageContainer}>
            {languages.map((language) => (
              <TouchableOpacity
                key={language}
                style={[
                  styles.languageButton,
                  filters.language === language && styles.languageButtonSelected
                ]}
                onPress={() => setFilters(prev => ({ ...prev, language }))}
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Critères de qualité</Text>
          
          <View style={styles.qualityItem}>
            <Star size={16} color="#FFD700" />
            <Text style={styles.qualityLabel}>Note minimale: {filters.minRating}/5</Text>
          </View>
          
          <View style={styles.qualityItem}>
            <Shield size={16} color="#4CAF50" />
            <Text style={styles.qualityLabel}>Score de confiance min: {filters.minTrustScore}%</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Search size={20} color="#FFFFFF" />
          <Text style={styles.searchButtonText}>Rechercher des prestataires</Text>
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
  categoryName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333',
    textAlign: 'center',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillTag: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  skillTagSelected: {
    backgroundColor: '#FF7A00',
    borderColor: '#FF7A00',
  },
  skillTagText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  skillTagTextSelected: {
    color: '#FFFFFF',
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
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333',
    marginLeft: 12,
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
  urgencyButtonSelected: {
    backgroundColor: '#FFF3E0',
  },
  urgencyButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
  },
  urgencyButtonTextSelected: {
    fontFamily: 'Inter-SemiBold',
  },
  languageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  languageButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  languageButtonSelected: {
    backgroundColor: '#FF7A00',
    borderColor: '#FF7A00',
  },
  languageButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  languageButtonTextSelected: {
    color: '#FFFFFF',
  },
  qualityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  qualityLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333',
    marginLeft: 12,
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