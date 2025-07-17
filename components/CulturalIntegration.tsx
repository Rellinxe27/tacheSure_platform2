import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Users, MessageCircle, Award, Building, MapPin, Calendar } from 'lucide-react-native';

/**
 * CulturalIntegration component
 * 
 * This component implements cultural integration features specific to Côte d'Ivoire:
 * - Community integration (quartier verification, traditional authorities)
 * - Cultural communication patterns (age-based respect, traditional greetings)
 * - Social structure adaptation (traditional authority figures, community networks)
 */
export default function CulturalIntegration() {
  const [activeTab, setActiveTab] = useState<'community' | 'communication' | 'social'>('community');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Intégration Culturelle</Text>
        <Text style={styles.subtitle}>Adaptations locales pour la Côte d'Ivoire</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'community' && styles.activeTab]}
          onPress={() => setActiveTab('community')}
        >
          <Users size={20} color={activeTab === 'community' ? '#FF7A00' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'community' && styles.activeTabText]}>
            Communauté
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'communication' && styles.activeTab]}
          onPress={() => setActiveTab('communication')}
        >
          <MessageCircle size={20} color={activeTab === 'communication' ? '#FF7A00' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'communication' && styles.activeTabText]}>
            Communication
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'social' && styles.activeTab]}
          onPress={() => setActiveTab('social')}
        >
          <Building size={20} color={activeTab === 'social' ? '#FF7A00' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'social' && styles.activeTabText]}>
            Structure Sociale
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'community' && (
          <CommunityIntegration />
        )}

        {activeTab === 'communication' && (
          <CulturalCommunication />
        )}

        {activeTab === 'social' && (
          <SocialStructure />
        )}
      </ScrollView>
    </View>
  );
}

function CommunityIntegration() {
  return (
    <View>
      <Text style={styles.sectionTitle}>Intégration Communautaire</Text>
      
      <View style={styles.featureCard}>
        <View style={styles.featureHeader}>
          <Users size={24} color="#FF7A00" />
          <Text style={styles.featureTitle}>Vérification de Quartier</Text>
        </View>
        <Text style={styles.featureDescription}>
          Notre système de vérification par quartier permet aux utilisateurs d'être validés par les 
          chefs de quartier et les membres respectés de la communauté locale.
        </Text>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Demander une vérification</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.featureCard}>
        <View style={styles.featureHeader}>
          <Award size={24} color="#FF7A00" />
          <Text style={styles.featureTitle}>Validation par les Autorités Traditionnelles</Text>
        </View>
        <Text style={styles.featureDescription}>
          Obtenez l'approbation des chefs traditionnels, des chefs religieux et des anciens 
          pour renforcer votre crédibilité et votre confiance au sein de la communauté.
        </Text>
        <View style={styles.endorsementTypes}>
          <View style={styles.endorsementType}>
            <Text style={styles.endorsementTitle}>Chef de Village</Text>
            <Text style={styles.endorsementDescription}>Validation officielle par l'autorité du village</Text>
          </View>
          <View style={styles.endorsementType}>
            <Text style={styles.endorsementTitle}>Chef Religieux</Text>
            <Text style={styles.endorsementDescription}>Recommandation par un imam ou un pasteur</Text>
          </View>
          <View style={styles.endorsementType}>
            <Text style={styles.endorsementTitle}>Conseil des Anciens</Text>
            <Text style={styles.endorsementDescription}>Approbation par le conseil des sages</Text>
          </View>
        </View>
      </View>

      <View style={styles.featureCard}>
        <View style={styles.featureHeader}>
          <Building size={24} color="#FF7A00" />
          <Text style={styles.featureTitle}>Partenariats Locaux</Text>
        </View>
        <Text style={styles.featureDescription}>
          Nous collaborons avec les entreprises locales, les associations communautaires et les 
          institutions pour créer un réseau de confiance ancré dans les valeurs locales.
        </Text>
        <View style={styles.partnersList}>
          <View style={styles.partner}>
            <View style={styles.partnerIcon}>
              <Building size={20} color="#333" />
            </View>
            <Text style={styles.partnerName}>Association des Commerçants</Text>
          </View>
          <View style={styles.partner}>
            <View style={styles.partnerIcon}>
              <Building size={20} color="#333" />
            </View>
            <Text style={styles.partnerName}>Union des Artisans</Text>
          </View>
          <View style={styles.partner}>
            <View style={styles.partnerIcon}>
              <Building size={20} color="#333" />
            </View>
            <Text style={styles.partnerName}>Groupement des Femmes Entrepreneures</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function CulturalCommunication() {
  return (
    <View>
      <Text style={styles.sectionTitle}>Communication Culturelle</Text>
      
      <View style={styles.featureCard}>
        <View style={styles.featureHeader}>
          <MessageCircle size={24} color="#FF7A00" />
          <Text style={styles.featureTitle}>Hiérarchie de Respect</Text>
        </View>
        <Text style={styles.featureDescription}>
          Notre plateforme intègre les codes de respect basés sur l'âge et le statut social, 
          essentiels dans la culture ivoirienne. Les interactions sont adaptées pour refléter 
          ces normes culturelles.
        </Text>
        <View style={styles.communicationExample}>
          <Text style={styles.exampleTitle}>Exemple de formules de politesse:</Text>
          <View style={styles.exampleItem}>
            <Text style={styles.exampleLabel}>Pour les aînés:</Text>
            <Text style={styles.exampleText}>"Bonjour Papa/Maman [Nom]"</Text>
          </View>
          <View style={styles.exampleItem}>
            <Text style={styles.exampleLabel}>Pour les personnes respectées:</Text>
            <Text style={styles.exampleText}>"Mes respects, [Titre] [Nom]"</Text>
          </View>
        </View>
      </View>

      <View style={styles.featureCard}>
        <View style={styles.featureHeader}>
          <Calendar size={24} color="#FF7A00" />
          <Text style={styles.featureTitle}>Événements Culturels et Cérémonies</Text>
        </View>
        <Text style={styles.featureDescription}>
          TâcheSûre reconnaît l'importance des événements culturels et des cérémonies traditionnelles. 
          Notre plateforme s'adapte aux besoins spécifiques liés à ces occasions importantes.
        </Text>
        <View style={styles.eventsList}>
          <View style={styles.eventItem}>
            <Text style={styles.eventName}>Mariages Traditionnels</Text>
            <Text style={styles.eventDescription}>Services spécialisés pour les cérémonies de dot et mariages coutumiers</Text>
          </View>
          <View style={styles.eventItem}>
            <Text style={styles.eventName}>Funérailles</Text>
            <Text style={styles.eventDescription}>Organisation respectueuse des rites funéraires selon les traditions</Text>
          </View>
          <View style={styles.eventItem}>
            <Text style={styles.eventName}>Fêtes de Génération</Text>
            <Text style={styles.eventDescription}>Accompagnement pour les cérémonies d'initiation et de passage</Text>
          </View>
        </View>
      </View>

      <View style={styles.featureCard}>
        <View style={styles.featureHeader}>
          <MessageCircle size={24} color="#FF7A00" />
          <Text style={styles.featureTitle}>Support Multilingue</Text>
        </View>
        <Text style={styles.featureDescription}>
          Notre application prend en charge les langues locales principales de Côte d'Ivoire, 
          permettant aux utilisateurs de communiquer dans la langue avec laquelle ils sont le plus à l'aise.
        </Text>
        <View style={styles.languageSelector}>
          <TouchableOpacity style={[styles.languageOption, styles.activeLanguage]}>
            <Text style={styles.languageText}>Français</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.languageOption}>
            <Text style={styles.languageText}>Dioula</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.languageOption}>
            <Text style={styles.languageText}>Baoulé</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.languageOption}>
            <Text style={styles.languageText}>Bété</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function SocialStructure() {
  return (
    <View>
      <Text style={styles.sectionTitle}>Structure Sociale</Text>
      
      <View style={styles.featureCard}>
        <View style={styles.featureHeader}>
          <Users size={24} color="#FF7A00" />
          <Text style={styles.featureTitle}>Respect des Autorités Traditionnelles</Text>
        </View>
        <Text style={styles.featureDescription}>
          TâcheSûre reconnaît et respecte le rôle des autorités traditionnelles dans la société ivoirienne. 
          Notre plateforme intègre ces figures d'autorité dans le processus de vérification et de résolution des conflits.
        </Text>
        <View style={styles.authorityStructure}>
          <View style={styles.authorityLevel}>
            <Text style={styles.authorityTitle}>Chef Suprême</Text>
            <Text style={styles.authorityDescription}>Autorité traditionnelle au niveau régional</Text>
          </View>
          <View style={styles.authorityLevel}>
            <Text style={styles.authorityTitle}>Chef de Canton</Text>
            <Text style={styles.authorityDescription}>Responsable d'un groupe de villages</Text>
          </View>
          <View style={styles.authorityLevel}>
            <Text style={styles.authorityTitle}>Chef de Village</Text>
            <Text style={styles.authorityDescription}>Autorité locale au niveau du village</Text>
          </View>
          <View style={styles.authorityLevel}>
            <Text style={styles.authorityTitle}>Chef de Quartier</Text>
            <Text style={styles.authorityDescription}>Responsable d'un quartier urbain</Text>
          </View>
        </View>
      </View>

      <View style={styles.featureCard}>
        <View style={styles.featureHeader}>
          <Building size={24} color="#FF7A00" />
          <Text style={styles.featureTitle}>Réseaux Communautaires</Text>
        </View>
        <Text style={styles.featureDescription}>
          Nous facilitons l'intégration avec les réseaux communautaires existants, comme les associations 
          villageoises, les groupements de femmes et les coopératives, pour renforcer la confiance et la solidarité.
        </Text>
        <View style={styles.networkTypes}>
          <View style={styles.networkType}>
            <Text style={styles.networkTitle}>Associations Villageoises</Text>
            <Text style={styles.networkDescription}>Groupes d'entraide basés sur l'origine</Text>
          </View>
          <View style={styles.networkType}>
            <Text style={styles.networkTitle}>Tontines</Text>
            <Text style={styles.networkDescription}>Systèmes d'épargne et de crédit rotatifs</Text>
          </View>
          <View style={styles.networkType}>
            <Text style={styles.networkTitle}>Coopératives</Text>
            <Text style={styles.networkDescription}>Organisations économiques collectives</Text>
          </View>
        </View>
      </View>

      <View style={styles.featureCard}>
        <View style={styles.featureHeader}>
          <MapPin size={24} color="#FF7A00" />
          <Text style={styles.featureTitle}>Adaptation Géographique</Text>
        </View>
        <Text style={styles.featureDescription}>
          Notre plateforme s'adapte aux spécificités régionales de la Côte d'Ivoire, reconnaissant 
          les différences culturelles entre les régions du nord, du sud, de l'est et de l'ouest.
        </Text>
        <View style={styles.regionMap}>
          <Image 
            source={require('@/assets/images/cote-divoire-map.png')} 
            style={styles.mapImage}
            resizeMode="contain"
          />
          <View style={styles.regionList}>
            <View style={styles.regionItem}>
              <View style={[styles.regionDot, { backgroundColor: '#FF5722' }]} />
              <Text style={styles.regionName}>Nord: Culture Sénoufo et Malinké</Text>
            </View>
            <View style={styles.regionItem}>
              <View style={[styles.regionDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.regionName}>Sud: Culture Akan et Lagunaires</Text>
            </View>
            <View style={styles.regionItem}>
              <View style={[styles.regionDot, { backgroundColor: '#2196F3' }]} />
              <Text style={styles.regionName}>Ouest: Culture Krou et Dan</Text>
            </View>
            <View style={styles.regionItem}>
              <View style={[styles.regionDot, { backgroundColor: '#9C27B0' }]} />
              <Text style={styles.regionName}>Est: Culture Agni et Abron</Text>
            </View>
          </View>
        </View>
      </View>
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
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 4,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#FF7A00',
  },
  tabText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginTop: 4,
  },
  activeTabText: {
    color: '#FF7A00',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginLeft: 12,
  },
  featureDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: '#FF7A00',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  endorsementTypes: {
    marginTop: 12,
  },
  endorsementType: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  endorsementTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  endorsementDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  partnersList: {
    marginTop: 12,
  },
  partner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  partnerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  partnerName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333',
  },
  communicationExample: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  exampleTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 8,
  },
  exampleItem: {
    marginBottom: 8,
  },
  exampleLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginBottom: 2,
  },
  exampleText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333',
    fontStyle: 'italic',
  },
  eventsList: {
    marginTop: 12,
  },
  eventItem: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  eventName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  languageSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  languageOption: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  activeLanguage: {
    backgroundColor: '#FF7A00',
  },
  languageText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333',
  },
  authorityStructure: {
    marginTop: 12,
  },
  authorityLevel: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  authorityTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  authorityDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  networkTypes: {
    marginTop: 12,
  },
  networkType: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  networkTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  networkDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  regionMap: {
    marginTop: 12,
    alignItems: 'center',
  },
  mapImage: {
    width: '100%',
    height: 200,
    marginBottom: 16,
  },
  regionList: {
    width: '100%',
  },
  regionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  regionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  regionName: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
});