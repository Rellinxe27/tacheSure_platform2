// utils/economicEmpowerment.ts
// Utility for economic empowerment features including skills development, 
// financial inclusion, and business development

import { supabase } from '@/lib/supabase';
import { fetchWithOfflineSupport, saveWithOfflineSupport } from './offlineStorage';

/**
 * Types for skills development
 */
export interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface SkillAssessment {
  id?: string;
  userId: string;
  skillId: string;
  score: number;
  completedAt: string;
  certificateUrl?: string;
}

export interface Training {
  id: string;
  title: string;
  description: string;
  provider: string;
  skillsTargeted: string[];
  duration: string;
  cost: number;
  location: string;
  startDate: string;
  endDate: string;
  isOnline: boolean;
  enrollmentUrl: string;
  imageUrl?: string;
}

export interface UserTraining {
  id?: string;
  userId: string;
  trainingId: string;
  enrollmentStatus: 'interested' | 'enrolled' | 'completed' | 'dropped';
  enrollmentDate?: string;
  completionDate?: string;
  certificateUrl?: string;
  feedback?: string;
  rating?: number;
}

/**
 * Types for financial inclusion
 */
export interface MicroLoan {
  id?: string;
  userId: string;
  amount: number;
  purpose: string;
  status: 'pending' | 'approved' | 'disbursed' | 'repaying' | 'completed' | 'rejected';
  interestRate: number;
  termMonths: number;
  monthlyPayment: number;
  totalRepayment: number;
  applicationDate: string;
  approvalDate?: string;
  disbursementDate?: string;
  completionDate?: string;
  rejectionReason?: string;
  lender: string;
}

export interface EquipmentFinancing {
  id?: string;
  userId: string;
  equipmentName: string;
  equipmentDescription: string;
  equipmentCost: number;
  downPayment: number;
  financedAmount: number;
  interestRate: number;
  termMonths: number;
  monthlyPayment: number;
  status: 'pending' | 'approved' | 'disbursed' | 'repaying' | 'completed' | 'rejected';
  applicationDate: string;
  supplier: string;
}

export interface SavingsGroup {
  id?: string;
  name: string;
  description: string;
  memberCount: number;
  totalSavings: number;
  meetingFrequency: 'weekly' | 'biweekly' | 'monthly';
  nextMeetingDate: string;
  location: string;
  createdAt: string;
}

export interface SavingsGroupMember {
  id?: string;
  groupId: string;
  userId: string;
  joinDate: string;
  contributionAmount: number;
  totalContributed: number;
  role: 'member' | 'treasurer' | 'secretary' | 'president';
}

/**
 * Types for business development
 */
export interface BusinessProfile {
  id?: string;
  userId: string;
  businessName: string;
  businessDescription: string;
  businessType: 'sole_proprietor' | 'partnership' | 'cooperative' | 'limited_company';
  registrationStatus: 'unregistered' | 'in_process' | 'registered';
  registrationNumber?: string;
  foundingDate: string;
  employeeCount: number;
  annualRevenue?: number;
  sector: string;
  location: string;
  contactEmail: string;
  contactPhone: string;
  websiteUrl?: string;
  socialMediaLinks?: { platform: string; url: string }[];
}

export interface BusinessGoal {
  id?: string;
  businessId: string;
  title: string;
  description: string;
  targetDate: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'deferred';
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessOpportunity {
  id: string;
  title: string;
  description: string;
  opportunityType: 'contract' | 'grant' | 'partnership' | 'export' | 'government';
  sector: string;
  organization: string;
  value?: number;
  applicationDeadline: string;
  location: string;
  contactEmail?: string;
  contactPhone?: string;
  websiteUrl?: string;
  eligibilityCriteria: string[];
  createdAt: string;
}

/**
 * Skills Development Functions
 */

/**
 * Get available skills for assessment
 */
export async function getAvailableSkills(): Promise<Skill[]> {
  return fetchWithOfflineSupport<Skill>(
    'skills',
    supabase.from('skills').select('*').eq('is_active', true)
  );
}

/**
 * Get user's skill assessments
 */
export async function getUserSkillAssessments(userId: string): Promise<SkillAssessment[]> {
  return fetchWithOfflineSupport<SkillAssessment>(
    'skill_assessments',
    supabase
      .from('skill_assessments')
      .select('*')
      .eq('userId', userId)
      .order('completedAt', { ascending: false })
  );
}

/**
 * Complete a skill assessment
 */
export async function completeSkillAssessment(
  assessment: Omit<SkillAssessment, 'id'>
): Promise<{ success: boolean; data?: SkillAssessment }> {
  const result = await saveWithOfflineSupport(
    'skill_assessments',
    'insert',
    {
      ...assessment,
      completedAt: assessment.completedAt || new Date().toISOString()
    }
  );

  if (result.success) {
    // Update user's skills in profile
    await updateUserSkillsProfile(assessment.userId);
  }

  return result;
}

/**
 * Update user's skills profile based on assessments
 */
async function updateUserSkillsProfile(userId: string): Promise<void> {
  try {
    // Get all user's skill assessments
    const assessments = await getUserSkillAssessments(userId);
    
    // Get all skills
    const skills = await getAvailableSkills();
    
    // Calculate skill levels
    const skillLevels: Record<string, { level: string; score: number }> = {};
    
    assessments.forEach(assessment => {
      const skill = skills.find(s => s.id === assessment.skillId);
      if (skill) {
        // If multiple assessments for same skill, use the highest score
        if (!skillLevels[skill.id] || assessment.score > skillLevels[skill.id].score) {
          let level = 'beginner';
          if (assessment.score >= 90) level = 'expert';
          else if (assessment.score >= 75) level = 'advanced';
          else if (assessment.score >= 50) level = 'intermediate';
          
          skillLevels[skill.id] = { 
            level, 
            score: assessment.score 
          };
        }
      }
    });
    
    // Update user profile with skills
    const { data: profile } = await supabase
      .from('profiles')
      .select('skills, updated_at')
      .eq('id', userId)
      .single();
      
    if (profile) {
      await supabase
        .from('profiles')
        .update({
          skills: skillLevels,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
    }
  } catch (error) {
    console.error('Error updating user skills profile:', error);
  }
}

/**
 * Get available training programs
 */
export async function getAvailableTrainings(filters?: {
  skillIds?: string[];
  isOnline?: boolean;
  maxCost?: number;
}): Promise<Training[]> {
  let query = supabase.from('trainings').select('*').eq('is_active', true);
  
  if (filters) {
    if (filters.isOnline !== undefined) {
      query = query.eq('isOnline', filters.isOnline);
    }
    
    if (filters.maxCost !== undefined) {
      query = query.lte('cost', filters.maxCost);
    }
    
    // Skill filtering would need to be done client-side since it's an array field
  }
  
  const trainings = await fetchWithOfflineSupport<Training>(
    'trainings',
    query.order('startDate', { ascending: true })
  );
  
  // Apply skill filter if needed
  if (filters?.skillIds && filters.skillIds.length > 0) {
    return trainings.filter(training => 
      training.skillsTargeted.some(skillId => filters.skillIds?.includes(skillId))
    );
  }
  
  return trainings;
}

/**
 * Enroll in a training program
 */
export async function enrollInTraining(
  userId: string,
  trainingId: string
): Promise<{ success: boolean }> {
  const enrollment: Omit<UserTraining, 'id'> = {
    userId,
    trainingId,
    enrollmentStatus: 'enrolled',
    enrollmentDate: new Date().toISOString()
  };
  
  const result = await saveWithOfflineSupport(
    'user_trainings',
    'insert',
    enrollment
  );
  
  return { success: result.success };
}

/**
 * Get user's enrolled trainings
 */
export async function getUserTrainings(userId: string): Promise<UserTraining[]> {
  return fetchWithOfflineSupport<UserTraining>(
    'user_trainings',
    supabase
      .from('user_trainings')
      .select('*')
      .eq('userId', userId)
      .order('enrollmentDate', { ascending: false })
  );
}

/**
 * Complete a training program
 */
export async function completeTraining(
  userTrainingId: string,
  completionData: {
    completionDate: string;
    certificateUrl?: string;
    feedback?: string;
    rating?: number;
  }
): Promise<{ success: boolean }> {
  const result = await saveWithOfflineSupport(
    'user_trainings',
    'update',
    {
      enrollmentStatus: 'completed',
      ...completionData
    },
    { column: 'id', value: userTrainingId }
  );
  
  return { success: result.success };
}

/**
 * Financial Inclusion Functions
 */

/**
 * Apply for a micro loan
 */
export async function applyForMicroLoan(
  loan: Omit<MicroLoan, 'id' | 'status' | 'applicationDate'>
): Promise<{ success: boolean; data?: MicroLoan }> {
  const loanApplication: Omit<MicroLoan, 'id'> = {
    ...loan,
    status: 'pending',
    applicationDate: new Date().toISOString()
  };
  
  const result = await saveWithOfflineSupport(
    'micro_loans',
    'insert',
    loanApplication
  );
  
  return result;
}

/**
 * Get user's micro loans
 */
export async function getUserMicroLoans(userId: string): Promise<MicroLoan[]> {
  return fetchWithOfflineSupport<MicroLoan>(
    'micro_loans',
    supabase
      .from('micro_loans')
      .select('*')
      .eq('userId', userId)
      .order('applicationDate', { ascending: false })
  );
}

/**
 * Apply for equipment financing
 */
export async function applyForEquipmentFinancing(
  financing: Omit<EquipmentFinancing, 'id' | 'status' | 'applicationDate'>
): Promise<{ success: boolean; data?: EquipmentFinancing }> {
  const financingApplication: Omit<EquipmentFinancing, 'id'> = {
    ...financing,
    status: 'pending',
    applicationDate: new Date().toISOString()
  };
  
  const result = await saveWithOfflineSupport(
    'equipment_financing',
    'insert',
    financingApplication
  );
  
  return result;
}

/**
 * Get user's equipment financing applications
 */
export async function getUserEquipmentFinancing(userId: string): Promise<EquipmentFinancing[]> {
  return fetchWithOfflineSupport<EquipmentFinancing>(
    'equipment_financing',
    supabase
      .from('equipment_financing')
      .select('*')
      .eq('userId', userId)
      .order('applicationDate', { ascending: false })
  );
}

/**
 * Get available savings groups
 */
export async function getAvailableSavingsGroups(): Promise<SavingsGroup[]> {
  return fetchWithOfflineSupport<SavingsGroup>(
    'savings_groups',
    supabase
      .from('savings_groups')
      .select('*')
      .order('createdAt', { ascending: false })
  );
}

/**
 * Join a savings group
 */
export async function joinSavingsGroup(
  userId: string,
  groupId: string,
  contributionAmount: number
): Promise<{ success: boolean }> {
  const membership: Omit<SavingsGroupMember, 'id'> = {
    userId,
    groupId,
    joinDate: new Date().toISOString(),
    contributionAmount,
    totalContributed: 0,
    role: 'member'
  };
  
  const result = await saveWithOfflineSupport(
    'savings_group_members',
    'insert',
    membership
  );
  
  return { success: result.success };
}

/**
 * Get user's savings group memberships
 */
export async function getUserSavingsGroups(userId: string): Promise<SavingsGroupMember[]> {
  return fetchWithOfflineSupport<SavingsGroupMember>(
    'savings_group_members',
    supabase
      .from('savings_group_members')
      .select('*')
      .eq('userId', userId)
      .order('joinDate', { ascending: false })
  );
}

/**
 * Business Development Functions
 */

/**
 * Create or update a business profile
 */
export async function saveBusinessProfile(
  profile: Omit<BusinessProfile, 'id'>
): Promise<{ success: boolean; data?: BusinessProfile }> {
  // Check if profile already exists
  const { data: existingProfile } = await supabase
    .from('business_profiles')
    .select('id')
    .eq('userId', profile.userId)
    .single();
  
  let result;
  
  if (existingProfile) {
    // Update existing profile
    result = await saveWithOfflineSupport(
      'business_profiles',
      'update',
      profile,
      { column: 'id', value: existingProfile.id }
    );
  } else {
    // Create new profile
    result = await saveWithOfflineSupport(
      'business_profiles',
      'insert',
      profile
    );
  }
  
  return result;
}

/**
 * Get a user's business profile
 */
export async function getBusinessProfile(userId: string): Promise<BusinessProfile | null> {
  const profiles = await fetchWithOfflineSupport<BusinessProfile>(
    'business_profiles',
    supabase
      .from('business_profiles')
      .select('*')
      .eq('userId', userId)
      .limit(1)
  );
  
  return profiles.length > 0 ? profiles[0] : null;
}

/**
 * Create a business goal
 */
export async function createBusinessGoal(
  goal: Omit<BusinessGoal, 'id' | 'createdAt' | 'updatedAt'>
): Promise<{ success: boolean; data?: BusinessGoal }> {
  const newGoal: Omit<BusinessGoal, 'id'> = {
    ...goal,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const result = await saveWithOfflineSupport(
    'business_goals',
    'insert',
    newGoal
  );
  
  return result;
}

/**
 * Update a business goal
 */
export async function updateBusinessGoal(
  goalId: string,
  updates: Partial<BusinessGoal>
): Promise<{ success: boolean }> {
  const result = await saveWithOfflineSupport(
    'business_goals',
    'update',
    {
      ...updates,
      updatedAt: new Date().toISOString()
    },
    { column: 'id', value: goalId }
  );
  
  return { success: result.success };
}

/**
 * Get business goals for a business
 */
export async function getBusinessGoals(businessId: string): Promise<BusinessGoal[]> {
  return fetchWithOfflineSupport<BusinessGoal>(
    'business_goals',
    supabase
      .from('business_goals')
      .select('*')
      .eq('businessId', businessId)
      .order('targetDate', { ascending: true })
  );
}

/**
 * Get business opportunities
 */
export async function getBusinessOpportunities(filters?: {
  sector?: string;
  opportunityType?: string;
  maxValue?: number;
}): Promise<BusinessOpportunity[]> {
  let query = supabase.from('business_opportunities').select('*');
  
  if (filters) {
    if (filters.sector) {
      query = query.eq('sector', filters.sector);
    }
    
    if (filters.opportunityType) {
      query = query.eq('opportunityType', filters.opportunityType);
    }
    
    if (filters.maxValue) {
      query = query.lte('value', filters.maxValue);
    }
  }
  
  return fetchWithOfflineSupport<BusinessOpportunity>(
    'business_opportunities',
    query.order('applicationDeadline', { ascending: true })
  );
}

/**
 * Express interest in a business opportunity
 */
export async function expressInterestInOpportunity(
  userId: string,
  opportunityId: string
): Promise<{ success: boolean }> {
  const result = await saveWithOfflineSupport(
    'opportunity_interests',
    'insert',
    {
      userId,
      opportunityId,
      expressedAt: new Date().toISOString(),
      status: 'interested'
    }
  );
  
  return { success: result.success };
}

/**
 * Get government contract opportunities
 * This is a specialized function for government contracts
 */
export async function getGovernmentContracts(): Promise<BusinessOpportunity[]> {
  return fetchWithOfflineSupport<BusinessOpportunity>(
    'business_opportunities',
    supabase
      .from('business_opportunities')
      .select('*')
      .eq('opportunityType', 'government')
      .order('applicationDeadline', { ascending: true })
  );
}

/**
 * Get export opportunities
 * This is a specialized function for export opportunities
 */
export async function getExportOpportunities(): Promise<BusinessOpportunity[]> {
  return fetchWithOfflineSupport<BusinessOpportunity>(
    'business_opportunities',
    supabase
      .from('business_opportunities')
      .select('*')
      .eq('opportunityType', 'export')
      .order('applicationDeadline', { ascending: true })
  );
}