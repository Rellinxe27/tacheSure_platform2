// app/index.tsx
import { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, Users, CircleCheck as CheckCircle, ArrowRight } from 'lucide-react-native';
import { useAuth } from './contexts/AuthContext';

export default function WelcomeScreen() {
  const router = useRouter();
  const { session, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (session && profile) {
        // User is authenticated, navigate based on profile completion
        if (!profile.role) {
          router.replace('/onboarding');
        } else if (profile.role === 'provider' && !profile.is_verified) {
          router.replace('/verification');
        } else {
          router.replace('/(tabs)');
        }
      } else {
        // Auto-navigate to auth after 3 seconds for new users
        const timer = setTimeout(() => {
          router.push('/auth');
        }, 3000);

        return () => clearTimeout(timer);
      }
    }
  }, [session, profile, loading]);

  if (loading) {
    return (
      <LinearGradient
        colors={['#FF7A00', '#FF9500', '#FFB800']}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <Shield size={80} color="#FFFFFF" strokeWidth={1.5} />
          <Text style={styles.appName}>TâcheSûre</Text>
          <ActivityIndicator size="large" color="#FFFFFF" style={{ marginTop: 20 }} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </LinearGradient>
    );
  }

  // If user is already authenticated, this screen won't show due to useEffect navigation
  return (
    <LinearGradient
      colors={['#FF7A00', '#FF9500', '#FFB800']}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Shield size={80} color="#FFFFFF" strokeWidth={1.5} />
          <Text style={styles.appName}>TâcheSûre</Text>
          <Text style={styles.tagline}>Marketplace Sécurisé de Côte d'Ivoire</Text>
        </View>

        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Users size={24} color="#FFFFFF" />
            <Text style={styles.featureText}>Communauté Vérifiée</Text>
          </View>
          <View style={styles.featureItem}>
            <CheckCircle size={24} color="#FFFFFF" />
            <Text style={styles.featureText}>Paiements Sécurisés</Text>
          </View>
          <View style={styles.featureItem}>
            <Shield size={24} color="#FFFFFF" />
            <Text style={styles.featureText}>Protection Complète</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={() => router.push('/auth')}
        >
          <Text style={styles.getStartedText}>Commencer</Text>
          <ArrowRight size={20} color="#FF7A00" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  appName: {
    fontSize: 36,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginTop: 20,
  },
  tagline: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 8,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 8,
  },
  featuresContainer: {
    marginBottom: 80,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureText: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  getStartedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  getStartedText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FF7A00',
    marginRight: 8,
  },
});