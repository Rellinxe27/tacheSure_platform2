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
      task_status: 'draft' | 'posted' | 'applications' | 'selected' | 'in_progress' | 'completed' | 'cancelled' | 'disputed'
      task_urgency: 'low' | 'normal' | 'high' | 'emergency'
    }
  }
}