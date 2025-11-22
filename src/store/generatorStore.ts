/**
 * Outfit Generator State
 * Manages state for the outfit generation feature
 */

import { create } from 'zustand';
import type { GeneratorState } from '../types';

export const useGeneratorStore = create<GeneratorState>((set) => ({
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
