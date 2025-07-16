// utils/saveVerificationData.ts
import { supabase } from '@/lib/supabase';

interface EnhancedVerificationData {
  extracted_data: {
    front?: {
      full_name?: string;
      nni?: string;
      birth_date?: string;
      birth_place?: string;
      nationality?: string;
      height?: string;
      gender?: string;
      document_number?: string;
    };
    back?: {
      expiry_date?: string;
      nni?: string;
      signature_present?: boolean;
      issuing_authority?: string;
    };
  };
  confidence_scores: number[];
  scanned_documents: Array<{
    uri: string;
    type: string;
    cloudUrl?: string;
    confidence: number;
    extractedData?: any;
  }>;
  processing_metadata: {
    scan_date: string;
    ai_version: string;
    device_info: string;
    quality_checks?: any;
  };
}

export const saveVerificationToDatabase = async (
  userId: string,
  verificationData: EnhancedVerificationData
) => {
  try {
    // Save each document to verification_documents table
    for (const doc of verificationData.scanned_documents) {
      const documentType = doc.type === 'face' ? 'selfie' : `cni_${doc.type}`;

      const { error } = await supabase
        .from('verification_documents')
        .insert({
          user_id: userId,
          document_type: documentType,
          document_url: doc.cloudUrl || '',
          verification_status: 'pending',
          verification_data: {
            extracted_data: doc.extractedData,
            confidence_score: doc.confidence,
            processing_metadata: verificationData.processing_metadata
          },
          confidence_score: doc.confidence
        });

      if (error) {
        console.error(`Error saving ${documentType}:`, error);
        throw error;
      }
    }

    // Update user profile with extracted data and verification level
    const frontData = verificationData.extracted_data.front;
    if (frontData) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: frontData.full_name,
          date_of_birth: frontData.birth_date,
          nationality: frontData.nationality,
          verification_level: 'government', // Upgraded from basic
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (profileError) {
        console.error('Error updating profile:', profileError);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Save verification error:', error);
    return { success: false, error: error.message };
  }
};