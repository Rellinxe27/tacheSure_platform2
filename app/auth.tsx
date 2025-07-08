// app/auth.tsx
import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Phone, Lock, User, Mail, ArrowRight } from 'lucide-react-native';
import { useAuth } from './contexts/AuthContext';
import { useWhatsAppBottomNotification } from '@/components/SnackBar';

export default function AuthScreen() {
  const router = useRouter();
  const { signIn, signUp, loading } = useAuth();
  const { showNotification, NotificationComponent } = useWhatsAppBottomNotification();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    name: '',
    email: '',
  });

  const handleAuth = async () => {
    if (!formData.email || !formData.password) {
      showNotification('Champs obligatoires manquants', 'error');
      return;
    }

    if (!isLogin && !formData.name) {
      showNotification('Veuillez entrer votre nom', 'error');
      return;
    }

    try {
      let result;

      if (isLogin) {
        result = await signIn(formData.email, formData.password);
      } else {
        result = await signUp(formData.email, formData.password, {
          full_name: formData.name,
          phone: formData.phone || null,
          role: 'client',
        });
      }

      if (result.error) {
        showNotification(result.error, 'error');
      } else {
        if (isLogin) {
          showNotification('Connexion réussie', 'success');
        } else {
          showNotification('Compte créé avec succès', 'success');
          setTimeout(() => {
            router.push('/onboarding');
          }, 1500);
        }
      }
    } catch (error) {
      showNotification('Erreur inattendue', 'error');
    }
  };

  return (
    <>
      <LinearGradient
        colors={['#FF7A00', '#FF9500']}
        style={styles.container}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {isLogin ? 'Connexion' : 'Créer un compte'}
            </Text>
            <Text style={styles.subtitle}>
              {isLogin
                ? 'Connectez-vous à votre compte TâcheSûre'
                : 'Rejoignez la communauté TâcheSûre'
              }
            </Text>
          </View>

          <View style={styles.form}>
            {!isLogin && (
              <View style={styles.inputContainer}>
                <User size={20} color="#666" />
                <TextInput
                  style={styles.input}
                  placeholder="Nom complet"
                  value={formData.name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                  placeholderTextColor="#666"
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Mail size={20} color="#666" />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={formData.email}
                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#666"
              />
            </View>

            {!isLogin && (
              <View style={styles.inputContainer}>
                <Phone size={20} color="#666" />
                <TextInput
                  style={styles.input}
                  placeholder="Numéro de téléphone (optionnel)"
                  value={formData.phone}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                  keyboardType="phone-pad"
                  placeholderTextColor="#666"
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Lock size={20} color="#666" />
              <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                value={formData.password}
                onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
                secureTextEntry
                placeholderTextColor="#666"
              />
            </View>

            <TouchableOpacity
              style={[styles.authButton, loading && styles.disabledButton]}
              onPress={handleAuth}
              disabled={loading}
            >
              <Text style={styles.authButtonText}>
                {loading ? 'Chargement...' : isLogin ? 'Se connecter' : 'Créer le compte'}
              </Text>
              {!loading && <ArrowRight size={20} color="#FFFFFF" />}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setIsLogin(!isLogin)}
            >
              <Text style={styles.switchText}>
                {isLogin
                  ? "Pas de compte? Créer un compte"
                  : "Déjà un compte? Se connecter"
                }
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <NotificationComponent />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 8,
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF7A00',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  authButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  switchButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  switchText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
});