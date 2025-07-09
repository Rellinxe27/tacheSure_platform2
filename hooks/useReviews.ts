// hooks/useReviews.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

type Review = Database['public']['Tables']['reviews']['Row'];

export const useReviews = (userId?: string) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });

  useEffect(() => {
    if (!userId) return;

    const fetchReviews = async () => {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('reviewee_id', userId)
          .eq('is_public', true)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching reviews:', error);
        } else {
          setReviews(data || []);

          // Calculate stats
          const totalReviews = data?.length || 0;
          const averageRating = totalReviews > 0
            ? data.reduce((sum, review) => sum + review.rating, 0) / totalReviews
            : 0;

          const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
          data?.forEach(review => {
            ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
          });

          setStats({
            averageRating: Math.round(averageRating * 10) / 10,
            totalReviews,
            ratingDistribution,
          });
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [userId]);

  const createReview = async (reviewData: Database['public']['Tables']['reviews']['Insert']) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert(reviewData)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      setReviews(prev => [data, ...prev]);
      return { data };
    } catch (err) {
      return { error: 'Failed to create review' };
    }
  };

  return {
    reviews,
    loading,
    stats,
    createReview,
  };
};