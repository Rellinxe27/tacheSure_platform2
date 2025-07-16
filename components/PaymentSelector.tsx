import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { CreditCard, Smartphone, Banknote, Shield, Clock, Check } from 'lucide-react-native';

interface PaymentMethod {
  id: string;
  name: string;
  type: 'mobile_money' | 'bank' | 'cash';
  icon: string;
  fees: string;
  processingTime: string;
  description: string;
  popular?: boolean;
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
  const [selected, setSelected] = useState<string | null>(selectedMethod || null);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'mtn_money',
      name: 'MTN Mobile Money',
      type: 'mobile_money',
      icon: '📱',
      fees: '1.5%',
      processingTime: 'Instantané',
      description: 'Paiement rapide et sécurisé',
      popular: true
    },
    {
      id: 'orange_money',
      name: 'Orange Money',
      type: 'mobile_money',
      icon: '🟠',
      fees: '1.5%',
      processingTime: 'Instantané',
      description: 'Solution de paiement mobile'
    },
    {
      id: 'moov_money',
      name: 'Moov Money',
      type: 'mobile_money',
      icon: '🔵',
      fees: '1.5%',
      processingTime: 'Instantané',
      description: 'Transfert d\'argent mobile'
    },
    {
      id: 'bank_transfer',
      name: 'Virement bancaire',
      type: 'bank',
      icon: '🏦',
      fees: '0%',
      processingTime: '1-2 jours',
      description: 'Transfert bancaire traditionnel'
    },
    {
      id: 'cash',
      name: 'Paiement en espèces',
      type: 'cash',
      icon: '💵',
      fees: '0%',
      processingTime: 'À la livraison',
      description: 'Paiement direct au prestataire'
    }
  ];

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'mobile_money':
        return <Smartphone size={24} color="#FF7A00" />;
      case 'bank':
        return <CreditCard size={24} color="#2196F3" />;
      case 'cash':
        return <Banknote size={24} color="#4CAF50" />;
      default:
        return <CreditCard size={24} color="#666" />;
    }
  };

  const calculateFees = (method: PaymentMethod) => {
    if (method.fees === '0%') return 0;
    const feePercentage = parseFloat(method.fees.replace('%', ''));
    return Math.round((amount * feePercentage) / 100);
  };

  const calculateTotal = (method: PaymentMethod) => {
    return amount + calculateFees(method);
  };

  const handleSelectMethod = (method: PaymentMethod) => {
    setSelected(method.id);
  };

  const handleConfirmPayment = () => {
    const selectedPaymentMethod = paymentMethods.find(m => m.id === selected);
    if (selectedPaymentMethod) {
      onPaymentMethodSelect(selectedPaymentMethod);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Finaliser le paiement</Text>
        <Text style={styles.subtitle}>Choisissez votre mode de paiement préféré</Text>
      </View>

      {/* Amount Summary */}
      <View style={styles.amountCard}>
        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Montant du service</Text>
          <Text style={styles.amountValue}>{amount.toLocaleString()} FCFA</Text>
        </View>
        {selected && (
          <>
            <View style={styles.amountRow}>
              <Text style={styles.feeLabel}>Frais de traitement</Text>
              <Text style={styles.feeValue}>
                {calculateFees(paymentMethods.find(m => m.id === selected)!).toLocaleString()} FCFA
              </Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.amountRow}>
              <Text style={styles.totalLabel}>Total à payer</Text>
              <Text style={styles.totalValue}>
                {calculateTotal(paymentMethods.find(m => m.id === selected)!).toLocaleString()} FCFA
              </Text>
            </View>
          </>
        )}
      </View>

      {/* Payment Methods */}
      <ScrollView style={styles.methodsList} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Modes de paiement</Text>

        {paymentMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.methodCard,
              selected === method.id && styles.selectedMethodCard,
              method.popular && styles.popularMethod
            ]}
            onPress={() => handleSelectMethod(method)}
          >
            {method.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>POPULAIRE</Text>
              </View>
            )}

            <View style={styles.methodHeader}>
              <View style={styles.methodIconContainer}>
                <Text style={styles.methodEmoji}>{method.icon}</Text>
                {getMethodIcon(method.type)}
              </View>

              <View style={styles.methodInfo}>
                <Text style={styles.methodName}>{method.name}</Text>
                <Text style={styles.methodDescription}>{method.description}</Text>

                <View style={styles.methodDetails}>
                  <View style={styles.detailItem}>
                    <Clock size={14} color="#666" />
                    <Text style={styles.detailText}>{method.processingTime}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.feesBadge}>Frais: {method.fees}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.selectionIndicator}>
                {selected === method.id ? (
                  <View style={styles.selectedCircle}>
                    <Check size={16} color="#FFFFFF" />
                  </View>
                ) : (
                  <View style={styles.unselectedCircle} />
                )}
              </View>
            </View>

            {/* Method-specific info */}
            {method.type === 'mobile_money' && (
              <View style={styles.methodFooter}>
                <View style={styles.infoItem}>
                  <Shield size={14} color="#4CAF50" />
                  <Text style={styles.infoText}>Paiement sécurisé via votre portefeuille mobile</Text>
                </View>
              </View>
            )}

            {method.type === 'cash' && (
              <View style={styles.methodFooter}>
                <View style={styles.warningItem}>
                  <Text style={styles.warningIcon}>⚠️</Text>
                  <Text style={styles.warningText}>Paiement à effectuer en présence du prestataire</Text>
                </View>
              </View>
            )}

            {method.type === 'bank' && (
              <View style={styles.methodFooter}>
                <View style={styles.infoItem}>
                  <Shield size={14} color="#2196F3" />
                  <Text style={styles.infoText}>Virement bancaire sécurisé avec protection acheteur</Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Security Notice */}
      <View style={styles.securityNotice}>
        <Shield size={20} color="#4CAF50" />
        <View style={styles.securityTextContainer}>
          <Text style={styles.securityTitle}>Paiement 100% sécurisé</Text>
          <Text style={styles.securityText}>
            Votre argent est protégé par notre système d'entiercement jusqu'à la fin du service
          </Text>
        </View>
      </View>

      {/* Confirm Button */}
      {selected && (
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirmPayment}
        >
          <Text style={styles.confirmButtonText}>
            Confirmer le paiement • {calculateTotal(paymentMethods.find(m => m.id === selected)!).toLocaleString()} FCFA
          </Text>
        </TouchableOpacity>
      )}
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
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  amountCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  amountValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  feeLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  feeValue: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FF7A00',
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FF7A00',
  },
  methodsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  methodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  selectedMethodCard: {
    borderColor: '#FF7A00',
    backgroundColor: '#FFF8F3',
  },
  popularMethod: {
    borderColor: '#4CAF50',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: 16,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  popularText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  methodEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 8,
  },
  methodDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginLeft: 4,
  },
  feesBadge: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FF7A00',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  selectionIndicator: {
    marginLeft: 16,
  },
  selectedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF7A00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unselectedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  methodFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#4CAF50',
    marginLeft: 8,
    flex: 1,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  warningText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#F57C00',
    flex: 1,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    margin: 20,
    padding: 16,
    borderRadius: 12,
  },
  securityTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  securityTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#2E7D32',
    marginBottom: 2,
  },
  securityText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#2E7D32',
    lineHeight: 16,
  },
  confirmButton: {
    backgroundColor: '#FF7A00',
    margin: 20,
    marginTop: 0,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
});