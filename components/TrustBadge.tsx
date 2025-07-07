import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Shield, Star, CircleCheck as CheckCircle } from 'lucide-react-native';

interface TrustBadgeProps {
  trustScore: number;
  verificationLevel: 'basic' | 'government' | 'enhanced' | 'community';
  isVerified: boolean;
  size?: 'small' | 'medium' | 'large';
}

export default function TrustBadge({ 
  trustScore, 
  verificationLevel, 
  isVerified, 
  size = 'medium' 
}: TrustBadgeProps) {
  const getBadgeColor = () => {
    if (trustScore >= 90) return '#4CAF50';
    if (trustScore >= 75) return '#FF9800';
    if (trustScore >= 60) return '#FFC107';
    return '#FF5722';
  };

  const getVerificationIcon = () => {
    switch (verificationLevel) {
      case 'community':
        return <Star size={16} color="#FFD700" fill="#FFD700" />;
      case 'enhanced':
        return <Shield size={16} color="#4CAF50" />;
      case 'government':
        return <CheckCircle size={16} color="#2196F3" />;
      default:
        return <Shield size={16} color="#666" />;
    }
  };

  const getVerificationText = () => {
    switch (verificationLevel) {
      case 'community':
        return 'Communauté';
      case 'enhanced':
        return 'Renforcée';
      case 'government':
        return 'Gouvernement';
      default:
        return 'Basique';
    }
  };

  const sizeStyles = {
    small: { padding: 4, fontSize: 10 },
    medium: { padding: 8, fontSize: 12 },
    large: { padding: 12, fontSize: 14 },
  };

  return (
    <View style={styles.container}>
      <View style={[
        styles.trustBadge,
        { backgroundColor: getBadgeColor() },
        { padding: sizeStyles[size].padding }
      ]}>
        <Text style={[
          styles.trustScore,
          { fontSize: sizeStyles[size].fontSize }
        ]}>
          {trustScore}%
        </Text>
      </View>
      
      {isVerified && (
        <View style={[
          styles.verificationBadge,
          { padding: sizeStyles[size].padding }
        ]}>
          {getVerificationIcon()}
          <Text style={[
            styles.verificationText,
            { fontSize: sizeStyles[size].fontSize }
          ]}>
            {getVerificationText()}
          </Text>
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
  trustBadge: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  trustScore: {
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 8,
  },
  verificationText: {
    fontFamily: 'Inter-Medium',
    color: '#333',
    marginLeft: 4,
  },
});