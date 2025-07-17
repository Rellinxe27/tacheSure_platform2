// app/(tabs)/profile.tsx (Updated with help support and improved UI)
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { User, Shield, Star, Settings, CircleHelp as HelpCircle, LogOut, Phone, Mail, MapPin, Calendar, Edit3, Award, TrendingUp } from 'lucide-react-native';
import { useAuth } from '@/app/contexts/AuthContext';
import RoleBasedAccess from '@/components/RoleBasedAccess';
import { useEffect, useState } from 'react';

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, signOut, user } = useAuth();
  const [stats, setStats] = useState({
    completedTasks: 0,
    rating: 0,
    reviews: 0,
    earnings: 0,
  });

  useEffect(() => {
    // TODO: Fetch user statistics from Supabase
    // For now, using mock data
    setStats({
      completedTasks: 23,
      rating: 4.8,
      reviews: 45,
      earnings: 125000,
    });
  }, [profile]);

  const menuItems = [
    {
      id: 'edit_profile',
      title: 'Modifier le profil',
      icon: Edit3,
      color: '#FF7A00',
      roles: ['client', 'provider', 'admin'] as const
    },
    {
      id: 'provider_dashboard',
      title: 'Tableau de bord prestataire',
      icon: TrendingUp,
      color: '#FF7A00',
      roles: ['provider'] as const
    },
    {
      id: 'verification',
      title: 'Niveau de vérification',
      icon: Shield,
      color: '#4CAF50',
      roles: ['client', 'provider'] as const
    },
    {
      id: 'cultural_integration',
      title: 'Intégration Culturelle',
      icon: MapPin,
      color: '#FF9800',
      roles: ['client', 'provider'] as const
    },
    {
      id: 'achievements',
      title: 'Récompenses et badges',
      icon: Award,
      color: '#9C27B0',
      roles: ['provider'] as const
    },
    {
      id: 'settings',
      title: 'Paramètres',
      icon: Settings,
      color: '#666',
      roles: ['client', 'provider', 'admin'] as const
    },
    {
      id: 'help',
      title: 'Aide et support',
      icon: HelpCircle,
      color: '#2196F3',
      roles: ['client', 'provider', 'admin'] as const
    },
    {
      id: 'logout',
      title: 'Déconnexion',
      icon: LogOut,
      color: '#FF5722',
      roles: ['client', 'provider', 'admin'] as const
    },
  ];

  const handleMenuPress = (itemId: string) => {
    switch (itemId) {
      case 'edit_profile':
        router.push('/personal-info');
        break;
      case 'provider_dashboard':
        router.push('/provider-dashboard');
        break;
      case 'verification':
        router.push('/verification-status');
        break;
      case 'cultural_integration':
        router.push('/cultural-integration');
        break;
      case 'achievements':
        Alert.alert('Récompenses', 'Section en cours de développement');
        break;
      case 'settings':
        router.push('/provider-settings');
        break;
      case 'help':
        router.push('/help-support');
        break;
      case 'logout':
        Alert.alert(
          'Déconnexion',
          'Êtes-vous sûr de vouloir vous déconnecter?',
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Déconnexion', style: 'destructive', onPress: signOut },
          ]
        );
        break;
      default:
        Alert.alert('Information', `Fonction ${itemId} en cours de développement`);
    }
  };

  const getVerificationLevelText = (level: string) => {
    switch (level) {
      case 'community': return 'Vérifié par la communauté';
      case 'enhanced': return 'Vérification renforcée';
      case 'government': return 'Vérifié par l\'État';
      default: return 'Vérification basique';
    }
  };

  const getVerificationLevelColor = (level: string) => {
    switch (level) {
      case 'community': return '#4CAF50';
      case 'enhanced': return '#FF9800';
      case 'government': return '#2196F3';
      default: return '#9E9E9E';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  if (!profile) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement du profil...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mon profil</Text>
        <TouchableOpacity onPress={() => router.push('/personal-info')}>
          <Edit3 size={24} color="#FF7A00" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {profile.avatar_url ? (
                <Text>IMG</Text>
              ) : (
                <User size={40} color="#FFFFFF" />
              )}
            </View>
            <View style={styles.profileInfo}>
              <View style={styles.nameContainer}>
                <Text style={styles.profileName}>{profile.full_name || 'Utilisateur'}</Text>
                {profile.is_verified && (
                  <Shield size={18} color="#4CAF50" />
                )}
              </View>
              <View style={[styles.trustBadge, { backgroundColor: getVerificationLevelColor(profile.verification_level) }]}>
                <Text style={styles.trustLevel}>
                  {getVerificationLevelText(profile.verification_level)}
                </Text>
              </View>
              <Text style={styles.roleText}>
                {profile.role === 'client' ? 'Client' :
                  profile.role === 'provider' ? 'Prestataire de services' :
                    profile.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
              </Text>
            </View>
          </View>

          <RoleBasedAccess allowedRoles={['provider']}>
            <View style={styles.profileStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.rating}</Text>
                <View style={styles.statLabel}>
                  <Star size={12} color="#FFD700" fill="#FFD700" />
                  <Text style={styles.statText}>Note</Text>
                </View>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.completedTasks}</Text>
                <Text style={styles.statText}>Tâches</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{profile.trust_score || 0}%</Text>
                <Text style={styles.statText}>Confiance</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.earnings > 0 ? '125K' : '0'}</Text>
                <Text style={styles.statText}>Revenus</Text>
              </View>
            </View>
          </RoleBasedAccess>

          <View style={styles.profileDetails}>
            <View style={styles.detailItem}>
              <Mail size={16} color="#666" />
              <Text style={styles.detailText}>{profile.email}</Text>
            </View>
            {profile.phone && (
              <View style={styles.detailItem}>
                <Phone size={16} color="#666" />
                <Text style={styles.detailText}>{profile.phone}</Text>
              </View>
            )}
            <View style={styles.detailItem}>
              <MapPin size={16} color="#666" />
              <Text style={styles.detailText}>{profile.nationality || 'Côte d\'Ivoire'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Calendar size={16} color="#666" />
              <Text style={styles.detailText}>
                Membre depuis {new Date(profile.created_at || '').toLocaleDateString('fr-FR', {
                month: 'long',
                year: 'numeric'
              })}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions for Providers */}
        <RoleBasedAccess allowedRoles={['provider']}>
          <View style={styles.quickActionsCard}>
            <Text style={styles.quickActionsTitle}>Actions rapides</Text>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity
                style={styles.quickActionItem}
                onPress={() => router.push('/service-management')}
              >
                <Settings size={20} color="#FF7A00" />
                <Text style={styles.quickActionText}>Services</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickActionItem}
                onPress={() => router.push('/availability-calendar')}
              >
                <Calendar size={20} color="#4CAF50" />
                <Text style={styles.quickActionText}>Planning</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickActionItem}
                onPress={() => router.push('/earnings')}
              >
                <TrendingUp size={20} color="#2196F3" />
                <Text style={styles.quickActionText}>Revenus</Text>
              </TouchableOpacity>
            </View>
          </View>
        </RoleBasedAccess>

        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <RoleBasedAccess key={item.id} allowedRoles={item.roles}>
              <TouchableOpacity
                style={[
                  styles.menuItem,
                  item.id === 'logout' && styles.logoutItem
                ]}
                onPress={() => handleMenuPress(item.id)}
              >
                <View style={styles.menuItemContent}>
                  <View style={[styles.menuIconContainer, { backgroundColor: `${item.color}15` }]}>
                    <item.icon size={20} color={item.color} />
                  </View>
                  <Text style={[
                    styles.menuItemText,
                    item.id === 'logout' && styles.logoutText
                  ]}>
                    {item.title}
                  </Text>
                </View>
                <Text style={[styles.menuArrow, item.id === 'logout' && styles.logoutArrow]}>→</Text>
              </TouchableOpacity>
            </RoleBasedAccess>
          ))}
        </View>

        <View style={styles.safetySection}>
          <View style={styles.safetyHeader}>
            <Shield size={24} color="#4CAF50" />
            <Text style={styles.safetyTitle}>Sécurité garantie</Text>
          </View>
          <Text style={styles.safetyText}>
            Votre profil est {profile.is_verified ? 'vérifié et ' : ''}sécurisé.
            {profile.role === 'provider' && ' Continuez à maintenir un comportement exemplaire pour préserver votre statut de confiance.'}
          </Text>
          <TouchableOpacity
            style={styles.safetyButton}
            onPress={() => router.push('/help-support')}
          >
            <Text style={styles.safetyButtonText}>Centre d'aide</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
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
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  profileInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  profileName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginRight: 8,
  },
  trustBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  trustLevel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  roleText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
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
    fontSize: 20,
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
  quickActionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickActionItem: {
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    minWidth: 80,
  },
  quickActionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginTop: 8,
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#333',
  },
  logoutText: {
    color: '#FF5722',
  },
  menuArrow: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#999',
  },
  logoutArrow: {
    color: '#FF5722',
  },
  safetySection: {
    backgroundColor: '#E8F5E8',
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
    marginBottom: 16,
  },
  safetyButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  safetyButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});