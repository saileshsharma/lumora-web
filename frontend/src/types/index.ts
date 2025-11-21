/**
 * TypeScript Type Definitions
 */

import { APP_MODES, ARENA_TABS, OCCASIONS } from '../constants';

// Extract types from constants
export type AppMode = (typeof APP_MODES)[keyof typeof APP_MODES];
export type ArenaTab = (typeof ARENA_TABS)[keyof typeof ARENA_TABS];
export type Occasion = (typeof OCCASIONS)[number];

// API Response Types
export interface ShoppingRecommendation {
  item: string;
  description: string;
  price: string;
  reason: string;
}

export interface RatingResponse {
  wow_factor: number;
  occasion_fitness: number;
  overall_rating: number;
  wow_factor_explanation: string;
  occasion_fitness_explanation: string;
  overall_explanation: string;
  strengths: string[];
  improvements: string[];
  suggestions: string[];
  roast?: string;
  shopping_recommendations?: ShoppingRecommendation[];
}

export interface OutfitItem {
  type: string;
  description: string;
  color: string;
  style_notes: string;
}

export interface ProductRecommendation {
  item: string;
  type: string;
  brand: string;
  description: string;
  price: string;
  reason: string;
}

export interface OutfitDetails {
  outfit_concept: string;
  items: OutfitItem[];
  color_palette: string;
  occasion_notes: string;
  product_recommendations: ProductRecommendation[];
}

export interface GeneratorResponse {
  outfit_description: string; // JSON string that needs to be parsed
  outfit_image_url: string;
}

export interface ArenaSubmission {
  id: string;
  photo: string;  // Base64 image data
  title: string;
  description: string;
  occasion: string;
  likes: number;
  votes: number;
  avg_rating: number;
  created_at: string;
  source_mode?: string;
}

export interface LeaderboardEntry {
  id: string;
  photo: string;  // Base64 image data
  title: string;
  occasion: string;
  avg_rating: number;
  likes: number;
  votes: number;
  rank?: number;
}

export interface VoteRequest {
  submission1_id: string;
  submission2_id: string;
  winner_id: string;
}

// Component Props Types
export interface ImageUploadProps {
  onImageSelect: (imageData: string) => void;
  currentImage: string | null;
  mode: 'rater' | 'generator';
}

export interface OutfitCardProps {
  submission: ArenaSubmission;
  onLike?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// State Types
export interface AppState {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
  sharedImage: string | null;
  setSharedImage: (image: string | null) => void;
}

export interface RaterState {
  imageData: string | null;
  occasion: Occasion | null;
  budget: string | null;
  results: RatingResponse | null;
  isLoading: boolean;
  setImageData: (data: string | null) => void;
  setOccasion: (occasion: Occasion | null) => void;
  setBudget: (budget: string | null) => void;
  setResults: (results: RatingResponse | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export interface GeneratorState {
  imageData: string | null;
  occasion: Occasion | null;
  budget: string | null;
  results: GeneratorResponse | null;
  isLoading: boolean;
  setImageData: (data: string | null) => void;
  setOccasion: (occasion: Occasion | null) => void;
  setBudget: (budget: string | null) => void;
  setResults: (results: GeneratorResponse | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export interface ArenaState {
  activeTab: ArenaTab;
  submissions: ArenaSubmission[];
  leaderboard: LeaderboardEntry[];
  currentPage: number;
  isLoading: boolean;
  setActiveTab: (tab: ArenaTab) => void;
  setSubmissions: (submissions: ArenaSubmission[]) => void;
  setLeaderboard: (leaderboard: LeaderboardEntry[]) => void;
  setCurrentPage: (page: number) => void;
  setLoading: (loading: boolean) => void;
  addSubmission: (submission: ArenaSubmission) => void;
  removeSubmission: (id: string) => void;
  updateSubmissionLikes: (id: string, likes: number) => void;
}

// Utility Types
export interface ApiError {
  message: string;
  status?: number;
  details?: unknown;
}

export interface CameraState {
  isOpen: boolean;
  stream: MediaStream | null;
  mode: 'rater' | 'generator' | null;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
}
