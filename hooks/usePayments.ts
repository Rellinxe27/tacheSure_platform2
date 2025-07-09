// hooks/usePayments.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { useAuth } from '@/app/contexts/AuthContext';

type Payment = Database['public']['Tables']['payments']['Row'];

export const usePayments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarned: 0,
    totalSpent: 0,
    pendingPayments: 0,
  });

  useEffect(() => {
    if (!user) return;

    const fetchPayments = async () => {
      try {
        const { data, error } = await supabase
          .from('payments')
          .select('*')
          .or(`payer_id.eq.${user.id},payee_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching payments:', error);
        } else {
          setPayments(data || []);

          // Calculate stats
          const earned = data?.filter(p => p.payee_id === user.id && p.status === 'completed')
            .reduce((sum, p) => sum + (p.net_amount || 0), 0) || 0;

          const spent = data?.filter(p => p.payer_id === user.id && p.status === 'completed')
            .reduce((sum, p) => sum + p.amount, 0) || 0;

          const pending = data?.filter(p =>
            (p.payer_id === user.id || p.payee_id === user.id) &&
            ['pending', 'processing'].includes(p.status)
          ).length || 0;

          setStats({
            totalEarned: earned,
            totalSpent: spent,
            pendingPayments: pending,
          });
        }
      } catch (err) {
        console.error('Error fetching payments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();

    // Subscribe to real-time payment updates
    const subscription = supabase
      .channel('payments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
          filter: `payer_id=eq.${user.id}`,
        },
        () => {
          fetchPayments(); // Refetch on any payment change
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
          filter: `payee_id=eq.${user.id}`,
        },
        () => {
          fetchPayments(); // Refetch on any payment change
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const createPayment = async (paymentData: Database['public']['Tables']['payments']['Insert']) => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert(paymentData)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      setPayments(prev => [data, ...prev]);
      return { data };
    } catch (err) {
      return { error: 'Failed to create payment' };
    }
  };

  const updatePaymentStatus = async (paymentId: string, status: Database['public']['Enums']['payment_status']) => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      setPayments(prev => prev.map(p => p.id === paymentId ? data : p));
      return { data };
    } catch (err) {
      return { error: 'Failed to update payment status' };
    }
  };

  return {
    payments,
    loading,
    stats,
    createPayment,
    updatePaymentStatus,
  };
};