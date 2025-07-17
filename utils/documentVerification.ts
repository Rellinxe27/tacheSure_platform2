// utils/documentVerification.ts
// Utility for handling document verification and storage

import { supabase } from '@/lib/supabase';
import { decode } from 'base64-arraybuffer';

/**
 * Types for document verification
 */
export interface VerificationDocument {
  id?: string;
  userId: string;
  documentType: 'identity' | 'address' | 'background_check' | 'professional_reference' | 'biometric' | 'selfie';
  documentUrl: string;
  verificationStatus: 'pending' | 'submitted' | 'approved' | 'rejected' | 'expired';
  verificationData?: any;
  confidenceScore?: number;
  expiresAt?: string;
}

/**
 * Upload a document image to storage and create a verification record
 */
export async function uploadVerificationDocument(
  userId: string,
  documentType: VerificationDocument['documentType'],
  base64Image: string,
  metadata?: any
): Promise<VerificationDocument> {
  try {
    // 1. Upload the document image to storage
    const fileName = `${userId}/${documentType}_${Date.now()}.jpg`;
    const contentType = 'image/jpeg';
    
    // Convert base64 to ArrayBuffer for upload
    const arrayBuffer = decode(base64Image);
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('verification_documents')
      .upload(fileName, arrayBuffer, {
        contentType,
        upsert: false
      });
      
    if (uploadError) throw uploadError;
    
    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase
      .storage
      .from('verification_documents')
      .getPublicUrl(fileName);
      
    // 2. Create a verification document record
    const documentRecord: Omit<VerificationDocument, 'id'> = {
      userId,
      documentType,
      documentUrl: publicUrl,
      verificationStatus: 'submitted',
      verificationData: metadata || {},
      confidenceScore: 0, // Will be updated by verification process
      expiresAt: getDocumentExpiryDate(documentType)
    };
    
    const { data: verificationRecord, error: recordError } = await supabase
      .from('verification_documents')
      .insert(documentRecord)
      .select()
      .single();
      
    if (recordError) throw recordError;
    
    // 3. Trigger verification process (in real implementation, this would call an AI service)
    await processDocumentVerification(verificationRecord.id);
    
    return verificationRecord;
  } catch (error) {
    console.error('Error uploading verification document:', error);
    throw error;
  }
}

/**
 * Process a document for verification (simulated AI verification)
 */
async function processDocumentVerification(documentId: string): Promise<void> {
  try {
    // Get the document record
    const { data: document, error: fetchError } = await supabase
      .from('verification_documents')
      .select('*')
      .eq('id', documentId)
      .single();
      
    if (fetchError) throw fetchError;
    
    // Simulate AI verification process
    // In a real implementation, this would call an external service
    const simulateVerification = async () => {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a random confidence score between 70 and 100
      const confidenceScore = Math.floor(Math.random() * 30) + 70;
      
      // Determine verification status based on confidence score
      let verificationStatus: 'approved' | 'rejected' = 'rejected';
      if (confidenceScore >= 85) {
        verificationStatus = 'approved';
      }
      
      return {
        confidenceScore,
        verificationStatus,
        verificationData: {
          processedAt: new Date().toISOString(),
          aiModel: 'DocumentVerifier-v1',
          verificationNotes: confidenceScore >= 85 
            ? 'Document verified successfully' 
            : 'Document verification failed - low confidence score'
        }
      };
    };
    
    // Get verification results
    const verificationResults = await simulateVerification();
    
    // Update the document record with verification results
    await supabase
      .from('verification_documents')
      .update({
        verificationStatus: verificationResults.verificationStatus,
        confidenceScore: verificationResults.confidenceScore,
        verificationData: {
          ...document.verificationData,
          ...verificationResults.verificationData
        }
      })
      .eq('id', documentId);
      
    // If document is approved, update user's verification level
    if (verificationResults.verificationStatus === 'approved') {
      await updateUserVerificationLevel(document.userId, document.documentType);
    }
  } catch (error) {
    console.error('Error processing document verification:', error);
    throw error;
  }
}

/**
 * Update a user's verification level based on verified documents
 */
async function updateUserVerificationLevel(userId: string, documentType: string): Promise<void> {
  try {
    // Get all approved documents for this user
    const { data: documents, error: fetchError } = await supabase
      .from('verification_documents')
      .select('documentType')
      .eq('userId', userId)
      .eq('verificationStatus', 'approved');
      
    if (fetchError) throw fetchError;
    
    // Determine the highest verification level based on approved documents
    let verificationLevel: 'basic' | 'government' | 'enhanced' | 'community' = 'basic';
    
    const documentTypes = documents.map(doc => doc.documentType);
    
    // Check for government ID verification
    if (documentTypes.includes('identity') && documentTypes.includes('address')) {
      verificationLevel = 'government';
      
      // Check for enhanced verification
      if (documentTypes.includes('background_check') || documentTypes.includes('professional_reference')) {
        verificationLevel = 'enhanced';
        
        // Check for community verification (would require additional checks in a real implementation)
        // This is a simplified version
        if (documentTypes.length >= 5) {
          verificationLevel = 'community';
        }
      }
    }
    
    // Update the user's verification level
    await supabase
      .from('profiles')
      .update({
        verification_level: verificationLevel,
        is_verified: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
      
  } catch (error) {
    console.error('Error updating user verification level:', error);
    throw error;
  }
}

/**
 * Get all verification documents for a user
 */
export async function getUserVerificationDocuments(userId: string): Promise<VerificationDocument[]> {
  try {
    const { data, error } = await supabase
      .from('verification_documents')
      .select('*')
      .eq('userId', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error getting user verification documents:', error);
    throw error;
  }
}

/**
 * Get document expiry date based on document type
 */
function getDocumentExpiryDate(documentType: string): string {
  const now = new Date();
  
  switch (documentType) {
    case 'identity':
      // ID documents typically valid for 5-10 years
      now.setFullYear(now.getFullYear() + 5);
      break;
    case 'address':
      // Address proofs typically valid for 3-6 months
      now.setMonth(now.getMonth() + 3);
      break;
    case 'background_check':
      // Background checks typically valid for 1 year
      now.setFullYear(now.getFullYear() + 1);
      break;
    default:
      // Default to 1 year
      now.setFullYear(now.getFullYear() + 1);
  }
  
  return now.toISOString();
}

/**
 * Verify a biometric fingerprint (simulated)
 */
export async function verifyBiometric(
  userId: string,
  biometricData: string,
  biometricType: 'fingerprint' | 'facial'
): Promise<{ verified: boolean; score: number }> {
  try {
    // In a real implementation, this would call a biometric verification service
    // This is a simulated implementation
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate a random verification score between 0 and 100
    const score = Math.floor(Math.random() * 30) + 70;
    const verified = score >= 80;
    
    // If verified, create a verification document record
    if (verified) {
      await supabase
        .from('verification_documents')
        .insert({
          userId,
          documentType: biometricType === 'fingerprint' ? 'biometric' : 'selfie',
          documentUrl: 'biometric_data_stored_securely',
          verificationStatus: 'approved',
          confidenceScore: score,
          verificationData: {
            biometricType,
            verifiedAt: new Date().toISOString()
          },
          expiresAt: getDocumentExpiryDate('biometric')
        });
    }
    
    return { verified, score };
  } catch (error) {
    console.error('Error verifying biometric:', error);
    throw error;
  }
}

/**
 * Add a community verification endorsement
 */
export async function addCommunityEndorsement(
  userId: string,
  endorserName: string,
  endorserRole: 'community_leader' | 'local_business' | 'religious_leader' | 'trusted_user',
  endorserContact: string,
  notes?: string
): Promise<void> {
  try {
    // Create an endorsement record
    await supabase
      .from('community_endorsements')
      .insert({
        user_id: userId,
        endorser_name: endorserName,
        endorser_role: endorserRole,
        endorser_contact: endorserContact,
        notes: notes || '',
        status: 'pending',
        created_at: new Date().toISOString()
      });
      
    // In a real implementation, this would trigger a verification process
    // For now, we'll simulate an automatic approval after a delay
    setTimeout(async () => {
      try {
        // Update the endorsement status
        await supabase
          .from('community_endorsements')
          .update({ status: 'approved', verified_at: new Date().toISOString() })
          .eq('user_id', userId)
          .eq('endorser_name', endorserName);
          
        // Check if user has enough endorsements for community verification
        const { data: endorsements, error } = await supabase
          .from('community_endorsements')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'approved');
          
        if (error) throw error;
        
        // If user has at least 3 endorsements, update to community verification level
        if (endorsements && endorsements.length >= 3) {
          await supabase
            .from('profiles')
            .update({
              verification_level: 'community',
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);
        }
      } catch (error) {
        console.error('Error processing endorsement:', error);
      }
    }, 3000);
    
  } catch (error) {
    console.error('Error adding community endorsement:', error);
    throw error;
  }
}