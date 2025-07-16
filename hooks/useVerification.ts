// hooks/useVerification.ts - Fixed role-based verification steps
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { useAuth } from '@/app/contexts/AuthContext';

type VerificationDocument = Database['public']['Tables']['verification_documents']['Row'];
type ProfessionalReference = Database['public']['Tables']['professional_references']['Row'];

interface VerificationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  level: number;
  required: boolean;
  document?: VerificationDocument;
  references?: ProfessionalReference[];
}

interface VerificationStats {
  currentLevel: number;
  trustScore: number;
  completedSteps: number;
  totalSteps: number;
  nextRequiredStep?: VerificationStep;
}

export const useVerification = () => {
  const { user, profile, updateProfile } = useAuth();
  const [documents, setDocuments] = useState<VerificationDocument[]>([]);
  const [references, setReferences] = useState<ProfessionalReference[]>([]);
  const [verificationSteps, setVerificationSteps] = useState<VerificationStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<VerificationStats>({
    currentLevel: 1,
    trustScore: 0,
    completedSteps: 0,
    totalSteps: 0
  });

  useEffect(() => {
    if (!user) return;

    fetchVerificationData();

    // Real-time subscription for verification updates
    const channel = supabase
      .channel(`verification-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'verification_documents',
          filter: `user_id=eq.${user.id}`
        },
        () => fetchVerificationData()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'professional_references',
          filter: `user_id=eq.${user.id}`
        },
        () => fetchVerificationData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, profile]);

  const fetchVerificationData = async () => {
    if (!user || !profile) return; // Wait for profile to be available

    try {
      setLoading(true);

      // Fetch verification documents
      const { data: documentsData, error: documentsError } = await supabase
        .from('verification_documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (documentsError) throw documentsError;

      // Fetch professional references (only for providers)
      let referencesData: ProfessionalReference[] = [];
      if (profile.role === 'provider') {
        const { data: refData, error: referencesError } = await supabase
          .from('professional_references')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (referencesError) throw referencesError;
        referencesData = refData || [];
      }

      setDocuments(documentsData || []);
      setReferences(referencesData);

      // Build verification steps based on user role and current data
      const steps = buildVerificationSteps(documentsData || [], referencesData, profile.role);
      setVerificationSteps(steps);

      // Calculate stats
      const calculatedStats = calculateVerificationStats(steps);
      setStats(calculatedStats);

      // Update profile if trust score changed
      if (profile.trust_score !== calculatedStats.trustScore) {
        await updateProfile({
          trust_score: calculatedStats.trustScore,
          verification_level: getVerificationLevel(calculatedStats.currentLevel)
        });
      }

    } catch (error) {
      console.error('Error fetching verification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildVerificationSteps = (
    docs: VerificationDocument[],
    refs: ProfessionalReference[],
    userRole: string
  ): VerificationStep[] => {
    // Base steps for all users (Level 1)
    const baseSteps = [
      {
        id: 'phone',
        title: 'Numéro de téléphone',
        description: 'Vérification par SMS',
        level: 1,
        required: true
      },
      {
        id: 'email',
        title: 'Adresse email',
        description: 'Confirmation par email',
        level: 1,
        required: true
      }
    ];

    // Provider-specific additional steps
    const providerSteps = [
      {
        id: 'identity',
        title: 'Carte d\'identité (CNI)',
        description: 'Scan et reconnaissance faciale',
        level: 2,
        required: true
      },
      {
        id: 'address',
        title: 'Justificatif de domicile',
        description: 'Facture récente (électricité/eau)',
        level: 2,
        required: true
      },
      {
        id: 'background',
        title: 'Casier judiciaire',
        description: 'Vérification antécédents',
        level: 3,
        required: false
      },
      {
        id: 'references',
        title: 'Références professionnelles',
        description: '2-3 contacts vérifiables',
        level: 3,
        required: false
      },
      {
        id: 'community',
        title: 'Validation communautaire',
        description: 'Recommandation locale',
        level: 4,
        required: false
      }
    ];

    // Build steps array based on role
    const allSteps = userRole === 'provider'
      ? [...baseSteps, ...providerSteps]
      : baseSteps;

    return allSteps.map(step => {
      let status: 'pending' | 'submitted' | 'approved' | 'rejected' = 'pending';
      let document: VerificationDocument | undefined;
      let stepReferences: ProfessionalReference[] = [];

      // Check phone verification
      if (step.id === 'phone') {
        status = profile?.phone ? 'approved' : 'pending';
      }
      // Check email verification
      else if (step.id === 'email') {
        status = user?.email_confirmed_at ? 'approved' : 'pending';
      }
      // Check documents
      else if (['identity', 'address', 'background'].includes(step.id)) {
        const docType = step.id === 'identity' ? 'cni' :
          step.id === 'address' ? 'address' : 'background';
        document = docs.find(d => d.document_type === docType);
        if (document) {
          status = document.verification_status as any;
        }
      }
      // Check references
      else if (step.id === 'references') {
        stepReferences = refs;
        const approvedRefs = refs.filter(r => r.verification_status === 'approved');
        if (approvedRefs.length >= 2) {
          status = 'approved';
        } else if (refs.length > 0) {
          status = 'submitted';
        }
      }
      // Community validation
      else if (step.id === 'community') {
        const communityDoc = docs.find(d => d.document_type === 'community');
        if (communityDoc) {
          status = communityDoc.verification_status as any;
        }
      }

      return {
        ...step,
        status,
        document,
        references: stepReferences
      };
    });
  };

  const calculateVerificationStats = (steps: VerificationStep[]): VerificationStats => {
    const approvedSteps = steps.filter(s => s.status === 'approved');
    const maxLevel = Math.max(...approvedSteps.map(s => s.level), 1);

    // Role-based trust score calculation
    let trustScore = 0;

    if (profile?.role === 'client') {
      // Client scoring: 50 points max per level 1 step (phone + email = 100%)
      const level1Approved = approvedSteps.filter(s => s.level === 1);
      trustScore = level1Approved.length * 50;
    } else {
      // Provider scoring: weighted by level importance
      const scoreWeights = { 1: 20, 2: 25, 3: 30, 4: 40 };
      approvedSteps.forEach(step => {
        trustScore += scoreWeights[step.level as keyof typeof scoreWeights] || 0;
      });
    }

    // Find next required step
    const nextRequiredStep = steps.find(s =>
      s.required && s.status === 'pending'
    );

    return {
      currentLevel: maxLevel,
      trustScore: Math.min(trustScore, 100),
      completedSteps: approvedSteps.length,
      totalSteps: steps.length,
      nextRequiredStep
    };
  };

  const getVerificationLevel = (level: number): Database['public']['Enums']['verification_level'] => {
    switch (level) {
      case 1: return 'basic';
      case 2: return 'government';
      case 3: return 'enhanced';
      case 4: return 'community';
      default: return 'basic';
    }
  };

  // Rest of the methods remain the same...
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
          verification_status: 'submitted',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) return { error: error.message };

      await fetchVerificationData();
      return { data };
    } catch (err) {
      return { error: 'Failed to upload document' };
    }
  };

  const submitReferences = async (referencesData: Array<{
    reference_name: string;
    reference_phone: string;
    reference_email?: string;
    relationship: string;
    company?: string;
    position?: string;
    years_known?: string;
  }>) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('professional_references')
        .insert(
          referencesData.map(ref => ({
            user_id: user.id,
            reference_name: ref.reference_name,
            reference_phone: ref.reference_phone,
            reference_email: ref.reference_email,
            relationship: ref.relationship,
            company: ref.company,
            position: ref.position,
            years_known: ref.years_known,
            verification_status: 'submitted',
            created_at: new Date().toISOString()
          }))
        )
        .select();

      if (error) return { error: error.message };

      await fetchVerificationData();
      return { data };
    } catch (err) {
      return { error: 'Failed to submit references' };
    }
  };

  const requestPhoneVerification = async (phoneNumber: string) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { error } = await updateProfile({ phone: phoneNumber });
      if (error) return { error };

      await fetchVerificationData();
      return { success: true };
    } catch (err) {
      return { error: 'Failed to verify phone' };
    }
  };

  const requestEmailVerification = async () => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email!
      });

      if (error) return { error: error.message };
      return { success: true };
    } catch (err) {
      return { error: 'Failed to send verification email' };
    }
  };

  const getRequiredSteps = () => {
    return verificationSteps.filter(step =>
      step.required && step.status === 'pending'
    );
  };

  const getOptionalSteps = () => {
    return verificationSteps.filter(step =>
      !step.required && step.status === 'pending'
    );
  };

  const getCompletedSteps = () => {
    return verificationSteps.filter(step => step.status === 'approved');
  };

  const canAccessLevel = (level: number) => {
    return stats.currentLevel >= level;
  };

  return {
    documents,
    references,
    verificationSteps,
    stats,
    loading,
    uploadDocument,
    submitReferences,
    requestPhoneVerification,
    requestEmailVerification,
    getRequiredSteps,
    getOptionalSteps,
    getCompletedSteps,
    canAccessLevel,
    refetch: fetchVerificationData
  };
};