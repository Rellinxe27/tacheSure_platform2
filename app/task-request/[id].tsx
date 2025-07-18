// app/task-request/[id].tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  DollarSign,
  User,
  Star,
  TrendingUp,
  Calendar,
  MessageCircle,
  Shield
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/app/contexts/AuthContext';
import { formatCurrency, formatTimeAgo } from '@/utils/formatting';
import { NotificationService } from '@/utils/notificationService';
import TrustBadge from '@/components/TrustBadge';

interface TaskRequest {
  id: string;
  title: string;
  description: string;
  budget_min: number;
  budget_max: number;
  scheduled_at: string;
  urgency: string;
  address: any;
  client: {
    id: string;
    full_name: string;
    avatar_url?: string;
    trust_score: number;
    is_verified: boolean;
    verification_level: string;
  };
  category: {
    name_fr: string;
    icon: string;
  };
}

interface BusinessIntelligence {
  clientStats: {
    totalTasksPosted: number;
    completionRate: number;
    averageRating: number;
    avgBudget: number;
    paymentReliability: number;
  };
  marketInsights: {
    categoryDemand: number;
    priceCompetitiveness: 'low' | 'competitive' | 'high';
    urgencyTrend: string;
    locationDemand: number;
  };
  recommendations: {
    acceptanceScore: number;
    riskLevel: 'low' | 'medium' | 'high';
    suggestedAction: string;
    reasons: string[];
  };
}

export default function TaskRequestScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user, profile } = useAuth();

  const [task, setTask] = useState<TaskRequest | null>(null);
  const [businessIntel, setBusinessIntel] = useState<BusinessIntelligence | null>(null);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTaskRequest();
    }
  }, [id]);

  useEffect(() => {
    if (task?.client?.id) {
      generateBusinessIntelligence();
    }
  }, [task]);

  const fetchTaskRequest = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          client:profiles!client_id (
            id, full_name, avatar_url, trust_score, is_verified, verification_level
          ),
          categories (name_fr, icon)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setTask(data);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger la demande');
    }
  };

  const generateBusinessIntelligence = async () => {
    try {
      // Fetch client statistics
      const { data: clientTasks } = await supabase
        .from('tasks')
        .select('status, budget_min, budget_max')
        .eq('client_id', task?.client?.id);

      const { data: clientReviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('reviewee_id', task?.client?.id);

      const { data: payments } = await supabase
        .from('payments')
        .select('status')
        .eq('payer_id', task?.client?.id);

      // Calculate client stats
      const totalTasks = clientTasks?.length || 0;
      const completedTasks = clientTasks?.filter(t => t.status === 'completed').length || 0;
      const avgRating = clientReviews?.length ?
        clientReviews.reduce((sum, r) => sum + r.rating, 0) / clientReviews.length : 0;
      const avgBudget = clientTasks?.length ?
        clientTasks.reduce((sum, t) => sum + ((t.budget_min + t.budget_max) / 2), 0) / clientTasks.length : 0;
      const successfulPayments = payments?.filter(p => p.status === 'completed').length || 0;
      const paymentReliability = payments?.length ? (successfulPayments / payments.length) * 100 : 0;

      // Market insights
      const { data: categoryTasks } = await supabase
        .from('tasks')
        .select('id')
        .eq('category_id', task?.category_id)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const categoryDemand = categoryTasks?.length || 0;

      // Calculate acceptance score and risk
      const acceptanceFactors = [
        task?.client?.trust_score || 0,
        Math.min(avgRating * 20, 100),
        Math.min(completedTasks * 10, 100),
        paymentReliability,
        Math.min(categoryDemand * 5, 100)
      ];

      const acceptanceScore = Math.round(
        acceptanceFactors.reduce((sum, factor) => sum + factor, 0) / acceptanceFactors.length
      );

      const riskLevel = acceptanceScore >= 70 ? 'low' :
        acceptanceScore >= 50 ? 'medium' : 'high';

      const recommendations = generateRecommendations(acceptanceScore, task, {
        totalTasks,
        completionRate: totalTasks ? (completedTasks / totalTasks) * 100 : 0,
        paymentReliability,
        avgRating
      });

      setBusinessIntel({
        clientStats: {
          totalTasksPosted: totalTasks,
          completionRate: totalTasks ? (completedTasks / totalTasks) * 100 : 0,
          averageRating: avgRating,
          avgBudget,
          paymentReliability
        },
        marketInsights: {
          categoryDemand,
          priceCompetitiveness: getBudgetCompetitiveness(task?.budget_min || 0, avgBudget),
          urgencyTrend: task?.urgency || 'normal',
          locationDemand: 85 // Mock data
        },
        recommendations: {
          acceptanceScore,
          riskLevel,
          suggestedAction: recommendations.action,
          reasons: recommendations.reasons
        }
      });

    } catch (error) {
      console.error('Error generating business intelligence:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBudgetCompetitiveness = (taskBudget: number, marketAvg: number): 'low' | 'competitive' | 'high' => {
    if (taskBudget < marketAvg * 0.8) return 'low';
    if (taskBudget > marketAvg * 1.2) return 'high';
    return 'competitive';
  };

  const generateRecommendations = (score: number, task: any, stats: any) => {
    const reasons = [];
    let action = 'ACCEPTER';

    if (stats.completionRate > 80) reasons.push('Taux de completion élevé');
    if (stats.paymentReliability > 90) reasons.push('Paiements fiables');
    if (task?.client?.trust_score > 70) reasons.push('Client de confiance');
    if (stats.averageRating > 4) reasons.push('Bien noté par la communauté');

    if (score < 50) {
      action = 'DÉCLINER';
      reasons.length = 0;
      if (stats.completionRate < 50) reasons.push('Faible taux de completion');
      if (stats.paymentReliability < 70) reasons.push('Historique de paiement irrégulier');
      if (task?.client?.trust_score < 50) reasons.push('Score de confiance faible');
    } else if (score < 70) {
      action = 'NÉGOCIER';
      reasons.push('Profil mitigé - négociation recommandée');
    }

    return { action, reasons };
  };

  const handleResponse = async (response: 'accept' | 'decline') => {
    setResponding(true);
    try {
      const status = response === 'accept' ? 'selected' : 'cancelled';

      // Update task status
      const { error } = await supabase
        .from('tasks')
        .update({
          status,
          responded_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      // Notify client
      await NotificationService.notifyClientOfBookingUpdate(
        task?.client?.id || '',
        profile?.full_name || 'Un prestataire',
        task?.title || 'Votre demande',
        response === 'accept' ? 'accepted' : 'rejected',
        id as string
      );

      Alert.alert(
        'Réponse envoyée',
        response === 'accept' ?
          'Vous avez accepté cette demande. Le client sera notifié.' :
          'Vous avez décliné cette demande.',
        [
          { text: 'OK', onPress: () => router.back() }
        ]
      );

    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'envoyer votre réponse');
    } finally {
      setResponding(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF7A00" />
        <Text style={styles.loadingText}>Analyse de la demande...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Demande de service</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Client Profile */}
        <View style={styles.clientCard}>
          <View style={styles.clientHeader}>
            <User size={20} color="#FF7A00" />
            <Text style={styles.clientName}>{task?.client?.full_name}</Text>
            <TrustBadge
              trustScore={task?.client?.trust_score || 0}
              verificationLevel={task?.client?.verification_level as any}
              isVerified={task?.client?.is_verified || false}
              size="small"
            />
          </View>

          {businessIntel && (
            <View style={styles.clientStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{businessIntel.clientStats.totalTasksPosted}</Text>
                <Text style={styles.statLabel}>Tâches postées</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{businessIntel.clientStats.completionRate.toFixed(0)}%</Text>
                <Text style={styles.statLabel}>Taux de completion</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{businessIntel.clientStats.averageRating.toFixed(1)}</Text>
                <Text style={styles.statLabel}>Note moyenne</Text>
              </View>
            </View>
          )}
        </View>

        {/* Task Details */}
        <View style={styles.taskCard}>
          <Text style={styles.taskTitle}>{task?.title}</Text>
          <Text style={styles.taskDescription}>{task?.description}</Text>

          <View style={styles.taskMeta}>
            <View style={styles.metaItem}>
              <DollarSign size={16} color="#FF7A00" />
              <Text style={styles.metaText}>
                {formatCurrency(task?.budget_min || 0)} - {formatCurrency(task?.budget_max || 0)}
              </Text>
            </View>

            <View style={styles.metaItem}>
              <Calendar size={16} color="#FF7A00" />
              <Text style={styles.metaText}>
                {task?.scheduled_at ? new Date(task.scheduled_at).toLocaleString('fr-FR') : 'Non spécifié'}
              </Text>
            </View>

            <View style={styles.metaItem}>
              <MapPin size={16} color="#FF7A00" />
              <Text style={styles.metaText}>{task?.address?.street || 'Adresse non spécifiée'}</Text>
            </View>
          </View>
        </View>

        {/* Business Intelligence */}
        {businessIntel && (
          <View style={styles.biCard}>
            <View style={styles.biHeader}>
              <TrendingUp size={20} color="#FF7A00" />
              <Text style={styles.biTitle}>Analyse intelligente</Text>
            </View>

            <View style={[
              styles.recommendationCard,
              businessIntel.recommendations.riskLevel === 'low' ? styles.lowRisk :
                businessIntel.recommendations.riskLevel === 'medium' ? styles.mediumRisk :
                  styles.highRisk
            ]}>
              <Text style={styles.recommendationScore}>
                Score d'acceptation: {businessIntel.recommendations.acceptanceScore}%
              </Text>
              <Text style={styles.recommendationAction}>
                Recommandation: {businessIntel.recommendations.suggestedAction}
              </Text>

              <View style={styles.reasonsList}>
                {businessIntel.recommendations.reasons.map((reason, index) => (
                  <Text key={index} style={styles.reasonItem}>• {reason}</Text>
                ))}
              </View>
            </View>

            <View style={styles.marketInsights}>
              <Text style={styles.insightsTitle}>Tendances du marché</Text>
              <View style={styles.insightRow}>
                <Text style={styles.insightLabel}>Demande catégorie:</Text>
                <Text style={styles.insightValue}>{businessIntel.marketInsights.categoryDemand} demandes/mois</Text>
              </View>
              <View style={styles.insightRow}>
                <Text style={styles.insightLabel}>Prix proposé:</Text>
                <Text style={[
                  styles.insightValue,
                  businessIntel.marketInsights.priceCompetitiveness === 'high' ? styles.highPrice :
                    businessIntel.marketInsights.priceCompetitiveness === 'low' ? styles.lowPrice :
                      styles.competitivePrice
                ]}>
                  {businessIntel.marketInsights.priceCompetitiveness === 'high' ? 'Au-dessus du marché' :
                    businessIntel.marketInsights.priceCompetitiveness === 'low' ? 'En-dessous du marché' :
                      'Conforme au marché'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => router.push(`/chat?clientId=${task?.client?.id}`)}
          >
            <MessageCircle size={20} color="#FF7A00" />
            <Text style={styles.contactButtonText}>Discuter</Text>
          </TouchableOpacity>

          <View style={styles.responseButtons}>
            <TouchableOpacity
              style={[styles.responseButton, styles.declineButton]}
              onPress={() => handleResponse('decline')}
              disabled={responding}
            >
              <XCircle size={20} color="#FFFFFF" />
              <Text style={styles.responseButtonText}>Décliner</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.responseButton, styles.acceptButton]}
              onPress={() => handleResponse('accept')}
              disabled={responding}
            >
              {responding ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <CheckCircle size={20} color="#FFFFFF" />
              )}
              <Text style={styles.responseButtonText}>Accepter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 12,
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
  clientCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  clientName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  clientStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FF7A00',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 2,
  },
  taskCard: {
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
  taskTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 8,
  },
  taskDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  taskMeta: {
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333',
    marginLeft: 8,
  },
  biCard: {
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
  biHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  biTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginLeft: 8,
  },
  recommendationCard: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  lowRisk: {
    backgroundColor: '#E8F5E8',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  mediumRisk: {
    backgroundColor: '#FFF3E0',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  highRisk: {
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: '#FF5722',
  },
  recommendationScore: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  recommendationAction: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginBottom: 8,
  },
  reasonsList: {
    gap: 4,
  },
  reasonItem: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  marketInsights: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 16,
  },
  insightsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 8,
  },
  insightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  insightLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  insightValue: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#333',
  },
  highPrice: { color: '#4CAF50' },
  lowPrice: { color: '#FF5722' },
  competitivePrice: { color: '#FF9800' },
  actions: {
    marginBottom: 40,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 16,
  },
  contactButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FF7A00',
    marginLeft: 8,
  },
  responseButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  responseButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  declineButton: {
    backgroundColor: '#FF5722',
  },
  responseButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});