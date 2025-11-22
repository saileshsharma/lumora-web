/**
 * Outfit Rater State
 * Manages state for the outfit rating feature
 */

import { create } from 'zustand';
import type { RaterState } from '../types';

export const useRaterStore = create<RaterState>((set) => ({
  imageData: null,
  occasion: null,
  budget: null,
  results: null,
  isLoading: false,

  setImageData: (data) => set({ imageData: data }),
  setOccasion: (occasion) => set({ occasion }),
  setBudget: (budget) => set({ budget }),
  setResults: (results) => set({ results }),
  setLoading: (loading) => set({ isLoading: loading }),

  reset: () =>
    set({
      imageData: null,
      occasion: null,
      budget: null,
      results: null,
      isLoading: false,
    }),
}));
