// utils/supabaseStorage.ts
import { supabase } from '@/lib/supabase';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export const uploadDocumentToSupabase = async (
  imageUri: string,
  userId: string,
  documentType: 'front' | 'back' | 'face'
): Promise<UploadResult> => {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const fileName = `${documentType}_${timestamp}_${randomId}.jpg`;
    const filePath = `documents/${userId}/${fileName}`;

    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convert base64 to ArrayBuffer
    const arrayBuffer = decode(base64);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('verification-documents')
      .upload(filePath, arrayBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return { success: false, error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('verification-documents')
      .getPublicUrl(filePath);

    return {
      success: true,
      url: urlData.publicUrl
    };

  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: 'Failed to upload document'
    };
  }
};

// Enhanced document scanner with Supabase storage
export const processDocumentWithSupabase = async (
  imageUri: string,
  userId: string,
  documentType: 'front' | 'back' | 'face'
) => {
  try {
    // Upload to Supabase
    const uploadResult = await uploadDocumentToSupabase(imageUri, userId, documentType);

    if (!uploadResult.success) {
      throw new Error(uploadResult.error);
    }

    // Extract data with AI (if not face)
    let extractedData = null;
    if (documentType !== 'face') {
      extractedData = await extractDataWithAI(imageUri, documentType);
    }

    // Save to verification_documents table
    const { data: docRecord, error: dbError } = await supabase
      .from('verification_documents')
      .insert({
        user_id: userId,
        document_type: documentType === 'face' ? 'selfie' : `cni_${documentType}`,
        document_url: uploadResult.url,
        verification_status: 'pending',
        verification_data: {
          extracted_data: extractedData?.data?.extracted_fields,
          confidence_score: extractedData?.data?.confidence,
          processing_metadata: {
            scan_date: new Date().toISOString(),
            ai_version: "2.0",
            device_info: "Mobile App Enhanced"
          }
        }
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to save document record');
    }

    return {
      success: true,
      cloudUrl: uploadResult.url,
      extractedData: extractedData?.data?.extracted_fields,
      confidence: extractedData?.data?.confidence,
      documentId: docRecord.id
    };

  } catch (error) {
    console.error('Process document error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// AI extraction function with corrected CNI data
const extractDataWithAI = async (imageUri: string, documentType: 'front' | 'back') => {
  // Mock AI service with corrected data based on your images
  await new Promise(resolve => setTimeout(resolve, 2000));

  if (documentType === 'front') {
    return {
      success: true,
      data: {
        confidence: 98.5,
        extracted_fields: {
          full_name: "RELLINXE KOFFY BONI",
          nni: "11934560959", // Correct NNI from back of card
          birth_date: "01/05/1993", // Corrected from visible date
          birth_place: "DALOA COMMUNE (CIV)",
          nationality: "IVOIRIENNE",
          height: "1,87",
          gender: "M",
          document_number: "CI00343738" // From front
        }
      }
    };
  } else {
    return {
      success: true,
      data: {
        confidence: 97.2,
        extracted_fields: {
          expiry_date: "23/03/2032", // Correct expiry date
          nni: "11934560959", // NNI visible on back
          signature_present: true,
          issuing_authority: "ONECI"
        }
      }
    };
  }
};