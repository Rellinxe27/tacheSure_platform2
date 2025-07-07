import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, DollarSign, TrendingUp, Calendar, Download, Eye } from 'lucide-react-native';

interface Transaction {
  id: string;
  date: string;
  client: string;
  service: string;
  amount: number;
  status: 'completed' | 'pending' | 'processing';
  commission: number;
  netAmount: number;
}

export default function EarningsScreen() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const earnings = {
    total: 567000,
    thisMonth: 125000,
    pending: 45000,
    commission: 23500,
    net: 101500
  };

  const transactions: Transaction[] = [
    {
      id: '1',
      date: '2024-01-15',
      client: 'Marie Kouassi',
      service: 'Réparation plomberie',
      amount: 25000,
      status: 'completed',
      commission: 2500,
      netAmount: 22500
    },
    {
      id: '2',
      date: '2024-01-14',
      client: 'Jean Konan',
      service: 'Installation sanitaire',
      amount: 55000,
      status: 'processing',
      commission: 5500,
      netAmount: 49500
    },
    {
      id: '3',
      date: '2024-01-13',
      client: 'Fatou Diabaté',
      service: 'Débouchage',
      amount: 15000,
      status: 'completed',
      commission: 1500,
      netAmount: 13500
    },
    {
      id: '4',
      date: '2024-01-12',
      client: 'Yves Touré',
      service: 'Maintenance',
      amount: 30000,
      status: 'pending',
      commission: 3000,
      netAmount: 27000
    }
  ];

  const monthlyData = [
    { month: 'Jan', amount: 125000 },
    { month: 'Fév', amount: 98000 },
    { month: 'Mar', amount: 142000 },
    { month: 'Avr', amount: 87000 },
    { month: 'Mai', amount: 115000 },
    { month: 'Jun', amount: 156000 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'processing': return '#FF9800';
      case 'pending': return '#2196F3';
      default: return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Complété';
      case 'processing': return 'En traitement';
      case 'pending': return 'En attente';
      default: return status;
    }
  };

  const handleWithdraw = () => {
    router.push('/withdraw-earnings');
  };

  const handleViewTransaction = (transactionId: string) => {
    router.push(`/transaction-details?id=${transactionId}`);
  };

  const handleDownloadReport = () => {
    // In real app, would generate and download PDF report
    alert('Rapport téléchargé');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes gains</Text>
        <TouchableOpacity onPress={handleDownloadReport}>
          <Download size={24} color="#FF7A00" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <View style={styles.totalEarnings}>
            <DollarSign size={32} color="#4CAF50" />
            <View style={styles.totalInfo}>
              <Text style={styles.totalAmount}>{earnings.total.toLocaleString()} FCFA</Text>
              <Text style={styles.totalLabel}>Gains totaux</Text>
            </View>
          </View>

          <View style={styles.earningsBreakdown}>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownValue}>{earnings.thisMonth.toLocaleString()}</Text>
              <Text style={styles.breakdownLabel}>Ce mois</Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownValue}>{earnings.pending.toLocaleString()}</Text>
              <Text style={styles.breakdownLabel}>En attente</Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownValue}>{earnings.net.toLocaleString()}</Text>
              <Text style={styles.breakdownLabel}>Disponible</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.withdrawButton} onPress={handleWithdraw}>
            <Text style={styles.withdrawButtonText}>Retirer les gains</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.periodSelector}>
          {[
            { key: 'week', label: 'Semaine' },
            { key: 'month', label: 'Mois' },
            { key: 'year', label: 'Année' }
          ].map((period) => (
            <TouchableOpacity
              key={period.key}
              style={[
                styles.periodButton,
                selectedPeriod === period.key && styles.activePeriodButton
              ]}
              onPress={() => setSelectedPeriod(period.key)}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period.key && styles.activePeriodButtonText
              ]}>
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Évolution des gains</Text>
            <TrendingUp size={20} color="#4CAF50" />
          </View>

          <View style={styles.chart}>
            {monthlyData.map((data, index) => (
              <View key={index} style={styles.chartBar}>
                <View
                  style={[
                    styles.bar,
                    { height: (data.amount / 160000) * 100 }
                  ]}
                />
                <Text style={styles.barLabel}>{data.month}</Text>
                <Text style={styles.barValue}>{(data.amount / 1000)}k</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.transactionsSection}>
          <Text style={styles.sectionTitle}>Transactions récentes</Text>

          {transactions.map((transaction) => (
            <TouchableOpacity
              key={transaction.id}
              style={styles.transactionCard}
              onPress={() => handleViewTransaction(transaction.id)}
            >
              <View style={styles.transactionHeader}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionClient}>{transaction.client}</Text>
                  <Text style={styles.transactionService}>{transaction.service}</Text>
                  <Text style={styles.transactionDate}>{transaction.date}</Text>
                </View>

                <View style={styles.transactionAmounts}>
                  <Text style={styles.grossAmount}>{transaction.amount.toLocaleString()} FCFA</Text>
                  <Text style={styles.commission}>-{transaction.commission.toLocaleString()} (commission)</Text>
                  <Text style={styles.netAmount}>{transaction.netAmount.toLocaleString()} FCFA</Text>
                </View>
              </View>

              <View style={styles.transactionFooter}>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(transaction.status) }
                ]}>
                  <Text style={styles.statusText}>{getStatusText(transaction.status)}</Text>
                </View>

                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => handleViewTransaction(transaction.id)}
                >
                  <Eye size={14} color="#666" />
                  <Text style={styles.viewButtonText}>Voir détails</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Statistiques</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>23</Text>
              <Text style={styles.statLabel}>Tâches ce mois</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>5,435</Text>
              <Text style={styles.statLabel}>Gain moyen</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>4.8</Text>
              <Text style={styles.statLabel}>Note moyenne</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>12%</Text>
              <Text style={styles.statLabel}>Croissance</Text>
            </View>
          </View>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionButton}>
            <Calendar size={20} color="#FFFFFF" />
            <Text style={styles.quickActionText}>Planifier retrait</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionButton}>
            <Download size={20} color="#FFFFFF" />
            <Text style={styles.quickActionText}>Exporter données</Text>
          </TouchableOpacity>
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
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  totalEarnings: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  totalInfo: {
    marginLeft: 16,
  },
  totalAmount: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#333',
  },
  totalLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 4,
  },
  earningsBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  breakdownItem: {
    alignItems: 'center',
  },
  breakdownValue: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#333',
  },
  breakdownLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 4,
  },
  withdrawButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  withdrawButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activePeriodButton: {
    backgroundColor: '#FF7A00',
  },
  periodButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  activePeriodButtonText: {
    color: '#FFFFFF',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    paddingBottom: 20,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    backgroundColor: '#FF7A00',
    width: 20,
    borderRadius: 2,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 2,
  },
  barValue: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  transactionsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  transactionCard: {
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
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionClient: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  transactionService: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 2,
  },
  transactionDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#999',
    marginTop: 4,
  },
  transactionAmounts: {
    alignItems: 'flex-end',
  },
  grossAmount: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  commission: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#FF5722',
    marginTop: 2,
  },
  netAmount: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#4CAF50',
    marginTop: 4,
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  viewButtonText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginLeft: 4,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
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
    color: '#FF7A00',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF7A00',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  quickActionText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});