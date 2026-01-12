// Rate table based on official FINOM rates (Updated: 7 January 2026)
// Rates are indexed by duration (years) and profile

export type RateProfile = 'excellent' | 'bon' | 'standard';

export interface RateData {
  rate: number;
  profile: RateProfile;
  profileLabel: string;
}

// Official rate table from images
export const RATE_TABLE: Record<number, Record<RateProfile, number>> = {
  5: { excellent: 2.25, bon: 2.36, standard: 2.43 },
  10: { excellent: 2.63, bon: 2.72, standard: 2.86 },
  15: { excellent: 2.86, bon: 2.96, standard: 3.04 },
  20: { excellent: 2.93, bon: 3.03, standard: 3.14 },
  25: { excellent: 3.01, bon: 3.12, standard: 3.22 },
  30: { excellent: 3.22, bon: 3.34, standard: 3.42 },
};

// Profile labels in French
export const PROFILE_LABELS: Record<RateProfile, string> = {
  excellent: 'Profil Excellent',
  bon: 'Profil Bon',
  standard: 'Profil Standard',
};

// Profile colors for UI
export const PROFILE_COLORS: Record<RateProfile, { bg: string; text: string; header: string }> = {
  excellent: { bg: '#d1fae5', text: '#047857', header: '#10b981' },
  bon: { bg: '#dbeafe', text: '#1d4ed8', header: '#3b82f6' },
  standard: { bg: '#fef3c7', text: '#d97706', header: '#f59e0b' },
};

// Profile criteria descriptions
export const PROFILE_CRITERIA: Record<RateProfile, string> = {
  excellent: 'Apport ≥25%, CDI ancien, endettement <25%',
  bon: 'Apport ≥15%, CDI, endettement <30%',
  standard: 'Apport ≥10%, situation stable, endettement <35%',
};

// Determine profile based on contribution percentage
export function getProfileFromContribution(contributionPercent: number): RateProfile {
  if (contributionPercent >= 0.25) return 'excellent';
  if (contributionPercent >= 0.15) return 'bon';
  return 'standard';
}

// Get the nearest duration key (5, 10, 15, 20, 25, 30)
export function getNearestDuration(duration: number): number {
  const durations = [5, 10, 15, 20, 25, 30];
  
  if (duration <= 5) return 5;
  if (duration >= 30) return 30;
  
  // Find the closest duration
  let nearest = durations[0];
  let minDiff = Math.abs(duration - nearest);
  
  for (const d of durations) {
    const diff = Math.abs(duration - d);
    if (diff < minDiff) {
      minDiff = diff;
      nearest = d;
    }
  }
  
  return nearest;
}

// Interpolate rate for exact duration
export function getInterpolatedRate(duration: number, profile: RateProfile): number {
  const durations = [5, 10, 15, 20, 25, 30];
  
  if (duration <= 5) return RATE_TABLE[5][profile];
  if (duration >= 30) return RATE_TABLE[30][profile];
  
  // Find surrounding durations
  let lowerDuration = 5;
  let upperDuration = 30;
  
  for (let i = 0; i < durations.length - 1; i++) {
    if (duration >= durations[i] && duration <= durations[i + 1]) {
      lowerDuration = durations[i];
      upperDuration = durations[i + 1];
      break;
    }
  }
  
  const lowerRate = RATE_TABLE[lowerDuration][profile];
  const upperRate = RATE_TABLE[upperDuration][profile];
  
  // Linear interpolation
  const ratio = (duration - lowerDuration) / (upperDuration - lowerDuration);
  const interpolatedRate = lowerRate + (upperRate - lowerRate) * ratio;
  
  return Math.round(interpolatedRate * 100) / 100;
}

// Main function to get rate for profile
export function getRateForProfile(duration: number, contributionPercent: number): RateData {
  const profile = getProfileFromContribution(contributionPercent);
  const rate = getInterpolatedRate(duration, profile);
  
  return {
    rate,
    profile,
    profileLabel: PROFILE_LABELS[profile],
  };
}

// Get all durations for display
export function getAllDurations(): number[] {
  return [5, 10, 15, 20, 25, 30];
}

// Get all profiles for display
export function getAllProfiles(): RateProfile[] {
  return ['excellent', 'bon', 'standard'];
}
