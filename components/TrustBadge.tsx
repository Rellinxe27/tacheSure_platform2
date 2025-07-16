import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Shield, Star, CircleCheck as CheckCircle, Award, Crown } from 'lucide-react-native';

interface TrustBadgeProps {
  trustScore: number;
  verificationLevel: 'basic' | 'government' | 'enhanced' | 'community';
  isVerified: boolean;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export default function TrustBadge({
                                     trustScore,
                                     verificationLevel,
                                     isVerified,
                                     size = 'medium',
                                     showLabel = true
                                   }: TrustBadgeProps) {
  const getTrustColor = () => {
    if (trustScore >= 95) return '#4CAF50'; // Excellent
    if (trustScore >= 85) return '#8BC34A'; // Very Good
    if (trustScore >= 75) return '#FFC107'; // Good
    if (trustScore >= 60) return '#FF9800'; // Fair
    return '#FF5722'; // Poor
  };

  const getTrustLevel = () => {
    if (trustScore >= 95) return 'Excellent';
    if (trustScore >= 85) return 'Très bon';
    if (trustScore >= 75) return 'Bon';
    if (trustScore >= 60) return 'Correct';
    return 'À améliorer';
  };

  const getVerificationIcon = () => {
    const iconSize = size === 'small' ? 12 : size === 'medium' ? 16 : 20;

    switch (verificationLevel) {
      case 'community':
        return <Crown size={iconSize} color="#FFD700" fill="#FFD700" />;
      case 'enhanced':
        return <Award size={iconSize} color="#9C27B0" />;
      case 'government':
        return <CheckCircle size={iconSize} color="#2196F3" />;
      default:
        return <Shield size={iconSize} color="#666" />;
    }
  };

  const getVerificationText = () => {
    switch (verificationLevel) {
      case 'community':
        return 'Validé Communauté';
      case 'enhanced':
        return 'Vérification Renforcée';
      case 'government':
        return 'Vérifié Gouvernement';
      default:
        return 'Vérification Basique';
    }
  };

  const getVerificationColor = () => {
    switch (verificationLevel) {
      case 'community':
        return '#FFD700';
      case 'enhanced':
        return '#9C27B0';
      case 'government':
        return '#2196F3';
      default:
        return '#666';
    }
  };

  const sizeStyles = {
    small: {
      trustBadgeSize: 32,
      fontSize: 10,
      verificationPadding: 4,
      verificationFontSize: 9,
      spacing: 4
    },
    medium: {
      trustBadgeSize: 40,
      fontSize: 12,
      verificationPadding: 6,
      verificationFontSize: 10,
      spacing: 6
    },
    large: {
      trustBadgeSize: 48,
      fontSize: 14,
      verificationPadding: 8,
      verificationFontSize: 12,
      spacing: 8
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <View style={styles.container}>
      {/* Trust Score Badge */}
      <View style={styles.trustBadgeContainer}>
        <View style={[
          styles.trustBadge,
          {
            backgroundColor: getTrustColor(),
            width: currentSize.trustBadgeSize,
            height: currentSize.trustBadgeSize,
            borderRadius: currentSize.trustBadgeSize / 2
          }
        ]}>
          <Text style={[
            styles.trustScore,
            { fontSize: currentSize.fontSize }
          ]}>
            {trustScore}%
          </Text>
        </View>

        {showLabel && size !== 'small' && (
          <Text style={[
            styles.trustLabel,
            {
              fontSize: currentSize.verificationFontSize,
              marginTop: 2
            }
          ]}>
            {getTrustLevel()}
          </Text>
        )}
      </View>

      {/* Verification Badge */}
      {isVerified && (
        <View style={[
          styles.verificationBadge,
          {
            paddingHorizontal: currentSize.verificationPadding,
            paddingVertical: currentSize.verificationPadding / 2,
            marginLeft: currentSize.spacing,
            backgroundColor: `${getVerificationColor()}15`,
            borderColor: `${getVerificationColor()}30`
          }
        ]}>
          <View style={styles.verificationContent}>
            {getVerificationIcon()}
            {size !== 'small' && (
              <Text style={[
                styles.verificationText,
                {
                  fontSize: currentSize.verificationFontSize,
                  color: getVerificationColor(),
                  marginLeft: 4
                }
              ]}>
                {size === 'large' ? getVerificationText() : getVerificationText().split(' ')[0]}
              </Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trustBadgeContainer: {
    alignItems: 'center',
  },
  trustBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  trustScore: {
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  trustLabel: {
    fontFamily: 'Inter-Medium',
    color: '#666',
    textAlign: 'center',
  },
  verificationBadge: {
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verificationText: {
    fontFamily: 'Inter-Medium',
  },
});