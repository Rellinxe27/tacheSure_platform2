// hooks/useVerification.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { useAuth } from '@/app/contexts/AuthContext';

type VerificationDocument = Database['public']['Tables']['verification_documents']['Row'];

export const useVerification = () => {
  const { user, profile } = useAuth();
  const [documents, setDocuments] = useState<VerificationDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchDocuments = async () => {
      try {
        const { data, error } = await supabase
          .from('verification_documents')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching verification documents:', error);
        } else {
          setDocuments(data || []);
        }
      } catch (err) {
        console.error('Error fetching verification documents:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [user]);

  const uploadDocument = async (documentData: {
    document_type: string;
    document_url: string;
    verification_data?: any;
  }) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('verification_documents')
        .insert({
          user_id: user.id,
          document_type: documentData.document_type,
          document_url: documentData.document_url,
          verification_data: documentData.verification_data,
          verification_status: 'pending',
        })
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      setDocuments(prev => [data, ...prev]);
      return { data };
    } catch (err) {
      return { error: 'Failed to upload document' };
    }
  };

  const getVerificationProgress = () => {
    const requiredDocs = profile?.role === 'provider'
      ? ['cni', 'photo', 'address']
      : ['photo'];

    const submittedDocs = documents.filter(doc =>
      requiredDocs.includes(doc.document_type) &&
      ['approved', 'pending', 'submitted'].includes(doc.verification_status)
    );

    return {
      completed: submittedDocs.length,
      total: requiredDocs.length,
      percentage: Math.round((submittedDocs.length / requiredDocs.length) * 100),
      isComplete: submittedDocs.length === requiredDocs.length,
    };
  };

  return {
    documents,
    loading,
    uploadDocument,
    getVerificationProgress,
  };
};