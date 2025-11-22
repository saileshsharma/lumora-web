/**
 * Global App State
 * Manages app-wide state like current mode
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { APP_MODES, STORAGE_KEYS } from '../constants';
import type { AppState } from '../types';

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentMode: APP_MODES.RATER,
      setMode: (mode) => set({ currentMode: mode }),
      sharedImage: null,
      setSharedImage: (image) => set({ sharedImage: image }),
    }),
    {
      name: STORAGE_KEYS.LAST_MODE,
    }
  )
);
