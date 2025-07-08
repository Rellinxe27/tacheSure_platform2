// lib/database.types.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          phone: string | null
          full_name: string | null
          avatar_url: string | null
          date_of_birth: string | null
          gender: string | null
          nationality: string | null
          role: 'client' | 'provider' | 'admin' | 'moderator' | 'verifier'
          location: unknown | null
          address: Json | null
          languages: string[] | null
          is_active: boolean | null
          is_verified: boolean | null
          trust_score: number | null
          verification_level: 'basic' | 'government' | 'enhanced' | 'community'
          emergency_contacts: Json | null
          preferences: Json | null
          last_seen_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          phone?: string | null
          full_name?: string | null
          avatar_url?: string | null
          date_of_birth?: string | null
          gender?: string | null
          nationality?: string | null
          role?: 'client' | 'provider' | 'admin' | 'moderator' | 'verifier'
          location?: unknown | null
          address?: Json | null
          languages?: string[] | null
          is_active?: boolean | null
          is_verified?: boolean | null
          trust_score?: number | null
          verification_level?: 'basic' | 'government' | 'enhanced' | 'community'
          emergency_contacts?: Json | null
          preferences?: Json | null
          last_seen_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          phone?: string | null
          full_name?: string | null
          avatar_url?: string | null
          date_of_birth?: string | null
          gender?: string | null
          nationality?: string | null
          role?: 'client' | 'provider' | 'admin' | 'moderator' | 'verifier'
          location?: unknown | null
          address?: Json | null
          languages?: string[] | null
          is_active?: boolean | null
          is_verified?: boolean | null
          trust_score?: number | null
          verification_level?: 'basic' | 'government' | 'enhanced' | 'community'
          emergency_contacts?: Json | null
          preferences?: Json | null
          last_seen_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      verification_documents: {
        Row: {
          id: string
          user_id: string
          document_type: string
          document_url: string
          verification_status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'expired'
          verification_data: Json | null
          verified_by: string | null
          verified_at: string | null
          rejection_reason: string | null
          confidence_score: number | null
          expires_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          document_type: string
          document_url: string
          verification_status?: 'pending' | 'submitted' | 'approved' | 'rejected' | 'expired'
          verification_data?: Json | null
          verified_by?: string | null
          verified_at?: string | null
          rejection_reason?: string | null
          confidence_score?: number | null
          expires_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          document_type?: string
          document_url?: string
          verification_status?: 'pending' | 'submitted' | 'approved' | 'rejected' | 'expired'
          verification_data?: Json | null
          verified_by?: string | null
          verified_at?: string | null
          rejection_reason?: string | null
          confidence_score?: number | null
          expires_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      professional_references: {
        Row: {
          id: string
          user_id: string
          reference_name: string
          reference_phone: string
          reference_email: string | null
          relationship: string
          company: string | null
          position: string | null
          years_known: string | null
          verification_status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'expired'
          contacted_at: string | null
          response_received_at: string | null
          verification_notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          reference_name: string
          reference_phone: string
          reference_email?: string | null
          relationship: string
          company?: string | null
          position?: string | null
          years_known?: string | null
          verification_status?: 'pending' | 'submitted' | 'approved' | 'rejected' | 'expired'
          contacted_at?: string | null
          response_received_at?: string | null
          verification_notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          reference_name?: string
          reference_phone?: string
          reference_email?: string | null
          relationship?: string
          company?: string | null
          position?: string | null
          years_known?: string | null
          verification_status?: 'pending' | 'submitted' | 'approved' | 'rejected' | 'expired'
          contacted_at?: string | null
          response_received_at?: string | null
          verification_notes?: string | null
          created_at?: string | null
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          name_fr: string
          description: string | null
          icon: string | null
          parent_id: string | null
          is_active: boolean | null
          sort_order: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          name_fr: string
          description?: string | null
          icon?: string | null
          parent_id?: string | null
          is_active?: boolean | null
          sort_order?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          name_fr?: string
          description?: string | null
          icon?: string | null
          parent_id?: string | null
          is_active?: boolean | null
          sort_order?: number | null
          created_at?: string | null
        }
      }
      services: {
        Row: {
          id: string
          provider_id: string
          category_id: string | null
          name: string
          description: string
          price_min: number
          price_max: number
          price_unit: string | null
          duration_estimate: string | null
          service_area: unknown | null
          max_distance: number | null
          requirements: string[] | null
          images: string[] | null
          is_active: boolean | null
          is_emergency_available: boolean | null
          tags: string[] | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          provider_id: string
          category_id?: string | null
          name: string
          description: string
          price_min: number
          price_max: number
          price_unit?: string | null
          duration_estimate?: string | null
          service_area?: unknown | null
          max_distance?: number | null
          requirements?: string[] | null
          images?: string[] | null
          is_active?: boolean | null
          is_emergency_available?: boolean | null
          tags?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          provider_id?: string
          category_id?: string | null
          name?: string
          description?: string
          price_min?: number
          price_max?: number
          price_unit?: string | null
          duration_estimate?: string | null
          service_area?: unknown | null
          max_distance?: number | null
          requirements?: string[] | null
          images?: string[] | null
          is_active?: boolean | null
          is_emergency_available?: boolean | null
          tags?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      tasks: {
        Row: {
          id: string
          client_id: string
          provider_id: string | null
          category_id: string | null
          title: string
          description: string
          location: unknown
          address: Json
          budget_min: number | null
          budget_max: number | null
          urgency: 'low' | 'normal' | 'high' | 'emergency'
          status: 'draft' | 'posted' | 'applications' | 'selected' | 'in_progress' | 'completed' | 'cancelled' | 'disputed'
          scheduled_at: string | null
          started_at: string | null
          completed_at: string | null
          estimated_duration: string | null
          actual_duration: unknown | null
          images: string[] | null
          requirements: string[] | null
          skills_needed: string[] | null
          preferred_language: string | null
          applicant_count: number | null
          views_count: number | null
          is_recurring: boolean | null
          recurrence_pattern: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          client_id: string
          provider_id?: string | null
          category_id?: string | null
          title: string
          description: string
          location: unknown
          address: Json
          budget_min?: number | null
          budget_max?: number | null
          urgency?: 'low' | 'normal' | 'high' | 'emergency'
          status?: 'draft' | 'posted' | 'applications' | 'selected' | 'in_progress' | 'completed' | 'cancelled' | 'disputed'
          scheduled_at?: string | null
          started_at?: string | null
          completed_at?: string | null
          estimated_duration?: string | null
          actual_duration?: unknown | null
          images?: string[] | null
          requirements?: string[] | null
          skills_needed?: string[] | null
          preferred_language?: string | null
          applicant_count?: number | null
          views_count?: number | null
          is_recurring?: boolean | null
          recurrence_pattern?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          client_id?: string
          provider_id?: string | null
          category_id?: string | null
          title?: string
          description?: string
          location?: unknown
          address?: Json
          budget_min?: number | null
          budget_max?: number | null
          urgency?: 'low' | 'normal' | 'high' | 'emergency'
          status?: 'draft' | 'posted' | 'applications' | 'selected' | 'in_progress' | 'completed' | 'cancelled' | 'disputed'
          scheduled_at?: string | null
          started_at?: string | null
          completed_at?: string | null
          estimated_duration?: string | null
          actual_duration?: unknown | null
          images?: string[] | null
          requirements?: string[] | null
          skills_needed?: string[] | null
          preferred_language?: string | null
          applicant_count?: number | null
          views_count?: number | null
          is_recurring?: boolean | null
          recurrence_pattern?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      task_applications: {
        Row: {
          id: string
          task_id: string
          provider_id: string
          status: string | null
          proposed_price: number
          estimated_duration: string | null
          message: string | null
          availability: Json | null
          tools_included: boolean | null
          materials_included: boolean | null
          insurance_covered: boolean | null
          applied_at: string | null
          responded_at: string | null
        }
        Insert: {
          id?: string
          task_id: string
          provider_id: string
          status?: string | null
          proposed_price: number
          estimated_duration?: string | null
          message?: string | null
          availability?: Json | null
          tools_included?: boolean | null
          materials_included?: boolean | null
          insurance_covered?: boolean | null
          applied_at?: string | null
          responded_at?: string | null
        }
        Update: {
          id?: string
          task_id?: string
          provider_id?: string
          status?: string | null
          proposed_price?: number
          estimated_duration?: string | null
          message?: string | null
          availability?: Json | null
          tools_included?: boolean | null
          materials_included?: boolean | null
          insurance_covered?: boolean | null
          applied_at?: string | null
          responded_at?: string | null
        }
      }
      tracking_sessions: {
        Row: {
          id: string
          task_id: string
          provider_id: string | null
          client_id: string | null
          is_active: boolean | null
          started_at: string | null
          ended_at: string | null
          emergency_triggered: boolean | null
          check_ins: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          task_id: string
          provider_id?: string | null
          client_id?: string | null
          is_active?: boolean | null
          started_at?: string | null
          ended_at?: string | null
          emergency_triggered?: boolean | null
          check_ins?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          task_id?: string
          provider_id?: string | null
          client_id?: string | null
          is_active?: boolean | null
          started_at?: string | null
          ended_at?: string | null
          emergency_triggered?: boolean | null
          check_ins?: Json | null
          created_at?: string | null
        }
      }
      location_tracks: {
        Row: {
          id: string
          tracking_session_id: string
          user_id: string | null
          location: unknown
          accuracy: number | null
          altitude: number | null
          heading: number | null
          speed: number | null
          timestamp: string | null
        }
        Insert: {
          id?: string
          tracking_session_id: string
          user_id?: string | null
          location: unknown
          accuracy?: number | null
          altitude?: number | null
          heading?: number | null
          speed?: number | null
          timestamp?: string | null
        }
        Update: {
          id?: string
          tracking_session_id?: string
          user_id?: string | null
          location?: unknown
          accuracy?: number | null
          altitude?: number | null
          heading?: number | null
          speed?: number | null
          timestamp?: string | null
        }
      }
      payments: {
        Row: {
          id: string
          task_id: string | null
          payer_id: string | null
          payee_id: string | null
          amount: number
          fee_amount: number | null
          net_amount: number | null
          currency: string | null
          payment_method: 'mtn_money' | 'orange_money' | 'moov_money' | 'wave' | 'bank_transfer' | 'cash' | 'crypto'
          payment_provider: string | null
          external_transaction_id: string | null
          status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'disputed'
          escrow_released: boolean | null
          escrow_released_at: string | null
          dispute_id: string | null
          refund_amount: number | null
          refund_reason: string | null
          metadata: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          task_id?: string | null
          payer_id?: string | null
          payee_id?: string | null
          amount: number
          fee_amount?: number | null
          net_amount?: number | null
          currency?: string | null
          payment_method: 'mtn_money' | 'orange_money' | 'moov_money' | 'wave' | 'bank_transfer' | 'cash' | 'crypto'
          payment_provider?: string | null
          external_transaction_id?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'disputed'
          escrow_released?: boolean | null
          escrow_released_at?: string | null
          dispute_id?: string | null
          refund_amount?: number | null
          refund_reason?: string | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          task_id?: string | null
          payer_id?: string | null
          payee_id?: string | null
          amount?: number
          fee_amount?: number | null
          net_amount?: number | null
          currency?: string | null
          payment_method?: 'mtn_money' | 'orange_money' | 'moov_money' | 'wave' | 'bank_transfer' | 'cash' | 'crypto'
          payment_provider?: string | null
          external_transaction_id?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'disputed'
          escrow_released?: boolean | null
          escrow_released_at?: string | null
          dispute_id?: string | null
          refund_amount?: number | null
          refund_reason?: string | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      reviews: {
        Row: {
          id: string
          task_id: string | null
          reviewer_id: string | null
          reviewee_id: string | null
          rating: number
          title: string | null
          comment: string | null
          categories: Json | null
          is_public: boolean | null
          helpful_count: number | null
          reported_count: number | null
          moderation_status: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          task_id?: string | null
          reviewer_id?: string | null
          reviewee_id?: string | null
          rating: number
          title?: string | null
          comment?: string | null
          categories?: Json | null
          is_public?: boolean | null
          helpful_count?: number | null
          reported_count?: number | null
          moderation_status?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          task_id?: string | null
          reviewer_id?: string | null
          reviewee_id?: string | null
          rating?: number
          title?: string | null
          comment?: string | null
          categories?: Json | null
          is_public?: boolean | null
          helpful_count?: number | null
          reported_count?: number | null
          moderation_status?: string | null
          created_at?: string | null
        }
      }
      conversations: {
        Row: {
          id: string
          task_id: string | null
          participants: string[]
          last_message_at: string | null
          is_archived: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          task_id?: string | null
          participants: string[]
          last_message_at?: string | null
          is_archived?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          task_id?: string | null
          participants?: string[]
          last_message_at?: string | null
          is_archived?: boolean | null
          created_at?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string | null
          content: string | null
          message_type: string | null
          media_url: string | null
          metadata: Json | null
          is_read: boolean | null
          read_at: string | null
          is_encrypted: boolean | null
          moderation_flagged: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id?: string | null
          content?: string | null
          message_type?: string | null
          media_url?: string | null
          metadata?: Json | null
          is_read?: boolean | null
          read_at?: string | null
          is_encrypted?: boolean | null
          moderation_flagged?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string | null
          content?: string | null
          message_type?: string | null
          media_url?: string | null
          metadata?: Json | null
          is_read?: boolean | null
          read_at?: string | null
          is_encrypted?: boolean | null
          moderation_flagged?: boolean | null
          created_at?: string | null
        }
      }
      availability_schedules: {
        Row: {
          id: string
          provider_id: string
          day_of_week: number
          start_time: string
          end_time: string
          is_available: boolean | null
          timezone: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          provider_id: string
          day_of_week: number
          start_time: string
          end_time: string
          is_available?: boolean | null
          timezone?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          provider_id?: string
          day_of_week?: number
          start_time?: string
          end_time?: string
          is_available?: boolean | null
          timezone?: string | null
          created_at?: string | null
        }
      }
      time_off: {
        Row: {
          id: string
          provider_id: string
          start_date: string
          end_date: string
          reason: string | null
          is_recurring: boolean | null
          recurrence_pattern: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          provider_id: string
          start_date: string
          end_date: string
          reason?: string | null
          is_recurring?: boolean | null
          recurrence_pattern?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          provider_id?: string
          start_date?: string
          end_date?: string
          reason?: string | null
          is_recurring?: boolean | null
          recurrence_pattern?: Json | null
          created_at?: string | null
        }
      }
      safety_incidents: {
        Row: {
          id: string
          reporter_id: string | null
          reported_user_id: string | null
          task_id: string | null
          incident_type: 'safety' | 'payment' | 'behavior' | 'fraud' | 'technical' | 'other'
          priority: 'low' | 'medium' | 'high' | 'critical'
          title: string
          description: string
          location: unknown | null
          evidence_urls: string[] | null
          status: string | null
          assigned_to: string | null
          resolution_notes: string | null
          resolved_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          reporter_id?: string | null
          reported_user_id?: string | null
          task_id?: string | null
          incident_type: 'safety' | 'payment' | 'behavior' | 'fraud' | 'technical' | 'other'
          priority?: 'low' | 'medium' | 'high' | 'critical'
          title: string
          description: string
          location?: unknown | null
          evidence_urls?: string[] | null
          status?: string | null
          assigned_to?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          reporter_id?: string | null
          reported_user_id?: string | null
          task_id?: string | null
          incident_type?: 'safety' | 'payment' | 'behavior' | 'fraud' | 'technical' | 'other'
          priority?: 'low' | 'medium' | 'high' | 'critical'
          title?: string
          description?: string
          location?: unknown | null
          evidence_urls?: string[] | null
          status?: string | null
          assigned_to?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          created_at?: string | null
        }
      }
      emergency_alerts: {
        Row: {
          id: string
          user_id: string | null
          task_id: string | null
          alert_type: string
          location: unknown | null
          status: string | null
          response_time: unknown | null
          responder_id: string | null
          resolution_notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          task_id?: string | null
          alert_type: string
          location?: unknown | null
          status?: string | null
          response_time?: unknown | null
          responder_id?: string | null
          resolution_notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          task_id?: string | null
          alert_type?: string
          location?: unknown | null
          status?: string | null
          response_time?: unknown | null
          responder_id?: string | null
          resolution_notes?: string | null
          created_at?: string | null
        }
      }
      fraud_alerts: {
        Row: {
          id: string
          user_id: string | null
          alert_type: 'payment' | 'identity' | 'behavior' | 'location' | 'velocity'
          severity: string
          description: string
          evidence: Json
          risk_score: number | null
          status: string | null
          investigated_by: string | null
          investigation_notes: string | null
          resolved_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          alert_type: 'payment' | 'identity' | 'behavior' | 'location' | 'velocity'
          severity: string
          description: string
          evidence: Json
          risk_score?: number | null
          status?: string | null
          investigated_by?: string | null
          investigation_notes?: string | null
          resolved_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          alert_type?: 'payment' | 'identity' | 'behavior' | 'location' | 'velocity'
          severity?: string
          description?: string
          evidence?: Json
          risk_score?: number | null
          status?: string | null
          investigated_by?: string | null
          investigation_notes?: string | null
          resolved_at?: string | null
          created_at?: string | null
        }
      }
      moderation_logs: {
        Row: {
          id: string
          content_type: string
          content_id: string
          user_id: string | null
          content_text: string | null
          ai_confidence: number | null
          detected_categories: string[] | null
          action_taken: 'allow' | 'warn' | 'block' | 'review'
          human_reviewed: boolean | null
          reviewer_id: string | null
          review_notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          content_type: string
          content_id: string
          user_id?: string | null
          content_text?: string | null
          ai_confidence?: number | null
          detected_categories?: string[] | null
          action_taken: 'allow' | 'warn' | 'block' | 'review'
          human_reviewed?: boolean | null
          reviewer_id?: string | null
          review_notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          content_type?: string
          content_id?: string
          user_id?: string | null
          content_text?: string | null
          ai_confidence?: number | null
          detected_categories?: string[] | null
          action_taken?: 'allow' | 'warn' | 'block' | 'review'
          human_reviewed?: boolean | null
          reviewer_id?: string | null
          review_notes?: string | null
          created_at?: string | null
        }
      }
      insurance_policies: {
        Row: {
          id: string
          user_id: string | null
          policy_type: 'liability' | 'property' | 'injury' | 'professional'
          coverage_amount: number
          premium_amount: number
          deductible_amount: number | null
          policy_number: string | null
          provider_name: string
          start_date: string
          end_date: string
          is_active: boolean | null
          claims_used: number | null
          claims_limit: number | null
          terms_conditions: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          policy_type: 'liability' | 'property' | 'injury' | 'professional'
          coverage_amount: number
          premium_amount: number
          deductible_amount?: number | null
          policy_number?: string | null
          provider_name: string
          start_date: string
          end_date: string
          is_active?: boolean | null
          claims_used?: number | null
          claims_limit?: number | null
          terms_conditions?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          policy_type?: 'liability' | 'property' | 'injury' | 'professional'
          coverage_amount?: number
          premium_amount?: number
          deductible_amount?: number | null
          policy_number?: string | null
          provider_name?: string
          start_date?: string
          end_date?: string
          is_active?: boolean | null
          claims_used?: number | null
          claims_limit?: number | null
          terms_conditions?: Json | null
          created_at?: string | null
        }
      }
      insurance_claims: {
        Row: {
          id: string
          policy_id: string | null
          task_id: string | null
          claimant_id: string | null
          claim_amount: number
          description: string
          incident_date: string
          evidence_urls: string[] | null
          status: string | null
          adjuster_notes: string | null
          approved_amount: number | null
          rejection_reason: string | null
          paid_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          policy_id?: string | null
          task_id?: string | null
          claimant_id?: string | null
          claim_amount: number
          description: string
          incident_date: string
          evidence_urls?: string[] | null
          status?: string | null
          adjuster_notes?: string | null
          approved_amount?: number | null
          rejection_reason?: string | null
          paid_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          policy_id?: string | null
          task_id?: string | null
          claimant_id?: string | null
          claim_amount?: number
          description?: string
          incident_date?: string
          evidence_urls?: string[] | null
          status?: string | null
          adjuster_notes?: string | null
          approved_amount?: number | null
          rejection_reason?: string | null
          paid_at?: string | null
          created_at?: string | null
        }
      }
      analytics_events: {
        Row: {
          id: string
          user_id: string | null
          event_type: string
          event_data: Json
          session_id: string | null
          ip_address: unknown | null
          user_agent: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          event_type: string
          event_data: Json
          session_id?: string | null
          ip_address?: unknown | null
          user_agent?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          event_type?: string
          event_data?: Json
          session_id?: string | null
          ip_address?: unknown | null
          user_agent?: string | null
          created_at?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          data: Json | null
          is_read: boolean | null
          read_at: string | null
          action_url: string | null
          expires_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: string
          data?: Json | null
          is_read?: boolean | null
          read_at?: string | null
          action_url?: string | null
          expires_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          data?: Json | null
          is_read?: boolean | null
          read_at?: string | null
          action_url?: string | null
          expires_at?: string | null
          created_at?: string | null
        }
      }
      push_tokens: {
        Row: {
          id: string
          user_id: string
          token: string
          platform: string
          is_active: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          token: string
          platform: string
          is_active?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          token?: string
          platform?: string
          is_active?: boolean | null
          created_at?: string | null
        }
      }
      platform_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: Json
          description: string | null
          is_public: boolean | null
          updated_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value: Json
          description?: string | null
          is_public?: boolean | null
          updated_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: Json
          description?: string | null
          is_public?: boolean | null
          updated_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string
          session_token: string
          device_info: Json | null
          ip_address: unknown | null
          location: unknown | null
          is_active: boolean | null
          last_activity: string | null
          expires_at: string
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          session_token: string
          device_info?: Json | null
          ip_address?: unknown | null
          location?: unknown | null
          is_active?: boolean | null
          last_activity?: string | null
          expires_at: string
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          session_token?: string
          device_info?: Json | null
          ip_address?: unknown | null
          location?: unknown | null
          is_active?: boolean | null
          last_activity?: string | null
          expires_at?: string
          created_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'client' | 'provider' | 'admin' | 'moderator' | 'verifier'
      verification_level: 'basic' | 'government' | 'enhanced' | 'community'
      verification_status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'expired'
      task_status: 'draft' | 'posted' | 'applications' | 'selected' | 'in_progress' | 'completed' | 'cancelled' | 'disputed'
      task_urgency: 'low' | 'normal' | 'high' | 'emergency'
      payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'disputed'
      payment_method: 'mtn_money' | 'orange_money' | 'moov_money' | 'wave' | 'bank_transfer' | 'cash' | 'crypto'
      incident_type: 'safety' | 'payment' | 'behavior' | 'fraud' | 'technical' | 'other'
      incident_priority: 'low' | 'medium' | 'high' | 'critical'
      fraud_alert_type: 'payment' | 'identity' | 'behavior' | 'location' | 'velocity'
      insurance_policy_type: 'liability' | 'property' | 'injury' | 'professional'
      moderation_action: 'allow' | 'warn' | 'block' | 'review'
    }
  }
}