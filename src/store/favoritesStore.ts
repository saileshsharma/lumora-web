/**
 * Favorites & History Store
 * Manages saved outfits, favorites, and outfit history
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '../constants';
import type { GeneratorResponse, Occasion } from '../types';

export interface SavedOutfit {
  id: string;
  timestamp: number;
  occasion: Occasion | null;
  originalImage: string | null;
  results: GeneratorResponse;
  isFavorite: boolean;
  tags?: string[];
  notes?: string;
}

interface FavoritesState {
  // Outfit history (all generated outfits)
  history: SavedOutfit[];

  // Favorites (subset of history)
  favorites: SavedOutfit[];

  // Add outfit to history
  addToHistory: (outfit: Omit<SavedOutfit, 'id' | 'timestamp' | 'isFavorite'>) => string;

  // Toggle favorite status
  toggleFavorite: (id: string) => void;

  // Remove from history
  removeFromHistory: (id: string) => void;

  // Clear all history
  clearHistory: () => void;

  // Get outfit by ID
  getOutfitById: (id: string) => SavedOutfit | undefined;

  // Get favorites
  getFavorites: () => SavedOutfit[];

  // Get recent outfits
  getRecentOutfits: (limit?: number) => SavedOutfit[];

  // Update outfit notes
  updateNotes: (id: string, notes: string) => void;

  // Add tags to outfit
  addTags: (id: string, tags: string[]) => void;

  // Search outfits
  searchOutfits: (query: string) => SavedOutfit[];

  // Filter by occasion
  filterByOccasion: (occasion: Occasion) => SavedOutfit[];
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      history: [],
      favorites: [],

      addToHistory: (outfit) => {
        const id = `outfit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const timestamp = Date.now();

        const newOutfit: SavedOutfit = {
          ...outfit,
          id,
          timestamp,
          isFavorite: false,
        };

        set((state) => ({
          history: [newOutfit, ...state.history],
        }));

        return id;
      },

      toggleFavorite: (id) => {
        set((state) => {
          const updatedHistory = state.history.map((outfit) =>
            outfit.id === id ? { ...outfit, isFavorite: !outfit.isFavorite } : outfit
          );

          const favorites = updatedHistory.filter((outfit) => outfit.isFavorite);

          return {
            history: updatedHistory,
            favorites,
          };
        });
      },

      removeFromHistory: (id) => {
        set((state) => {
          const updatedHistory = state.history.filter((outfit) => outfit.id !== id);
          const favorites = updatedHistory.filter((outfit) => outfit.isFavorite);

          return {
            history: updatedHistory,
            favorites,
          };
        });
      },

      clearHistory: () => {
        set({
          history: [],
          favorites: [],
        });
      },

      getOutfitById: (id) => {
        return get().history.find((outfit) => outfit.id === id);
      },

      getFavorites: () => {
        return get().history.filter((outfit) => outfit.isFavorite);
      },

      getRecentOutfits: (limit = 10) => {
        return get().history.slice(0, limit);
      },

      updateNotes: (id, notes) => {
        set((state) => ({
          history: state.history.map((outfit) =>
            outfit.id === id ? { ...outfit, notes } : outfit
          ),
        }));
      },

      addTags: (id, tags) => {
        set((state) => ({
          history: state.history.map((outfit) =>
            outfit.id === id ? { ...outfit, tags } : outfit
          ),
        }));
      },

      searchOutfits: (query) => {
        const lowerQuery = query.toLowerCase();
        return get().history.filter((outfit) => {
          const outfitDescription = outfit.results.outfit_description.toLowerCase();
          const occasion = outfit.occasion?.toLowerCase() || '';
          const notes = outfit.notes?.toLowerCase() || '';
          const tags = outfit.tags?.join(' ').toLowerCase() || '';

          return (
            outfitDescription.includes(lowerQuery) ||
            occasion.includes(lowerQuery) ||
            notes.includes(lowerQuery) ||
            tags.includes(lowerQuery)
          );
        });
      },

      filterByOccasion: (occasion) => {
        return get().history.filter((outfit) => outfit.occasion === occasion);
      },
    }),
    {
      name: STORAGE_KEYS.OUTFIT_HISTORY,
      // Sync favorites with history on rehydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.favorites = state.history.filter((outfit) => outfit.isFavorite);
        }
      },
    }
  )
);
