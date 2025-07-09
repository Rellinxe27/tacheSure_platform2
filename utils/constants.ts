// utils/constants.ts
export const APP_CONFIG = {
  name: 'TâcheSûre',
  version: '1.0.0',
  colors: {
    primary: '#FF7A00',
    secondary: '#FF9500',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#FF5722',
    info: '#2196F3',
    text: {
      primary: '#333',
      secondary: '#666',
      light: '#999',
    },
    background: {
      primary: '#FFFFFF',
      secondary: '#F5F5F5',
      light: '#FAFAFA',
    }
  },
  api: {
    timeout: 10000,
    retries: 3,
  },
  features: {
    realTimeTracking: true,
    emergencyButton: true,
    videoChat: false, // Coming soon
    aiMatching: true,
  }
};

export const USER_ROLES = {
  CLIENT: 'client',
  PROVIDER: 'provider',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  VERIFIER: 'verifier'
} as const;

export const VERIFICATION_LEVELS = {
  BASIC: 'basic',
  GOVERNMENT: 'government',
  ENHANCED: 'enhanced',
  COMMUNITY: 'community'
} as const;

export const TASK_STATUS = {
  DRAFT: 'draft',
  POSTED: 'posted',
  APPLICATIONS: 'applications',
  SELECTED: 'selected',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DISPUTED: 'disputed'
} as const;

export const PAYMENT_METHODS = {
  MTN_MONEY: 'mtn_money',
  ORANGE_MONEY: 'orange_money',
  MOOV_MONEY: 'moov_money',
  WAVE: 'wave',
  BANK_TRANSFER: 'bank_transfer',
  CASH: 'cash',
  CRYPTO: 'crypto'
} as const;