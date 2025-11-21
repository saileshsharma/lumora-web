/**
 * Application Constants
 * Centralized configuration values
 */

// API Configuration
// Use environment variable if set, otherwise use defaults
const getApiBaseUrl = () => {
  // Check for environment variable (Vite exposes env vars with VITE_ prefix)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5001/api';
  }

  // Production - direct connection to your Railway backend (CORS properly configured)
  return 'https://web-production-c70ba.up.railway.app/api';
};

export const API_BASE_URL = getApiBaseUrl();

// App Modes
export const APP_MODES = {
  RATER: 'rater',
  GENERATOR: 'generator',
  ARENA: 'arena',
  TEAM: 'team',
} as const;

// Occasions
export const OCCASIONS = [
  'Casual',
  'Formal',
  'Business',
  'Party',
  'Wedding',
  'Date Night',
  'Gym',
  'Beach',
  'Travel',
] as const;

// Arena Tabs
export const ARENA_TABS = {
  BROWSE: 'browse',
  LEADERBOARD: 'leaderboard',
} as const;

// Pagination
export const ITEMS_PER_PAGE = 10;

// File Upload
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Camera
export const CAMERA_CONSTRAINTS = {
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: 'environment',
  },
};

// Budget Options
export const BUDGET_RANGES = [
  'Under $50',
  '$50-$100',
  '$100-$200',
  '$200-$500',
  'Above $500',
  'No budget limit',
] as const;

// Shopping Links
export const SHOPPING_SITES = {
  AMAZON: 'amazon.com',
  ASOS: 'asos.com',
  ZARA: 'zara.com',
  HM: 'hm.com',
  NORDSTROM: 'nordstrom.com',
  SHEIN: 'shein.com',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  FILE_TOO_LARGE: `File size must be under ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
  INVALID_FILE_TYPE: 'Please upload a valid image file (JPEG, PNG, or WebP)',
  NO_IMAGE_SELECTED: 'Please select an image first',
  SERVER_ERROR: 'Something went wrong. Please try again later.',
  BACKEND_DOWN: 'Cannot connect to server. Please ensure the backend is running.',
  CAMERA_PERMISSION_DENIED: 'Camera access denied. Please enable camera permissions.',
  CAMERA_NOT_AVAILABLE: 'Camera not available on this device.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  SUBMISSION_CREATED: 'Outfit submitted successfully!',
  VOTE_RECORDED: 'Vote recorded!',
  LIKE_ADDED: 'Liked!',
  SUBMISSION_DELETED: 'Submission deleted successfully',
} as const;

// Loading Messages
export const LOADING_MESSAGES = {
  RATING_OUTFIT: 'AI is analyzing your outfit...',
  GENERATING_OUTFIT: 'AI is creating your perfect outfit...',
  LOADING_SUBMISSIONS: 'Loading submissions...',
  LOADING_LEADERBOARD: 'Loading leaderboard...',
  SUBMITTING: 'Submitting...',
  DELETING: 'Deleting...',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  LAST_MODE: 'outfit_assistant_last_mode',
  USER_PREFERENCES: 'outfit_assistant_preferences',
  AUTH: 'outfit_assistant_auth',
  THEME: 'outfit_assistant_theme',
} as const;
