/**
 * Style Profile Store
 * Manages user style preferences, likes/dislikes, and personalization
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '../constants';
import type { Occasion } from '../types';

// Style Preferences
export interface StylePreferences {
  favoriteColors: string[];
  avoidColors: string[];
  preferredStyles: string[];
  avoidStyles: string[];
  favoriteBrands: string[];
  bodyType?: 'petite' | 'athletic' | 'curvy' | 'tall' | 'plus-size';
  preferredFit?: 'tight' | 'fitted' | 'regular' | 'loose' | 'oversized';
  formalityLevel?: 'casual' | 'smart-casual' | 'business' | 'formal';
  sustainabilityPreference?: boolean;
}

// Outfit Feedback
export interface OutfitFeedback {
  outfitId: string;
  liked: boolean; // true = liked, false = disliked
  timestamp: number;
  occasion: Occasion | null;
  reason?: string; // Optional reason for feedback
  specificDislikes?: string[]; // What specifically they didn't like
}

// Budget Preferences
export interface BudgetPreferences {
  defaultBudget: string;
  maxPricePerItem?: number;
  preferredPriceRange: {
    tops: { min: number; max: number };
    bottoms: { min: number; max: number };
    shoes: { min: number; max: number };
    accessories: { min: number; max: number };
  };
}

// Analytics Data
export interface StyleAnalytics {
  totalOutfitsGenerated: number;
  totalOutfitsLiked: number;
  totalOutfitsDisliked: number;
  mostLikedOccasion: string | null;
  mostUsedColors: string[];
  likeRate: number; // Percentage
  favoriteSeasons: string[];
  styleEvolution: {
    month: string;
    likedStyles: string[];
  }[];
}

interface StyleProfileState {
  // User Preferences
  preferences: StylePreferences;
  budgetPreferences: BudgetPreferences;

  // Feedback History
  feedback: OutfitFeedback[];

  // Analytics
  analytics: StyleAnalytics;

  // Profile completeness
  profileCompleteness: number; // 0-100%

  // Methods - Preferences
  updatePreferences: (preferences: Partial<StylePreferences>) => void;
  updateBudgetPreferences: (budget: Partial<BudgetPreferences>) => void;
  addFavoriteColor: (color: string) => void;
  removeFavoriteColor: (color: string) => void;
  addAvoidColor: (color: string) => void;
  removeAvoidColor: (color: string) => void;
  addPreferredStyle: (style: string) => void;
  removePreferredStyle: (style: string) => void;

  // Methods - Feedback
  addFeedback: (feedback: Omit<OutfitFeedback, 'timestamp'>) => void;
  getFeedbackForOutfit: (outfitId: string) => OutfitFeedback | undefined;
  getLikedOutfits: () => OutfitFeedback[];
  getDislikedOutfits: () => OutfitFeedback[];
  clearFeedback: () => void;

  // Methods - Analytics
  calculateAnalytics: () => StyleAnalytics;
  getRecommendations: () => string[];
  getStyleInsights: () => {
    favoriteOccasions: string[];
    topColors: string[];
    stylePatterns: string[];
  };

  // Methods - Profile
  calculateProfileCompleteness: () => number;
  resetProfile: () => void;
}

const initialPreferences: StylePreferences = {
  favoriteColors: [],
  avoidColors: [],
  preferredStyles: [],
  avoidStyles: [],
  favoriteBrands: [],
};

const initialBudgetPreferences: BudgetPreferences = {
  defaultBudget: 'No budget limit',
  preferredPriceRange: {
    tops: { min: 0, max: 1000 },
    bottoms: { min: 0, max: 1000 },
    shoes: { min: 0, max: 1000 },
    accessories: { min: 0, max: 500 },
  },
};

const initialAnalytics: StyleAnalytics = {
  totalOutfitsGenerated: 0,
  totalOutfitsLiked: 0,
  totalOutfitsDisliked: 0,
  mostLikedOccasion: null,
  mostUsedColors: [],
  likeRate: 0,
  favoriteSeasons: [],
  styleEvolution: [],
};

export const useStyleProfileStore = create<StyleProfileState>()(
  persist(
    (set, get) => ({
      preferences: initialPreferences,
      budgetPreferences: initialBudgetPreferences,
      feedback: [],
      analytics: initialAnalytics,
      profileCompleteness: 0,

      // Update preferences
      updatePreferences: (newPreferences) => {
        set((state) => ({
          preferences: { ...state.preferences, ...newPreferences },
        }));
        get().calculateProfileCompleteness();
      },

      updateBudgetPreferences: (newBudget) => {
        set((state) => ({
          budgetPreferences: { ...state.budgetPreferences, ...newBudget },
        }));
      },

      addFavoriteColor: (color) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            favoriteColors: [...new Set([...state.preferences.favoriteColors, color])],
          },
        }));
      },

      removeFavoriteColor: (color) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            favoriteColors: state.preferences.favoriteColors.filter((c) => c !== color),
          },
        }));
      },

      addAvoidColor: (color) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            avoidColors: [...new Set([...state.preferences.avoidColors, color])],
          },
        }));
      },

      removeAvoidColor: (color) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            avoidColors: state.preferences.avoidColors.filter((c) => c !== color),
          },
        }));
      },

      addPreferredStyle: (style) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            preferredStyles: [...new Set([...state.preferences.preferredStyles, style])],
          },
        }));
      },

      removePreferredStyle: (style) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            preferredStyles: state.preferences.preferredStyles.filter((s) => s !== style),
          },
        }));
      },

      // Add feedback
      addFeedback: (feedback) => {
        const newFeedback: OutfitFeedback = {
          ...feedback,
          timestamp: Date.now(),
        };

        set((state) => ({
          feedback: [newFeedback, ...state.feedback],
        }));

        // Recalculate analytics
        get().calculateAnalytics();
      },

      getFeedbackForOutfit: (outfitId) => {
        return get().feedback.find((f) => f.outfitId === outfitId);
      },

      getLikedOutfits: () => {
        return get().feedback.filter((f) => f.liked);
      },

      getDislikedOutfits: () => {
        return get().feedback.filter((f) => !f.liked);
      },

      clearFeedback: () => {
        set({ feedback: [] });
      },

      // Calculate analytics
      calculateAnalytics: () => {
        const state = get();
        const liked = state.feedback.filter((f) => f.liked);
        const disliked = state.feedback.filter((f) => !f.liked);

        // Find most liked occasion
        const occasionCounts: Record<string, number> = {};
        liked.forEach((f) => {
          if (f.occasion) {
            occasionCounts[f.occasion] = (occasionCounts[f.occasion] || 0) + 1;
          }
        });
        const mostLikedOccasion =
          Object.keys(occasionCounts).length > 0
            ? Object.entries(occasionCounts).sort((a, b) => b[1] - a[1])[0][0]
            : null;

        const analytics: StyleAnalytics = {
          totalOutfitsGenerated: state.feedback.length,
          totalOutfitsLiked: liked.length,
          totalOutfitsDisliked: disliked.length,
          mostLikedOccasion,
          mostUsedColors: state.preferences.favoriteColors,
          likeRate: state.feedback.length > 0 ? (liked.length / state.feedback.length) * 100 : 0,
          favoriteSeasons: [],
          styleEvolution: [],
        };

        set({ analytics });
        return analytics;
      },

      // Get recommendations based on preferences and feedback
      getRecommendations: () => {
        const state = get();
        const recommendations: string[] = [];

        // Based on like rate
        if (state.analytics.likeRate < 50 && state.analytics.totalOutfitsGenerated > 5) {
          recommendations.push('Try updating your style preferences for better matches');
        }

        // Based on favorite colors
        if (state.preferences.favoriteColors.length === 0) {
          recommendations.push('Add your favorite colors to get more personalized outfits');
        }

        // Based on budget
        if (state.budgetPreferences.defaultBudget === 'No budget limit') {
          recommendations.push('Set a budget to get more realistic shopping recommendations');
        }

        // Based on body type
        if (!state.preferences.bodyType) {
          recommendations.push('Add your body type for better-fitting outfit suggestions');
        }

        return recommendations;
      },

      getStyleInsights: () => {
        const state = get();
        const liked = state.feedback.filter((f) => f.liked);

        // Count occasions
        const occasions: Record<string, number> = {};
        liked.forEach((f) => {
          if (f.occasion) {
            occasions[f.occasion] = (occasions[f.occasion] || 0) + 1;
          }
        });

        return {
          favoriteOccasions: Object.entries(occasions)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map((e) => e[0]),
          topColors: state.preferences.favoriteColors.slice(0, 5),
          stylePatterns: state.preferences.preferredStyles,
        };
      },

      // Calculate profile completeness
      calculateProfileCompleteness: () => {
        const state = get();
        let completeness = 0;
        const maxPoints = 100;

        // Preferences (50 points)
        if (state.preferences.favoriteColors.length > 0) completeness += 10;
        if (state.preferences.preferredStyles.length > 0) completeness += 10;
        if (state.preferences.bodyType) completeness += 10;
        if (state.preferences.preferredFit) completeness += 10;
        if (state.preferences.formalityLevel) completeness += 10;

        // Budget (20 points)
        if (state.budgetPreferences.defaultBudget !== 'No budget limit') completeness += 20;

        // Feedback (30 points)
        if (state.feedback.length > 0) completeness += 10;
        if (state.feedback.length > 5) completeness += 10;
        if (state.feedback.length > 10) completeness += 10;

        const finalCompleteness = Math.min(completeness, maxPoints);
        set({ profileCompleteness: finalCompleteness });
        return finalCompleteness;
      },

      resetProfile: () => {
        set({
          preferences: initialPreferences,
          budgetPreferences: initialBudgetPreferences,
          feedback: [],
          analytics: initialAnalytics,
          profileCompleteness: 0,
        });
      },
    }),
    {
      name: STORAGE_KEYS.STYLE_PROFILE,
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.calculateAnalytics();
          state.calculateProfileCompleteness();
        }
      },
    }
  )
);
