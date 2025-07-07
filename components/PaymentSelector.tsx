import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { CreditCard, Smartphone, Banknote } from 'lucide-react-native';

interface PaymentMethod {
  id: string;
  name: string;
  type: 'mobile_money' | 'bank' | 'cash';
  icon: string;
  fees: string;
  processingTime: string;
}

interface PaymentSelectorProps {
  amount: number;
  onPaymentMethodSelect: (method: PaymentMethod) => void;
  selectedMethod?: string;
}

export default function PaymentSelector({ 
  amount, 
  onPaymentMethodSelect, 
  selectedMethod 
}: PaymentSelectorProps) {
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'mtn_money',
      name: 'MTN Mobile Money',
      type: 'mobile_money',
      icon: 'https://images.pexels.com/photos/4386321/pexels-photo-4386321.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      fees: '1.5%',
      processingTime: 'Instantané'
    },
    {
      id: 'orange_money',
      name: 'Orange Money',
      type: 'mobile_money',
      icon: 'https://images.pexels.com/photos/4386321/pexels-photo-4386321.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      fees: '1.5%',
      processingTime: 'Instantané'
    },
    {
      id: 'moov_money',
      name: 'Moov Money',
      type: 'mobile_money',
      icon: 'https://images.pexels.com/photos/4386321/pexels-photo-4386321.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      fees: '1.5%',
      processingTime: 'Instantané'
    },
    {
      id: 'bank_transfer',
      name: 'Virement bancaire',
      type: 'bank',
      icon: 'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      fees: '0%',
      processingTime: '1-2 jours'
    },
    {
      id: 'cash',
      name: 'Paiement en espèces',
      type: 'cash',
      icon: 'https://images.pexels.com/photos/259100/pexels-photo-259100.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      fees: '0%',
      processingTime: 'À la livraison'
    }
  ];

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'mobile_money':
        return <Smartphone size={20} color="#FF7A00" />;
      case 'bank':
        return <CreditCard size={20} color="#2196F3" />;
      case 'cash':
        return <Banknote size={20} color="#4CAF50" />;
      default:
        return <CreditCard size={20} color="#666" />;
    }
  };

  const calculateFees = (method: PaymentMethod) => {
    if (method.fees === '0%') return 0;
    const feePercentage = parseFloat(method.fees.replace('%', ''));
    return (amount * feePercentage) / 100;
  };

  const calculateTotal = (method: PaymentMethod) => {
    return amount + calculateFees(method);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choisir un mode de paiement</Text>
      <Text style={styles.amount}>Montant: {amount.toLocaleString()} FCFA</Text>
      
      {paymentMethods.map((method) => (
        <TouchableOpacity
          key={method.id}
          style={[
            styles.methodCard,
            selectedMethod === method.id && styles.selectedMethod
          ]}
          onPress={() => onPaymentMethodSelect(method)}
        >
          <View style={styles.methodHeader}>
            <View style={styles.methodInfo}>
              {getMethodIcon(method.type)}
              <View style={styles.methodDetails}>
                <Text style={styles.methodName}>{method.name}</Text>
                <Text style={styles.processingTime}>{method.processingTime}</Text>
              </View>
            </View>
            <View style={styles.methodPricing}>
              <Text style={styles.fees}>Frais: {method.fees}</Text>
              <Text style={styles.total}>
                Total: {calculateTotal(method).toLocaleString()} FCFA
              </Text>
            </View>
          </View>
          
          {method.type === 'mobile_money' && (
            <View style={styles.mobileMoneyInfo}>
              <Text style={styles.mobileMoneyText}>
                Paiement sécurisé via votre portefeuille mobile
              </Text>
            </View>
          )}
          
          {method.type === 'cash' && (
            <View style={styles.cashInfo}>
              <Text style={styles.cashText}>
                ⚠️ Paiement à effectuer en présence du prestataire
              </Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
      
      <View style={styles.securityNote}>
        <Text style={styles.securityText}>
          🔒 Tous les paiements sont sécurisés et protégés par notre système d'entiercement
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 8,
  },
  amount: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#FF7A00',
    marginBottom: 20,
  },
  methodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedMethod: {
    borderColor: '#FF7A00',
    backgroundColor: '#FFF3E0',
  },
  methodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  methodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodDetails: {
    marginLeft: 12,
  },
  methodName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  processingTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 2,
  },
  methodPricing: {
    alignItems: 'flex-end',
  },
  fees: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  total: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginTop: 2,
  },
  mobileMoneyInfo: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  mobileMoneyText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#1976D2',
  },
  cashInfo: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
  },
  cashText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#F57C00',
  },
  securityNote: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
  },
  securityText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#2E7D32',
    textAlign: 'center',
  },
});