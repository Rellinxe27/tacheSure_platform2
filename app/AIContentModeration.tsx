import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Shield, AlertTriangle, Eye, TrendingDown, MessageCircle, Image as ImageIcon, Mic } from 'lucide-react-native';

interface ModerationResult {
  id: string;
  content: string;
  type: 'text' | 'image' | 'voice';
  severity: 'low' | 'medium' | 'high' | 'critical';
  categories: string[];
  confidence: number;
  action: 'allow' | 'warn' | 'block' | 'review';
  timestamp: Date;
  userId: string;
  chatId?: string;
}

interface ModerationStats {
  totalMessages: number;
  blockedMessages: number;
  warningsIssued: number;
  flaggedUsers: number;
  accuracy: number;
}

export default function AIContentModeration() {
  const [moderationResults, setModerationResults] = useState<ModerationResult[]>([]);
  const [stats, setStats] = useState<ModerationStats>({
    totalMessages: 12847,
    blockedMessages: 234,
    warningsIssued: 89,
    flaggedUsers: 12,
    accuracy: 97.8
  });
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'blocked' | 'flagged'>('all');

  useEffect(() => {
    // Simulate real-time moderation results
    const mockResults: ModerationResult[] = [
      {
        id: 'mod_001',
        content: 'Message contenant du langage inapproprié',
        type: 'text',
        severity: 'high',
        categories: ['Langage inapproprié', 'Harcèlement'],
        confidence: 94.5,
        action: 'block',
        timestamp: new Date(),
        userId: 'user_123',
        chatId: 'chat_456'
      },
      {
        id: 'mod_002',
        content: 'Image potentiellement inappropriée détectée',
        type: 'image',
        severity: 'medium',
        categories: ['Contenu adulte'],
        confidence: 78.2,
        action: 'review',
        timestamp: new Date(Date.now() - 3600000),
        userId: 'user_789'
      },
      {
        id: 'mod_003',
        content: 'Tentative de partage d\'informations personnelles',
        type: 'text',
        severity: 'medium',
        categories: ['Protection données'],
        confidence: 85.1,
        action: 'warn',
        timestamp: new Date(Date.now() - 7200000),
        userId: 'user_321'
      }
    ];
    setModerationResults(mockResults);
  }, []);

  const moderateContent = async (content: string, type: 'text' | 'image' | 'voice'): Promise<ModerationResult> => {
    // AI moderation algorithm simulation
    const inappropriateWords = ['merde', 'con', 'salaud', 'putain'];
    const sensitivePatterns = [
      /\b\d{10}\b/, // Phone numbers
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Emails
      /\bCI\d{10}\b/ // CNI numbers
    ];

    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let categories: string[] = [];
    let confidence = 0;
    let action: 'allow' | 'warn' | 'block' | 'review' = 'allow';

    if (type === 'text') {
      // Check for inappropriate language
      const hasInappropriateWords = inappropriateWords.some(word =>
        content.toLowerCase().includes(word)
      );

      if (hasInappropriateWords) {
        categories.push('Langage inapproprié');
        severity = 'high';
        confidence = 92;
        action = 'block';
      }

      // Check for sensitive information
      const hasSensitiveInfo = sensitivePatterns.some(pattern =>
        pattern.test(content)
      );

      if (hasSensitiveInfo) {
        categories.push('Protection données');
        severity = severity === 'low' ? 'medium' : severity;
        confidence = Math.max(confidence, 88);
        action = action === 'allow' ? 'warn' : action;
      }

      // Check for spam patterns
      if (content.length > 500 || /(.)\1{10,}/.test(content)) {
        categories.push('Spam');
        severity = 'medium';
        confidence = Math.max(confidence, 75);
        action = 'warn';
      }
    }

    return {
      id: `mod_${Date.now()}`,
      content: content.substring(0, 50) + '...',
      type,
      severity,
      categories: categories.length > 0 ? categories : ['Contenu sûr'],
      confidence: confidence || 95,
      action,
      timestamp: new Date(),
      userId: 'current_user'
    };
  };

  const handleManualReview = (resultId: string, decision: 'approve' | 'reject') => {
    setModerationResults(prev => prev.map(result =>
      result.id === resultId
        ? { ...result, action: decision === 'approve' ? 'allow' : 'block' }
        : result
    ));
    Alert.alert('Décision enregistrée', `Contenu ${decision === 'approve' ? 'approuvé' : 'bloqué'}`);
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'allow': return '#4CAF50';
      case 'warn': return '#FF9800';
      case 'block': return '#FF5722';
      case 'review': return '#2196F3';
      default: return '#666';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#D32F2F';
      case 'high': return '#FF5722';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#666';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return <MessageCircle size={16} color="#666" />;
      case 'image': return <ImageIcon size={16} color="#666" />;
      case 'voice': return <Mic size={16} color="#666" />;
      default: return <Shield size={16} color="#666" />;
    }
  };

  const filteredResults = moderationResults.filter(result => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'blocked') return result.action === 'block';
    if (selectedFilter === 'flagged') return result.action === 'review' || result.action === 'warn';
    return true;
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Shield size={32} color="#2196F3" />
        <Text style={styles.title}>Modération IA</Text>
        <Text style={styles.subtitle}>Protection automatique du contenu</Text>
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Statistiques de modération</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalMessages.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Messages analysés</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.blockedMessages}</Text>
            <Text style={styles.statLabel}>Bloqués</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.warningsIssued}</Text>
            <Text style={styles.statLabel}>Avertissements</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.accuracy}%</Text>
            <Text style={styles.statLabel}>Précision IA</Text>
          </View>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filtrer:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'all', label: 'Tout' },
            { key: 'blocked', label: 'Bloqués' },
            { key: 'flagged', label: 'Signalés' }
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                selectedFilter === filter.key && styles.filterButtonActive
              ]}
              onPress={() => setSelectedFilter(filter.key as any)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedFilter === filter.key && styles.filterButtonTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.resultsSection}>
        <Text style={styles.sectionTitle}>Résultats de modération ({filteredResults.length})</Text>

        {filteredResults.map((result) => (
          <View key={result.id} style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <View style={styles.resultInfo}>
                {getTypeIcon(result.type)}
                <View style={styles.resultDetails}>
                  <Text style={styles.resultContent}>{result.content}</Text>
                  <Text style={styles.resultMeta}>
                    {result.timestamp.toLocaleString('fr-FR')} • {result.userId}
                  </Text>
                </View>
              </View>

              <View style={styles.resultBadges}>
                <View style={[
                  styles.severityBadge,
                  { backgroundColor: getSeverityColor(result.severity) }
                ]}>
                  <Text style={styles.badgeText}>
                    {result.severity === 'critical' ? 'CRITIQUE' :
                      result.severity === 'high' ? 'ÉLEVÉ' :
                        result.severity === 'medium' ? 'MOYEN' : 'FAIBLE'}
                  </Text>
                </View>

                <View style={[
                  styles.actionBadge,
                  { backgroundColor: getActionColor(result.action) }
                ]}>
                  <Text style={styles.badgeText}>
                    {result.action === 'allow' ? 'AUTORISÉ' :
                      result.action === 'warn' ? 'AVERTISSEMENT' :
                        result.action === 'block' ? 'BLOQUÉ' : 'RÉVISION'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.categoriesContainer}>
              <Text style={styles.categoriesLabel}>Catégories détectées:</Text>
              <View style={styles.categoriesList}>
                {result.categories.map((category, index) => (
                  <View key={index} style={styles.categoryTag}>
                    <Text style={styles.categoryText}>{category}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.confidenceContainer}>
              <Text style={styles.confidenceLabel}>Confiance IA:</Text>
              <View style={styles.confidenceBar}>
                <View
                  style={[
                    styles.confidenceFill,
                    {
                      width: `${result.confidence}%`,
                      backgroundColor: result.confidence > 90 ? '#4CAF50' :
                        result.confidence > 70 ? '#FF9800' : '#FF5722'
                    }
                  ]}
                />
              </View>
              <Text style={styles.confidenceValue}>{result.confidence.toFixed(1)}%</Text>
            </View>

            {result.action === 'review' && (
              <View style={styles.reviewActions}>
                <TouchableOpacity
                  style={styles.approveButton}
                  onPress={() => handleManualReview(result.id, 'approve')}
                >
                  <Text style={styles.reviewButtonText}>Approuver</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() => handleManualReview(result.id, 'reject')}
                >
                  <Text style={styles.reviewButtonText}>Rejeter</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </View>

      <View style={styles.aiInsights}>
        <Text style={styles.aiTitle}>Insights IA</Text>
        <View style={styles.insightCard}>
          <TrendingDown size={20} color="#4CAF50" />
          <Text style={styles.insightText}>
            Les violations de contenu ont diminué de 23% grâce à l'amélioration des algorithmes.
          </Text>
        </View>
        <View style={styles.insightCard}>
          <AlertTriangle size={20} color="#FF9800" />
          <Text style={styles.insightText}>
            Nouveau pattern détecté: tentatives de contournement avec caractères spéciaux.
          </Text>
        </View>
      </View>

      <View style={styles.configSection}>
        <Text style={styles.configTitle}>Configuration de modération</Text>
        <TouchableOpacity style={styles.configButton}>
          <Eye size={16} color="#2196F3" />
          <Text style={styles.configButtonText}>Ajuster sensibilité</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.configButton}>
          <Shield size={16} color="#2196F3" />
          <Text style={styles.configButtonText}>Mots-clés personnalisés</Text>
        </TouchableOpacity>
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
  statsCard: {
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
  statsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  filterLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#2196F3',
  },
  filterButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  resultsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  resultInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  resultDetails: {
    marginLeft: 12,
    flex: 1,
  },
  resultContent: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333',
    marginBottom: 4,
  },
  resultMeta: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  resultBadges: {
    alignItems: 'flex-end',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  actionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  categoriesContainer: {
    marginBottom: 12,
  },
  categoriesLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 8,
  },
  categoriesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryTag: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  confidenceLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginRight: 12,
  },
  confidenceBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginRight: 12,
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 3,
  },
  confidenceValue: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  reviewActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  approveButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  reviewButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  aiInsights: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  aiTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginLeft: 12,
    flex: 1,
    lineHeight: 16,
  },
  configSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  configTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  configButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  configButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#2196F3',
    marginLeft: 12,
  },
});