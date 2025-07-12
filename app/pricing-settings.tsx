// app/pricing-settings.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, DollarSign, Clock, Percent, Save, Info } from 'lucide-react-native';

interface PricingRule {
  id: string;
  name: string;
  type: 'emergency' | 'weekend' | 'night' | 'distance' | 'duration';
  multiplier: number;
  isActive: boolean;
}

interface PaymentTerm {
  id: string;
  name: string;
  percentage: number;
  timing: string;
  isActive: boolean;
}

export default function PricingSettingsScreen() {
  const router = useRouter();

  const [baseSettings, setBaseSettings] = useState({
    defaultHourlyRate: '3000',
    minimumJobPrice: '5000',
    emergencyRate: '5000',
    travelCostPerKm: '200',
    cancellationFee: '2000'
  });

  const [pricingRules, setPricingRules] = useState<PricingRule[]>([
    { id: '1', name: 'Majoration urgence', type: 'emergency', multiplier: 1.5, isActive: true },
    { id: '2', name: 'Majoration week-end', type: 'weekend', multiplier: 1.3, isActive: true },
    { id: '3', name: 'Majoration nocturne (20h-6h)', type: 'night', multiplier: 1.4, isActive: false },
    { id: '4', name: 'Frais déplacement (+10km)', type: 'distance', multiplier: 1.2, isActive: true },
    { id: '5', name: 'Majoration longue durée (+4h)', type: 'duration', multiplier: 0.9, isActive: true }
  ]);

  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>([
    { id: '1', name: 'Acompte à la réservation', percentage: 30, timing: 'booking', isActive: true },
    { id: '2', name: 'Solde à la fin', percentage: 70, timing: 'completion', isActive: true },
    { id: '3', name: 'Paiement intégral à la fin', percentage: 100, timing: 'completion', isActive: false }
  ]);

  const [discountSettings, setDiscountSettings] = useState({
    firstTimeClientDiscount: '10',
    loyaltyDiscount: '15',
    bulkJobDiscount: '20',
    referralDiscount: '5'
  });

  const [loading, setLoading] = useState(false);

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1500));
      Alert.alert('Succès', 'Paramètres de tarification sauvegardés');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder les paramètres');
    } finally {
      setLoading(false);
    }
  };

  const togglePricingRule = (id: string) => {
    setPricingRules(prev => prev.map(rule =>
      rule.id === id ? { ...rule, isActive: !rule.isActive } : rule
    ));
  };

  const updateRuleMultiplier = (id: string, multiplier: number) => {
    setPricingRules(prev => prev.map(rule =>
      rule.id === id ? { ...rule, multiplier } : rule
    ));
  };

  const togglePaymentTerm = (id: string) => {
    // Only allow one payment term to be active at a time
    setPaymentTerms(prev => prev.map(term => ({
      ...term,
      isActive: term.id === id ? !term.isActive : false
    })));
  };

  const formatMultiplier = (multiplier: number) => {
    if (multiplier > 1) {
      return `+${Math.round((multiplier - 1) * 100)}%`;
    } else if (multiplier < 1) {
      return `-${Math.round((1 - multiplier) * 100)}%`;
    }
    return '0%';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tarifs et conditions</Text>
        <TouchableOpacity onPress={handleSaveSettings} disabled={loading}>
          <Save size={24} color={loading ? "#999" : "#FF7A00"} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Base Pricing */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <DollarSign size={20} color="#333" />
            <Text style={styles.sectionTitle}>Tarifs de base</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tarif horaire par défaut (FCFA/h)</Text>
            <TextInput
              style={styles.input}
              value={baseSettings.defaultHourlyRate}
              onChangeText={(text) => setBaseSettings(prev => ({ ...prev, defaultHourlyRate: text }))}
              keyboardType="numeric"
              placeholder="3000"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Prix minimum d'intervention (FCFA)</Text>
            <TextInput
              style={styles.input}
              value={baseSettings.minimumJobPrice}
              onChangeText={(text) => setBaseSettings(prev => ({ ...prev, minimumJobPrice: text }))}
              keyboardType="numeric"
              placeholder="5000"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tarif urgence (FCFA/h)</Text>
            <TextInput
              style={styles.input}
              value={baseSettings.emergencyRate}
              onChangeText={(text) => setBaseSettings(prev => ({ ...prev, emergencyRate: text }))}
              keyboardType="numeric"
              placeholder="5000"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Frais de déplacement (FCFA/km)</Text>
            <TextInput
              style={styles.input}
              value={baseSettings.travelCostPerKm}
              onChangeText={(text) => setBaseSettings(prev => ({ ...prev, travelCostPerKm: text }))}
              keyboardType="numeric"
              placeholder="200"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Frais d'annulation (FCFA)</Text>
            <TextInput
              style={styles.input}
              value={baseSettings.cancellationFee}
              onChangeText={(text) => setBaseSettings(prev => ({ ...prev, cancellationFee: text }))}
              keyboardType="numeric"
              placeholder="2000"
            />
          </View>
        </View>

        {/* Pricing Rules */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Percent size={20} color="#333" />
            <Text style={styles.sectionTitle}>Règles de majoration</Text>
          </View>

          {pricingRules.map(rule => (
            <View key={rule.id} style={styles.ruleCard}>
              <View style={styles.ruleHeader}>
                <View style={styles.ruleInfo}>
                  <Text style={styles.ruleName}>{rule.name}</Text>
                  <Text style={styles.ruleMultiplier}>
                    {formatMultiplier(rule.multiplier)}
                  </Text>
                </View>
                <Switch
                  value={rule.isActive}
                  onValueChange={() => togglePricingRule(rule.id)}
                  trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                  thumbColor={rule.isActive ? '#FFFFFF' : '#F4F3F4'}
                />
              </View>

              {rule.isActive && (
                <View style={styles.multiplierInput}>
                  <Text style={styles.multiplierLabel}>Multiplicateur:</Text>
                  <TextInput
                    style={styles.multiplierField}
                    value={rule.multiplier.toString()}
                    onChangeText={(text) => {
                      const value = parseFloat(text) || 1;
                      updateRuleMultiplier(rule.id, value);
                    }}
                    keyboardType="numeric"
                    placeholder="1.0"
                  />
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Payment Terms */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={20} color="#333" />
            <Text style={styles.sectionTitle}>Conditions de paiement</Text>
          </View>

          {paymentTerms.map(term => (
            <TouchableOpacity
              key={term.id}
              style={[styles.paymentTermCard, term.isActive && styles.activePaymentTerm]}
              onPress={() => togglePaymentTerm(term.id)}
            >
              <View style={styles.paymentTermInfo}>
                <Text style={styles.paymentTermName}>{term.name}</Text>
                <Text style={styles.paymentTermDetails}>
                  {term.percentage}% - {term.timing === 'booking' ? 'À la réservation' : 'À la fin du travail'}
                </Text>
              </View>
              <View style={[styles.radioButton, term.isActive && styles.radioButtonActive]}>
                {term.isActive && <View style={styles.radioButtonInner} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Discount Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Percent size={20} color="#333" />
            <Text style={styles.sectionTitle}>Remises automatiques (%)</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nouveau client</Text>
            <TextInput
              style={styles.input}
              value={discountSettings.firstTimeClientDiscount}
              onChangeText={(text) => setDiscountSettings(prev => ({ ...prev, firstTimeClientDiscount: text }))}
              keyboardType="numeric"
              placeholder="10"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Client fidèle (5+ tâches)</Text>
            <TextInput
              style={styles.input}
              value={discountSettings.loyaltyDiscount}
              onChangeText={(text) => setDiscountSettings(prev => ({ ...prev, loyaltyDiscount: text }))}
              keyboardType="numeric"
              placeholder="15"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tâches multiples (3+)</Text>
            <TextInput
              style={styles.input}
              value={discountSettings.bulkJobDiscount}
              onChangeText={(text) => setDiscountSettings(prev => ({ ...prev, bulkJobDiscount: text }))}
              keyboardType="numeric"
              placeholder="20"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Parrainage</Text>
            <TextInput
              style={styles.input}
              value={discountSettings.referralDiscount}
              onChangeText={(text) => setDiscountSettings(prev => ({ ...prev, referralDiscount: text }))}
              keyboardType="numeric"
              placeholder="5"
            />
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Info size={20} color="#2196F3" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Conseil tarifaire</Text>
            <Text style={styles.infoText}>
              Ajustez vos tarifs en fonction de la demande locale et de votre expérience.
              Les majorations d'urgence et de week-end vous permettent d'optimiser vos revenus.
            </Text>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.disabledButton]}
          onPress={handleSaveSettings}
          disabled={loading}
        >
          <Save size={20} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>
            {loading ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
          </Text>
        </TouchableOpacity>

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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
  ruleCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  ruleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ruleInfo: {
    flex: 1,
  },
  ruleName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333',
  },
  ruleMultiplier: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FF7A00',
    marginTop: 2,
  },
  multiplierInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  multiplierLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginRight: 8,
  },
  multiplierField: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333',
    width: 80,
  },
  paymentTermCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activePaymentTerm: {
    borderColor: '#FF7A00',
    backgroundColor: '#FFF8F0',
  },
  paymentTermInfo: {
    flex: 1,
  },
  paymentTermName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333',
  },
  paymentTermDetails: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 2,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonActive: {
    borderColor: '#FF7A00',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF7A00',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 16,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF7A00',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  disabledButton: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});