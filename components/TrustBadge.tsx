// components/TrustBadge.tsx - Enhanced with better labels and visual design
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Shield, Star, CircleCheck as CheckCircle, Award, Crown, Zap, Trophy, Medal } from 'lucide-react-native';

interface TrustBadgeProps {
  trustScore: number;
  verificationLevel: 'basic' | 'government' | 'enhanced' | 'community';
  isVerified: boolean;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

export default function TrustBadge({
                                     trustScore,
                                     verificationLevel,
                                     isVerified,
                                     size = 'medium',
                                     showLabel = true,
                                     variant = 'default'
                                   }: TrustBadgeProps) {

  const getTrustLevel = () => {
    if (trustScore >= 98) return { label: 'Legend Elite', icon: Crown, color: '#FFD700', gradient: ['#FFD700', '#FFA000'] };
    if (trustScore >= 95) return { label: 'Expert Elite', icon: Trophy, color: '#FF6B35', gradient: ['#FF6B35', '#F7931E'] };
    if (trustScore >= 90) return { label: 'Pro Master', icon: Award, color: '#8E24AA', gradient: ['#8E24AA', '#AB47BC'] };
    if (trustScore >= 85) return { label: 'Pro Certifié', icon: Medal, color: '#1976D2', gradient: ['#1976D2', '#42A5F5'] };
    if (trustScore >= 80) return { label: 'Confirmé+', icon: Star, color: '#388E3C', gradient: ['#388E3C', '#66BB6A'] };
    if (trustScore >= 70) return { label: 'Confirmé', icon: CheckCircle, color: '#689F38', gradient: ['#689F38', '#8BC34A'] };
    if (trustScore >= 60) return { label: 'Qualifié', icon: Shield, color: '#F57C00', gradient: ['#F57C00', '#FFB74D'] };
    if (trustScore >= 40) return { label: 'Apprenti', icon: Zap, color: '#FBC02D', gradient: ['#FBC02D', '#FFEB3B'] };
    return { label: 'Débutant', icon: Shield, color: '#757575', gradient: ['#757575', '#BDBDBD'] };
  };

  const getVerificationData = () => {
    switch (verificationLevel) {
      case 'community':
        return {
          title: 'Validé Communauté',
          icon: Crown,
          color: '#FFD700',
          shortTitle: 'VIP'
        };
      case 'enhanced':
        return {
          title: 'Vérification Renforcée',
          icon: Award,
          color: '#9C27B0',
          shortTitle: 'PRO'
        };
      case 'government':
        return {
          title: 'Vérifié Gouvernement',
          icon: CheckCircle,
          color: '#2196F3',
          shortTitle: 'GOV'
        };
      default:
        return {
          title: 'Vérification Basique',
          icon: Shield,
          color: '#666',
          shortTitle: 'STD'
        };
    }
  };

  const sizeConfig = {
    small: {
      trustSize: 28,
      fontSize: 9,
      verificationPadding: 3,
      verificationFontSize: 8,
      spacing: 4,
      iconSize: 10
    },
    medium: {
      trustSize: 36,
      fontSize: 11,
      verificationPadding: 6,
      verificationFontSize: 9,
      spacing: 6,
      iconSize: 12
    },
    large: {
      trustSize: 44,
      fontSize: 13,
      verificationPadding: 8,
      verificationFontSize: 11,
      spacing: 8,
      iconSize: 14
    },
  };

  const currentSize = sizeConfig[size];
  const trustLevel = getTrustLevel();
  const verificationData = getVerificationData();

  if (variant === 'compact') {
    return (
      <View style={styles.compactContainer}>
        <View style={[
          styles.compactBadge,
          {
            backgroundColor: trustLevel.color,
            width: currentSize.trustSize,
            height: currentSize.trustSize,
            borderRadius: currentSize.trustSize / 2
          }
        ]}>
          <Text style={[
            styles.compactScore,
            { fontSize: currentSize.fontSize }
          ]}>
            {trustScore}
          </Text>
        </View>
        {isVerified && (
          <View style={[
            styles.compactVerification,
            { backgroundColor: verificationData.color }
          ]}>
            <Text style={styles.compactVerificationText}>
              {verificationData.shortTitle}
            </Text>
          </View>
        )}
      </View>
    );
  }

  if (variant === 'detailed') {
    return (
      <View style={styles.detailedContainer}>
        <View style={styles.detailedMain}>
          <View style={[
            styles.detailedBadge,
            {
              backgroundColor: trustLevel.color,
              width: currentSize.trustSize + 8,
              height: currentSize.trustSize + 8,
              borderRadius: (currentSize.trustSize + 8) / 2
            }
          ]}>
            <trustLevel.icon size={currentSize.iconSize + 2} color="#FFFFFF" />
            <Text style={[
              styles.detailedScore,
              { fontSize: currentSize.fontSize + 1 }
            ]}>
              {trustScore}%
            </Text>
          </View>

          <View style={styles.detailedInfo}>
            <Text style={[
              styles.detailedLabel,
              { fontSize: currentSize.fontSize + 2 }
            ]}>
              {trustLevel.label}
            </Text>

            {isVerified && (
              <View style={styles.detailedVerificationRow}>
                <verificationData.icon size={currentSize.iconSize} color={verificationData.color} />
                <Text style={[
                  styles.detailedVerificationText,
                  {
                    color: verificationData.color,
                    fontSize: currentSize.verificationFontSize + 1
                  }
                ]}>
                  {verificationData.title}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  }

  // Default variant
  return (
    <View style={styles.container}>
      {/* Trust Score Badge */}
      <View style={styles.trustBadgeContainer}>
        <View style={[
          styles.trustBadge,
          {
            backgroundColor: trustLevel.color,
            width: currentSize.trustSize,
            height: currentSize.trustSize,
            borderRadius: currentSize.trustSize / 2
          }
        ]}>
          <trustLevel.icon size={currentSize.iconSize} color="#FFFFFF" />
          <Text style={[
            styles.trustScore,
            { fontSize: currentSize.fontSize }
          ]}>
            {trustScore}
          </Text>
        </View>

        {showLabel && size !== 'small' && (
          <Text style={[
            styles.trustLabel,
            {
              fontSize: currentSize.verificationFontSize,
              marginTop: 2,
              color: trustLevel.color
            }
          ]}>
            {trustLevel.label}
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
            backgroundColor: `${verificationData.color}15`,
            borderColor: `${verificationData.color}30`
          }
        ]}>
          <View style={styles.verificationContent}>
            <verificationData.icon size={currentSize.iconSize} color={verificationData.color} />
            {size !== 'small' && (
              <Text style={[
                styles.verificationText,
                {
                  fontSize: currentSize.verificationFontSize,
                  color: verificationData.color,
                  marginLeft: 4
                }
              ]}>
                {size === 'large' ? verificationData.title : verificationData.shortTitle}
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    flexDirection: 'column',
  },
  trustScore: {
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 1,
  },
  trustLabel: {
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    letterSpacing: 0.5,
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
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.5,
  },

  // Compact variant styles
  compactContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  compactBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  compactScore: {
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  compactVerification: {
    position: 'absolute',
    top: -2,
    right: -2,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  compactVerificationText: {
    fontSize: 7,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  // Detailed variant styles
  detailedContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
  },
  detailedMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailedBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    marginRight: 12,
  },
  detailedScore: {
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginTop: 2,
  },
  detailedInfo: {
    flex: 1,
  },
  detailedLabel: {
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginBottom: 4,
  },
  detailedVerificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailedVerificationText: {
    fontFamily: 'Inter-Medium',
    marginLeft: 6,
  },
});