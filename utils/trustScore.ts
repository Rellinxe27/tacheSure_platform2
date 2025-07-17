// utils/trustScore.ts
// Implementation of the trust score calculation formula as specified in requirements

/**
 * Calculate a user's trust score based on multiple factors
 * 
 * Formula:
 * TrustScore = (
 *   IdentityVerificationLevel * 0.25 +
 *   CompletedTasksCount * 0.20 +
 *   AverageClientRating * 0.20 +
 *   ResponseTimeScore * 0.10 +
 *   (1 - CancellationRate) * 0.10 +
 *   CommunityEndorsements * 0.10 +
 *   BackgroundCheckStatus * 0.05
 * ) * 100
 */

// Types for trust score calculation
export interface TrustScoreFactors {
  identityVerificationLevel: 'basic' | 'government' | 'enhanced' | 'community';
  completedTasksCount: number;
  averageClientRating: number; // 0-5 scale
  responseTimeMinutes: number;
  cancelledTasksCount: number;
  totalTasksCount: number;
  communityEndorsementsCount: number;
  hasBackgroundCheck: boolean;
  // Additional factors (optional)
  punctualityScore?: number; // 0-1 scale
  communicationQualityRating?: number; // 0-5 scale
  problemSolvingAbility?: number; // 0-5 scale
  professionalismScore?: number; // 0-5 scale
  continuousEducation?: boolean;
}

/**
 * Convert verification level to a numeric value for calculation
 */
export function getVerificationLevelValue(level: 'basic' | 'government' | 'enhanced' | 'community'): number {
  switch (level) {
    case 'community': return 1.0;
    case 'enhanced': return 0.8;
    case 'government': return 0.6;
    case 'basic': return 0.3;
    default: return 0.0;
  }
}

/**
 * Calculate response time score (inversely proportional to response time)
 * Lower response time = higher score
 */
export function calculateResponseTimeScore(responseTimeMinutes: number): number {
  if (responseTimeMinutes <= 5) return 1.0;
  if (responseTimeMinutes <= 15) return 0.9;
  if (responseTimeMinutes <= 30) return 0.8;
  if (responseTimeMinutes <= 60) return 0.6;
  if (responseTimeMinutes <= 120) return 0.4;
  return 0.2;
}

/**
 * Calculate cancellation rate (0-1 scale)
 */
export function calculateCancellationRate(cancelledTasks: number, totalTasks: number): number {
  if (totalTasks === 0) return 0;
  return Math.min(1, cancelledTasks / totalTasks);
}

/**
 * Calculate community endorsements score (0-1 scale)
 */
export function calculateCommunityEndorsementsScore(endorsementsCount: number): number {
  if (endorsementsCount >= 10) return 1.0;
  if (endorsementsCount >= 5) return 0.8;
  if (endorsementsCount >= 3) return 0.6;
  if (endorsementsCount >= 1) return 0.4;
  return 0.0;
}

/**
 * Calculate the completed tasks score (0-1 scale)
 */
export function calculateCompletedTasksScore(completedTasksCount: number): number {
  if (completedTasksCount >= 50) return 1.0;
  if (completedTasksCount >= 25) return 0.9;
  if (completedTasksCount >= 10) return 0.7;
  if (completedTasksCount >= 5) return 0.5;
  if (completedTasksCount >= 1) return 0.3;
  return 0.0;
}

/**
 * Calculate the rating score (0-1 scale)
 */
export function calculateRatingScore(averageRating: number): number {
  // Convert 0-5 scale to 0-1 scale
  return Math.min(1, Math.max(0, averageRating / 5));
}

/**
 * Calculate the overall trust score based on all factors
 * Returns a score from 0-100
 */
export function calculateTrustScore(factors: TrustScoreFactors): number {
  // Calculate component scores
  const verificationScore = getVerificationLevelValue(factors.identityVerificationLevel);
  const completedTasksScore = calculateCompletedTasksScore(factors.completedTasksCount);
  const ratingScore = calculateRatingScore(factors.averageClientRating);
  const responseTimeScore = calculateResponseTimeScore(factors.responseTimeMinutes);
  const cancellationRate = calculateCancellationRate(
    factors.cancelledTasksCount,
    factors.totalTasksCount
  );
  const communityEndorsementsScore = calculateCommunityEndorsementsScore(
    factors.communityEndorsementsCount
  );
  const backgroundCheckScore = factors.hasBackgroundCheck ? 1.0 : 0.0;

  // Apply the formula
  const trustScore = (
    verificationScore * 0.25 +
    completedTasksScore * 0.20 +
    ratingScore * 0.20 +
    responseTimeScore * 0.10 +
    (1 - cancellationRate) * 0.10 +
    communityEndorsementsScore * 0.10 +
    backgroundCheckScore * 0.05
  ) * 100;

  // Round to nearest integer and ensure it's between 0-100
  return Math.min(100, Math.max(0, Math.round(trustScore)));
}

/**
 * Get a descriptive trust level based on the numeric score
 */
export function getTrustLevel(trustScore: number): string {
  if (trustScore >= 95) return 'Excellent';
  if (trustScore >= 85) return 'Très bon';
  if (trustScore >= 75) return 'Bon';
  if (trustScore >= 60) return 'Correct';
  return 'À améliorer';
}

/**
 * Get the color associated with a trust score
 */
export function getTrustScoreColor(trustScore: number): string {
  if (trustScore >= 95) return '#4CAF50'; // Excellent - Green
  if (trustScore >= 85) return '#8BC34A'; // Very Good - Light Green
  if (trustScore >= 75) return '#FFC107'; // Good - Amber
  if (trustScore >= 60) return '#FF9800'; // Fair - Orange
  return '#FF5722'; // Poor - Deep Orange
}