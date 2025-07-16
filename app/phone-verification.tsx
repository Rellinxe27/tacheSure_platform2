import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Phone, Shield, CheckCircle, RefreshCw } from 'lucide-react-native';
import { useVerification } from '@/hooks/useVerification';
import { useAuth } from '@/app/contexts/AuthContext';

export default function PhoneVerificationScreen() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const { requestPhoneVerification } = useVerification();

  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);

  const otpRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (step === 'otp') {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown, step]);

  const formatPhoneNumber = (text: string) => {
    // Remove all non-numeric characters
    const cleaned = text.replace(/\D/g, '');

    // Format as XX XX XX XX XX (10 digits)
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 4) return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4)}`;
    if (cleaned.length <= 8) return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6)}`;
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}`;
  };

  const validatePhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\s/g, '');
    return cleaned.length === 10 && cleaned.match(/^[0-9]+$/);
  };

  const sendOTP = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      Alert.alert('Erreur', 'Format de numéro invalide. Utilisez le format: XX XX XX XX XX (10 chiffres)');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate OTP sending
      await new Promise(resolve => setTimeout(resolve, 2000));

      setStep('otp');
      setCountdown(60); // 60 seconds countdown
      setCanResend(false);
      Alert.alert('OTP envoyé', `Un code de vérification a été envoyé au +225 ${phoneNumber}`);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'envoyer le code. Vérifiez votre numéro.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple characters

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all digits are entered
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      verifyOTP(newOtp.join(''));
    }
  };

  const handleOtpKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const verifyOTP = async (otpCode: string) => {
    setIsLoading(true);

    try {
      // Simulate OTP verification
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock validation - in real app, verify with backend
      const isValid = otpCode === '123456' || Math.random() > 0.2; // 80% success rate for demo

      if (isValid) {
        // Update user profile with verified phone
        const fullPhoneNumber = `+225${phoneNumber.replace(/\s/g, '')}`;
        await updateProfile({ phone: fullPhoneNumber });

        setStep('success');
      } else {
        Alert.alert('Code incorrect', 'Le code OTP saisi est incorrect. Veuillez réessayer.');
        setOtp(['', '', '', '', '', '']);
        otpRefs.current[0]?.focus();
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la vérification du code');
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = () => {
    if (!canResend) return;

    setCountdown(60);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);

    Alert.alert('Code renvoyé', `Un nouveau code a été envoyé au +225 ${phoneNumber}`);
  };

  if (step === 'success') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vérification réussie</Text>
        </View>

        <View style={styles.successContainer}>
          <CheckCircle size={80} color="#4CAF50" />
          <Text style={styles.successTitle}>Téléphone vérifié!</Text>
          <Text style={styles.successText}>
            Votre numéro +225 {phoneNumber} a été vérifié avec succès.
          </Text>

          <View style={styles.benefitsCard}>
            <Text style={styles.benefitsTitle}>Avantages obtenus:</Text>
            <View style={styles.benefitItem}>
              <CheckCircle size={16} color="#4CAF50" />
              <Text style={styles.benefitText}>+20 points de confiance</Text>
            </View>
            <View style={styles.benefitItem}>
              <Shield size={16} color="#4CAF50" />
              <Text style={styles.benefitText}>Badge "Téléphone Vérifié"</Text>
            </View>
            <View style={styles.benefitItem}>
              <Phone size={16} color="#4CAF50" />
              <Text style={styles.benefitText}>Communication sécurisée</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.doneButton} onPress={() => router.back()}>
            <Text style={styles.doneButtonText}>Terminé</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {step === 'phone' ? 'Vérification téléphone' : 'Code de vérification'}
        </Text>
      </View>

      <View style={styles.content}>
        {step === 'phone' && (
          <>
            <View style={styles.iconContainer}>
              <Phone size={60} color="#FF7A00" />
            </View>

            <Text style={styles.title}>Vérifiez votre numéro</Text>
            <Text style={styles.subtitle}>
              Nous allons envoyer un code de vérification par SMS à votre numéro de téléphone.
            </Text>

            <View style={styles.phoneInputContainer}>
              <View style={styles.countryCode}>
                <Text style={styles.countryCodeText}>🇨🇮 +225</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="XX XX XX XX XX"
                value={phoneNumber}
                onChangeText={(text) => setPhoneNumber(formatPhoneNumber(text))}
                keyboardType="numeric"
                maxLength={14} // Updated to accommodate 10 digits + 4 spaces
                placeholderTextColor="#666"
              />
            </View>

            <TouchableOpacity
              style={[styles.sendButton, isLoading && styles.buttonDisabled]}
              onPress={sendOTP}
              disabled={isLoading || !validatePhoneNumber(phoneNumber)}
            >
              {isLoading && <RefreshCw size={20} color="#FFFFFF" />}
              <Text style={styles.sendButtonText}>
                {isLoading ? 'Envoi...' : 'Envoyer le code'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {step === 'otp' && (
          <>
            <View style={styles.iconContainer}>
              <Shield size={60} color="#FF7A00" />
            </View>

            <Text style={styles.title}>Entrez le code</Text>
            <Text style={styles.subtitle}>
              Code envoyé au +225 {phoneNumber}
            </Text>

            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (otpRefs.current[index] = ref)}
                  style={[
                    styles.otpInput,
                    digit && styles.otpInputFilled,
                    isLoading && styles.otpInputDisabled
                  ]}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(index, value)}
                  onKeyPress={({ nativeEvent }) => handleOtpKeyPress(index, nativeEvent.key)}
                  keyboardType="numeric"
                  maxLength={1}
                  editable={!isLoading}
                  selectTextOnFocus
                />
              ))}
            </View>

            <View style={styles.resendContainer}>
              {countdown > 0 ? (
                <Text style={styles.countdownText}>
                  Renvoyer le code dans {countdown}s
                </Text>
              ) : (
                <TouchableOpacity onPress={resendOTP} disabled={!canResend}>
                  <Text style={[styles.resendText, !canResend && styles.resendTextDisabled]}>
                    Renvoyer le code
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={styles.changeNumberButton}
              onPress={() => setStep('phone')}
            >
              <Text style={styles.changeNumberText}>Changer de numéro</Text>
            </TouchableOpacity>
          </>
        )}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginLeft: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 40,
    paddingTop: 40,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 40,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    alignSelf: 'stretch',
  },
  countryCode: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
  },
  countryCodeText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#333',
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF7A00',
    paddingVertical: 16,
    borderRadius: 12,
    alignSelf: 'stretch',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    alignSelf: 'stretch',
  },
  otpInput: {
    width: 45,
    height: 55,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#333',
  },
  otpInputFilled: {
    borderColor: '#FF7A00',
    backgroundColor: '#FFF3E0',
  },
  otpInputDisabled: {
    opacity: 0.6,
  },
  resendContainer: {
    marginBottom: 20,
  },
  countdownText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
  },
  resendText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FF7A00',
    textAlign: 'center',
  },
  resendTextDisabled: {
    color: '#CCC',
  },
  changeNumberButton: {
    paddingVertical: 12,
  },
  changeNumberText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#2196F3',
    textDecorationLine: 'underline',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  successTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  successText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  benefitsCard: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    alignSelf: 'stretch',
  },
  benefitsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#2E7D32',
    marginLeft: 12,
  },
  doneButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
  },
  doneButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});