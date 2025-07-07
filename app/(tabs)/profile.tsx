import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { User, Shield, Star, Settings, CircleHelp as HelpCircle, LogOut, Phone, Mail, MapPin, Calendar } from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();

  const userProfile = {
    name: 'Koffi Adjoua',
    email: 'koffi.adjoua@email.com',
    phone: '+225 07 12 34 56 78',
    location: 'Abidjan, Côte d\'Ivoire',
    joinDate: 'Membre depuis Mars 2024',
    verified: true,
    rating: 4.8,
    completedTasks: 23,
    trustLevel: 'Vérifié',
  };

  const menuItems = [
    { id: 'provider_dashboard', title: 'Tableau de bord prestataire', icon: Settings, color: '#FF7A00' },
    { id: 'settings', title: 'Paramètres', icon: Settings, color: '#666' },
    { id: 'verification', title: 'Niveau de vérification', icon: Shield, color: '#4CAF50' },
    { id: 'help', title: 'Aide et support', icon: HelpCircle, color: '#2196F3' },
    { id: 'logout', title: 'Déconnexion', icon: LogOut, color: '#FF5722' },
  ];

  const handleMenuPress = (itemId: string) => {
    switch (itemId) {
      case 'provider_dashboard':
        router.push('/provider-dashboard');
        break;
      case 'logout':
        Alert.alert(
          'Déconnexion',
          'Êtes-vous sûr de vouloir vous déconnecter?',
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Déconnexion', style: 'destructive', onPress: () => {} },
          ]
        );
        break;
      default:
        Alert.alert('Information', `Fonction ${itemId} en cours de développement`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mon profil</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <User size={40} color="#FFFFFF" />
            </View>
            <View style={styles.profileInfo}>
              <View style={styles.nameContainer}>
                <Text style={styles.profileName}>{userProfile.name}</Text>
                {userProfile.verified && (
                  <Shield size={18} color="#4CAF50" />
                )}
              </View>
              <Text style={styles.trustLevel}>{userProfile.trustLevel}</Text>
            </View>
          </View>

          <View style={styles.profileStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userProfile.rating}</Text>
              <View style={styles.statLabel}>
                <Star size={12} color="#FFD700" fill="#FFD700" />
                <Text style={styles.statText}>Note</Text>
              </View>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userProfile.completedTasks}</Text>
              <Text style={styles.statText}>Tâches</Text>
            </View>
          </View>

          <View style={styles.profileDetails}>
            <View style={styles.detailItem}>
              <Mail size={16} color="#666" />
              <Text style={styles.detailText}>{userProfile.email}</Text>
            </View>
            <View style={styles.detailItem}>
              <Phone size={16} color="#666" />
              <Text style={styles.detailText}>{userProfile.phone}</Text>
            </View>
            <View style={styles.detailItem}>
              <MapPin size={16} color="#666" />
              <Text style={styles.detailText}>{userProfile.location}</Text>
            </View>
            <View style={styles.detailItem}>
              <Calendar size={16} color="#666" />
              <Text style={styles.detailText}>{userProfile.joinDate}</Text>
            </View>
          </View>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => handleMenuPress(item.id)}
            >
              <View style={styles.menuItemContent}>
                <item.icon size={20} color={item.color} />
                <Text style={styles.menuItemText}>{item.title}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.safetySection}>
          <View style={styles.safetyHeader}>
            <Shield size={24} color="#4CAF50" />
            <Text style={styles.safetyTitle}>Sécurité garantie</Text>
          </View>
          <Text style={styles.safetyText}>
            Votre profil est vérifié et sécurisé. Continuez à maintenir un comportement exemplaire pour préserver votre statut de confiance.
          </Text>
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
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF7A00',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  profileName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginRight: 8,
  },
  trustLevel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#4CAF50',
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginLeft: 4,
  },
  profileDetails: {
    marginTop: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginLeft: 12,
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  menuItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#333',
    marginLeft: 16,
  },
  safetySection: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 40,
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  safetyTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginLeft: 8,
  },
  safetyText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 20,
  },
});