import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, Filter, MapPin, Star, Shield, Clock, TrendingUp, Zap } from 'lucide-react-native';

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Tous', count: 1247 },
    { id: 'cleaning', name: 'Nettoyage', count: 234 },
    { id: 'repair', name: 'Réparation', count: 189 },
    { id: 'delivery', name: 'Livraison', count: 156 },
    { id: 'tutoring', name: 'Tutorat', count: 98 },
    { id: 'cooking', name: 'Cuisine', count: 87 },
    { id: 'gardening', name: 'Jardinage', count: 76 }
  ];

  const trendingSearches = [
    'Plombier urgence',
    'Nettoyage bureau',
    'Livraison express',
    'Cours particuliers',
    'Réparation électrique'
  ];

  const quickFilters = [
    { id: 'nearby', name: 'À proximité', icon: MapPin },
    { id: 'top_rated', name: 'Mieux notés', icon: Star },
    { id: 'verified', name: 'Vérifiés', icon: Shield },
    { id: 'available', name: 'Disponibles', icon: Clock }
  ];

  const results = [
    {
      id: 1,
      name: 'Kouadio Jean',
      service: 'Plomberie et réparation',
      rating: 4.8,
      reviews: 45,
      location: 'Cocody',
      price: '15,000 FCFA/heure',
      verified: true,
      available: true,
      distance: '2.5 km',
      trustScore: 92,
      responseTime: '15 min',
      completedTasks: 156
    },
    {
      id: 2,
      name: 'Aminata Traoré',
      service: 'Nettoyage résidentiel',
      rating: 4.9,
      reviews: 67,
      location: 'Plateau',
      price: '12,000 FCFA/heure',
      verified: true,
      available: true,
      distance: '1.8 km',
      trustScore: 95,
      responseTime: '8 min',
      completedTasks: 203
    },
    {
      id: 3,
      name: 'Bakary Koné',
      service: 'Livraison express',
      rating: 4.7,
      reviews: 32,
      location: 'Treichville',
      price: '8,000 FCFA/course',
      verified: true,
      available: false,
      distance: '3.2 km',
      trustScore: 87,
      responseTime: '25 min',
      completedTasks: 89
    },
  ];

  const handleAdvancedSearch = () => {
    router.push('/advanced-search');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recherche</Text>
        <View style={styles.searchContainer}>
          <Search size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Que recherchez-vous?"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#666"
          />
          <TouchableOpacity style={styles.filterButton} onPress={handleAdvancedSearch}>
            <Filter size={20} color="#FF7A00" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {!searchQuery && (
          <>
            <View style={styles.trendingSection}>
              <View style={styles.sectionHeader}>
                <TrendingUp size={20} color="#FF7A00" />
                <Text style={styles.sectionTitle}>Recherches populaires</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {trendingSearches.map((search, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.trendingItem}
                    onPress={() => setSearchQuery(search)}
                  >
                    <Zap size={14} color="#FF7A00" />
                    <Text style={styles.trendingText}>{search}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.quickFiltersSection}>
              <Text style={styles.sectionTitle}>Filtres rapides</Text>
              <View style={styles.quickFiltersGrid}>
                {quickFilters.map((filter) => (
                  <TouchableOpacity key={filter.id} style={styles.quickFilterCard}>
                    <filter.icon size={24} color="#FF7A00" />
                    <Text style={styles.quickFilterText}>{filter.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}

        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>Catégories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.selectedCategoryButton,
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    selectedCategory === category.id && styles.selectedCategoryButtonText,
                  ]}
                >
                  {category.name}
                </Text>
                <Text style={[
                  styles.categoryCount,
                  selectedCategory === category.id && styles.selectedCategoryCount,
                ]}>
                  {category.count}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.resultsContainer}>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>
              {results.length} prestataires trouvés
            </Text>
            <TouchableOpacity onPress={handleAdvancedSearch}>
              <Text style={styles.advancedSearchLink}>Recherche avancée</Text>
            </TouchableOpacity>
          </View>
          
          {results.map((provider) => (
            <TouchableOpacity 
              key={provider.id} 
              style={styles.resultCard}
              onPress={() => router.push('/provider-profile')}
            >
              <View style={styles.resultHeader}>
                <View style={styles.providerInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.providerName}>{provider.name}</Text>
                    {provider.verified && (
                      <Shield size={16} color="#4CAF50" />
                    )}
                  </View>
                  <Text style={styles.providerService}>{provider.service}</Text>
                  <View style={styles.providerStats}>
                    <View style={styles.statItem}>
                      <Star size={12} color="#FFD700" fill="#FFD700" />
                      <Text style={styles.statText}>{provider.rating}</Text>
                      <Text style={styles.statSubtext}>({provider.reviews})</Text>
                    </View>
                    <View style={styles.statItem}>
                      <MapPin size={12} color="#666" />
                      <Text style={styles.statText}>{provider.location}</Text>
                      <Text style={styles.statSubtext}>• {provider.distance}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>{provider.price}</Text>
                  <View style={styles.availability}>
                    <View
                      style={[
                        styles.availabilityDot,
                        { backgroundColor: provider.available ? '#4CAF50' : '#FF5722' },
                      ]}
                    />
                    <Text style={styles.availabilityText}>
                      {provider.available ? 'Disponible' : 'Occupé'}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.additionalInfo}>
                <View style={styles.infoItem}>
                  <Shield size={12} color="#4CAF50" />
                  <Text style={styles.infoText}>Confiance: {provider.trustScore}%</Text>
                </View>
                <View style={styles.infoItem}>
                  <Clock size={12} color="#666" />
                  <Text style={styles.infoText}>Répond en {provider.responseTime}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoText}>{provider.completedTasks} tâches</Text>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.contactButton}>
                  <Text style={styles.contactButtonText}>Contacter</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.viewButton}>
                  <Text style={styles.viewButtonText}>Voir profil</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
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
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
  filterButton: {
    marginLeft: 12,
  },
  content: {
    flex: 1,
  },
  trendingSection: {
    paddingVertical: 20,
    paddingLeft: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginLeft: 8,
  },
  trendingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 12,
  },
  trendingText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FF7A00',
    marginLeft: 6,
  },
  quickFiltersSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  quickFiltersGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickFilterCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  quickFilterText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  categoriesContainer: {
    paddingVertical: 20,
    paddingLeft: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  selectedCategoryButton: {
    backgroundColor: '#FF7A00',
    borderColor: '#FF7A00',
  },
  categoryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  selectedCategoryButtonText: {
    color: '#FFFFFF',
  },
  categoryCount: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 2,
  },
  selectedCategoryCount: {
    color: '#FFFFFF',
  },
  resultsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  resultsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  advancedSearchLink: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FF7A00',
  },
  resultCard: {
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
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  providerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  providerName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginRight: 8,
  },
  providerService: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 8,
  },
  providerStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#333',
    marginLeft: 4,
  },
  statSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginLeft: 4,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#FF7A00',
    marginBottom: 4,
  },
  availability: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  availabilityText: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  additionalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contactButton: {
    flex: 1,
    backgroundColor: '#FF7A00',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  contactButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  viewButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  viewButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#666',
  },
});