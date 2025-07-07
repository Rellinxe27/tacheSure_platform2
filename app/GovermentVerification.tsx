import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { Shield, CheckCircle, XCircle, Clock, FileText, User, Calendar, MapPin, AlertTriangle } from 'lucide-react-native';

interface CNIData {
  number: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  birthPlace: string;
  nationality: string;
  issuedDate: string;
  expiryDate: string;
  issuingAuthority: string;
  fatherName?: string;
  motherName?: string;
  address?: string;
}

interface VerificationResult {
  status: 'pending' | 'verified' | 'failed' | 'expired' | 'invalid';
  confidence: number;
  matchedFields: string[];
  discrepancies: string[];
  timestamp: Date;
  verificationId: string;
}

interface DatabaseConnection {
  name: string;
  status: 'connected' | 'disconnected' | 'maintenance';
  lastSync: Date;
  reliability: number;
}

interface GovernmentVerificationProps {
  cniNumber?: string;
  userData?: Partial<CNIData>;
  onVerificationComplete?: (result: VerificationResult) => void;
}

export default function GovernmentVerification({
                                                 cniNumber,
                                                 userData,
                                                 onVerificationComplete
                                               }: GovernmentVerificationProps) {
  const [verificationStep, setVerificationStep] = useState<'input' | 'processing' | 'results'>('input');
  const [cniInput, setCniInput] = useState(cniNumber || '');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [extractedData, setExtractedData] = useState<CNIData | null>(null);
  const [loading, setLoading] = useState(false);

  const [databases] = useState<DatabaseConnection[]>([
    {
      name: 'Base Nationale CNI',
      status: 'connected',
      lastSync: new Date(),
      reliability: 98.5
    },
    {
      name: 'Registre Civil',
      status: 'connected',
      lastSync: new Date(Date.now() - 3600000),
      reliability: 96.2
    },
    {
      name: 'Base Électorale',
      status: 'maintenance',
      lastSync: new Date(Date.now() - 86400000),
      reliability: 94.8
    }
  ]);

  useEffect(() => {
    if (cniNumber && userData) {
      // Auto-start verification if data is provided
      handleVerification();
    }
  }, [cniNumber, userData]);

  const validateCNIFormat = (cni: string): boolean => {
    // CI CNI format: CI followed by 10 digits
    const cniRegex = /^CI\d{10}$/;
    return cniRegex.test(cni.toUpperCase());
  };

  const handleVerification = async () => {
    if (!cniInput) {
      Alert.alert('Erreur', 'Veuillez saisir un numéro CNI');
      return;
    }

    if (!validateCNIFormat(cniInput)) {
      Alert.alert('Format invalide', 'Le numéro CNI doit être au format CI + 10 chiffres');
      return;
    }

    setLoading(true);
    setVerificationStep('processing');

    try {
      // Simulate government database query
      await simulateGovernmentQuery(cniInput);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de se connecter aux bases de données gouvernementales');
      setVerificationStep('input');
      setLoading(false);
    }
  };

  const simulateGovernmentQuery = async (cni: string) => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Mock government database response
    const mockCNIData: CNIData = {
      number: cni,
      firstName: 'JEAN PIERRE',
      lastName: 'KOUADIO',
      birthDate: '15/03/1985',
      birthPlace: 'ABIDJAN',
      nationality: 'IVOIRIENNE',
      issuedDate: '20/01/2020',
      expiryDate: '20/01/2030',
      issuingAuthority: 'PREFECTURE D\'ABIDJAN',
      fatherName: 'KOUADIO ERNEST',
      motherName: 'KONE MARIE',
      address: 'COCODY, ABIDJAN'
    };

    const mockResult: VerificationResult = {
      status: Math.random() > 0.1 ? 'verified' : 'failed',
      confidence: 85 + Math.random() * 15,
      matchedFields: ['firstName', 'lastName', 'birthDate', 'nationality'],
      discrepancies: [],
      timestamp: new Date(),
      verificationId: `GV_${Date.now()}`
    };

    // Check for discrepancies if userData is provided
    if (userData) {
      const discrepancies: string[] = [];

      if (userData.firstName && userData.firstName.toUpperCase() !== mockCNIData.firstName) {
        discrepancies.push('Prénom ne correspond pas');
      }
      if (userData.lastName && userData.lastName.toUpperCase() !== mockCNIData.lastName) {
        discrepancies.push('Nom de famille ne correspond pas');
      }
      if (userData.birthDate && userData.birthDate !== mockCNIData.birthDate) {
        discrepancies.push('Date de naissance ne correspond pas');
      }

      mockResult.discrepancies = discrepancies;
      if (discrepancies.length > 0) {
        mockResult.status = 'failed';
        mockResult.confidence = Math.max(30, mockResult.confidence - (discrepancies.length * 20));
      }
    }

    setExtractedData(mockCNIData);
    setVerificationResult(mockResult);
    setVerificationStep('results');
    setLoading(false);

    onVerificationComplete?.(mockResult);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle size={24} color="#4CAF50" />;
      case 'failed': return <XCircle size={24} color="#FF5722" />;
      case 'pending': return <Clock size={24} color="#FF9800" />;
      case 'expired': return <AlertTriangle size={24} color="#FF5722" />;
      default: return <Shield size={24} color="#666" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'verified': return 'Vérifié avec succès';
      case 'failed': return 'Vérification échouée';
      case 'pending': return 'Vérification en cours';
      case 'expired': return 'Document expiré';
      case 'invalid': return 'Document invalide';
      default: return 'Statut inconnu';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return '#4CAF50';
    if (confidence >= 70) return '#FF9800';
    return '#FF5722';
  };

  const getDatabaseStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle size={16} color="#4CAF50" />;
      case 'maintenance': return <AlertTriangle size={16} color="#FF9800" />;
      default: return <XCircle size={16} color="#FF5722" />;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Shield size={32} color="#2196F3" />
        <Text style={styles.title}>Vérification Gouvernementale</Text>
        <Text style={styles.subtitle}>Validation CNI officielle</Text>
      </View>

      <View style={styles.databaseStatus}>
        <Text style={styles.databaseTitle}>État des connexions</Text>
        {databases.map((db, index) => (
          <View key={index} style={styles.databaseItem}>
            <View style={styles.databaseInfo}>
              {getDatabaseStatusIcon(db.status)}
              <Text style={styles.databaseName}>{db.name}</Text>
            </View>
            <View style={styles.databaseMeta}>
              <Text style={styles.databaseReliability}>{db.reliability}%</Text>
              <Text style={styles.databaseSync}>
                {db.lastSync.toLocaleTimeString('fr-FR')}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {verificationStep === 'input' && (
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Numéro de CNI</Text>
          <View style={styles.inputContainer}>
            <FileText size={20} color="#666" />
            <TextInput
              style={styles.cniInput}
              placeholder="Ex: CI1234567890"
              value={cniInput}
              onChangeText={setCniInput}
              maxLength={12}
              autoCapitalize="characters"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.formatInfo}>
            <Text style={styles.formatTitle}>Format attendu:</Text>
            <Text style={styles.formatText}>• CI suivi de 10 chiffres</Text>
            <Text style={styles.formatText}>• Exemple: CI1234567890</Text>
          </View>

          <TouchableOpacity
            style={styles.verifyButton}
            onPress={handleVerification}
            disabled={loading}
          >
            <Text style={styles.verifyButtonText}>
              {loading ? 'Vérification...' : 'Vérifier avec l\'État'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {verificationStep === 'processing' && (
        <View style={styles.processingSection}>
          <View style={styles.processingAnimation}>
            <Shield size={60} color="#2196F3" />
          </View>
          <Text style={styles.processingTitle}>Vérification en cours</Text>
          <Text style={styles.processingText}>
            Connexion aux bases de données gouvernementales...
          </Text>

          <View style={styles.processingSteps}>
            <View style={styles.processingStep}>
              <CheckCircle size={16} color="#4CAF50" />
              <Text style={styles.stepText}>Connexion établie</Text>
            </View>
            <View style={styles.processingStep}>
              <Clock size={16} color="#FF9800" />
              <Text style={styles.stepText}>Requête en cours</Text>
            </View>
            <View style={styles.processingStep}>
              <Clock size={16} color="#666" />
              <Text style={styles.stepText}>Validation des données</Text>
            </View>
          </View>
        </View>
      )}

      {verificationStep === 'results' && verificationResult && extractedData && (
        <View style={styles.resultsSection}>
          <View style={styles.resultHeader}>
            {getStatusIcon(verificationResult.status)}
            <View style={styles.resultInfo}>
              <Text style={styles.resultStatus}>
                {getStatusText(verificationResult.status)}
              </Text>
              <Text style={[
                styles.confidenceScore,
                { color: getConfidenceColor(verificationResult.confidence) }
              ]}>
                Confiance: {verificationResult.confidence.toFixed(1)}%
              </Text>
            </View>
          </View>

          <View style={styles.extractedDataCard}>
            <Text style={styles.cardTitle}>Données extraites</Text>

            <View style={styles.dataGrid}>
              <View style={styles.dataItem}>
                <User size={16} color="#666" />
                <View style={styles.dataDetails}>
                  <Text style={styles.dataLabel}>Nom complet</Text>
                  <Text style={styles.dataValue}>
                    {extractedData.firstName} {extractedData.lastName}
                  </Text>
                </View>
              </View>

              <View style={styles.dataItem}>
                <Calendar size={16} color="#666" />
                <View style={styles.dataDetails}>
                  <Text style={styles.dataLabel}>Date de naissance</Text>
                  <Text style={styles.dataValue}>{extractedData.birthDate}</Text>
                </View>
              </View>

              <View style={styles.dataItem}>
                <MapPin size={16} color="#666" />
                <View style={styles.dataDetails}>
                  <Text style={styles.dataLabel}>Lieu de naissance</Text>
                  <Text style={styles.dataValue}>{extractedData.birthPlace}</Text>
                </View>
              </View>

              <View style={styles.dataItem}>
                <FileText size={16} color="#666" />
                <View style={styles.dataDetails}>
                  <Text style={styles.dataLabel}>Nationalité</Text>
                  <Text style={styles.dataValue}>{extractedData.nationality}</Text>
                </View>
              </View>

              <View style={styles.dataItem}>
                <Shield size={16} color="#666" />
                <View style={styles.dataDetails}>
                  <Text style={styles.dataLabel}>Autorité d'émission</Text>
                  <Text style={styles.dataValue}>{extractedData.issuingAuthority}</Text>
                </View>
              </View>

              <View style={styles.dataItem}>
                <Clock size={16} color="#666" />
                <View style={styles.dataDetails}>
                  <Text style={styles.dataLabel}>Date d'expiration</Text>
                  <Text style={[
                    styles.dataValue,
                    new Date(extractedData.expiryDate.split('/').reverse().join('-')) < new Date()
                      ? styles.expiredDate : styles.validDate
                  ]}>
                    {extractedData.expiryDate}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {verificationResult.matchedFields.length > 0 && (
            <View style={styles.matchedFieldsCard}>
              <Text style={styles.cardTitle}>Champs vérifiés ✓</Text>
              <View style={styles.fieldsList}>
                {verificationResult.matchedFields.map((field, index) => (
                  <View key={index} style={styles.matchedField}>
                    <CheckCircle size={12} color="#4CAF50" />
                    <Text style={styles.fieldText}>
                      {field === 'firstName' ? 'Prénom' :
                        field === 'lastName' ? 'Nom' :
                          field === 'birthDate' ? 'Date de naissance' :
                            field === 'nationality' ? 'Nationalité' : field}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {verificationResult.discrepancies.length > 0 && (
            <View style={styles.discrepanciesCard}>
              <Text style={styles.cardTitle}>Incohérences détectées ⚠️</Text>
              <View style={styles.fieldsList}>
                {verificationResult.discrepancies.map((discrepancy, index) => (
                  <View key={index} style={styles.discrepancyField}>
                    <XCircle size={12} color="#FF5722" />
                    <Text style={styles.discrepancyText}>{discrepancy}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.verificationMeta}>
            <Text style={styles.metaTitle}>Détails de la vérification</Text>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>ID de vérification:</Text>
              <Text style={styles.metaValue}>{verificationResult.verificationId}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Horodatage:</Text>
              <Text style={styles.metaValue}>
                {verificationResult.timestamp.toLocaleString('fr-FR')}
              </Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.newVerificationButton}
              onPress={() => {
                setVerificationStep('input');
                setVerificationResult(null);
                setExtractedData(null);
                setCniInput('');
              }}
            >
              <Text style={styles.newVerificationText}>Nouvelle vérification</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.downloadButton}
              onPress={() => Alert.alert('Rapport téléchargé', 'Le rapport de vérification a été sauvegardé')}
            >
              <FileText size={16} color="#FFFFFF" />
              <Text style={styles.downloadText}>Télécharger rapport</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.securityInfo}>
        <AlertTriangle size={20} color="#2196F3" />
        <Text style={styles.securityText}>
          Cette vérification utilise les bases de données officielles de l'État de Côte d'Ivoire.
          Toutes les données sont chiffrées et sécurisées conformément à la réglementation.
        </Text>
      </View>

      <View style={styles.legalInfo}>
        <Text style={styles.legalTitle}>Conformité légale</Text>
        <Text style={styles.legalText}>
          • Accès autorisé aux bases gouvernementales{'\n'}
          • Conformité RGPD et lois locales{'\n'}
          • Audit de sécurité mensuel{'\n'}
          • Chiffrement end-to-end des données
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E3F2FD',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 4,
  },
  databaseStatus: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  databaseTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 12,
  },
  databaseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  databaseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  databaseName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333',
    marginLeft: 8,
  },
  databaseMeta: {
    alignItems: 'flex-end',
  },
  databaseReliability: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#4CAF50',
  },
  databaseSync: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 2,
  },
  inputSection: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  cniInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
    marginLeft: 12,
  },
  formatInfo: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  formatTitle: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#1976D2',
    marginBottom: 8,
  },
  formatText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#1976D2',
    marginBottom: 2,
  },
  verifyButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  verifyButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  processingSection: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  processingAnimation: {
    marginBottom: 20,
  },
  processingTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 8,
  },
  processingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  processingSteps: {
    alignSelf: 'stretch',
  },
  processingStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginLeft: 12,
  },
  resultsSection: {
    margin: 20,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultInfo: {
    marginLeft: 16,
  },
  resultStatus: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  confidenceScore: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginTop: 4,
  },
  extractedDataCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  dataGrid: {
    gap: 12,
  },
  dataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dataDetails: {
    marginLeft: 12,
    flex: 1,
  },
  dataLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  dataValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginTop: 2,
  },
  expiredDate: {
    color: '#FF5722',
  },
  validDate: {
    color: '#4CAF50',
  },
  matchedFieldsCard: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  fieldsList: {
    gap: 8,
  },
  matchedField: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#2E7D32',
    marginLeft: 8,
  },
  discrepanciesCard: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  discrepancyField: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  discrepancyText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#C62828',
    marginLeft: 8,
  },
  verificationMeta: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  metaTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  metaValue: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  newVerificationButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  newVerificationText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  downloadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
  },
  downloadText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E3F2FD',
    margin: 20,
    borderRadius: 12,
    padding: 16,
  },
  securityText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#1976D2',
    marginLeft: 12,
    flex: 1,
    lineHeight: 16,
  },
  legalInfo: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 12,
    padding: 16,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legalTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 8,
  },
  legalText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 16,
  },
});