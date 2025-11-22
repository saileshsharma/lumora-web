/**
 * Style Squad State Management
 * Zustand store for managing squad data
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Squad, SquadOutfit } from '../types';

interface SquadState {
  // State
  squads: Squad[];
  activeSquadId: string | null;
  isLoading: boolean;
  currentUserId: string;
  currentUserName: string;

  // Actions - Squad Management
  setSquads: (squads: Squad[]) => void;
  addSquad: (squad: Squad) => void;
  updateSquad: (squadId: string, updates: Partial<Squad>) => void;
  removeSquad: (squadId: string) => void;
  setActiveSquadId: (squadId: string | null) => void;

  // Actions - User Management
  setCurrentUser: (userId: string, userName: string) => void;

  // Actions - Outfit Management
  addOutfitToSquad: (squadId: string, outfit: SquadOutfit) => void;
  updateOutfitInSquad: (squadId: string, outfitId: string, updates: Partial<SquadOutfit>) => void;

  // Actions - Loading
  setLoading: (loading: boolean) => void;

  // Selectors
  getActiveSquad: () => Squad | null;
  getSquadById: (squadId: string) => Squad | null;
}

export const useSquadStore = create<SquadState>()(
  persist(
    (set, get) => ({
      // Initial State
      squads: [],
      activeSquadId: null,
      isLoading: false,
      currentUserId: '',
      currentUserName: '',

      // Squad Management
      setSquads: (squads) => set({ squads }),

      addSquad: (squad) =>
        set((state) => ({
          squads: [...state.squads, squad],
        })),

      updateSquad: (squadId, updates) =>
        set((state) => ({
          squads: state.squads.map((squad) =>
            squad.id === squadId ? { ...squad, ...updates } : squad
          ),
        })),

      removeSquad: (squadId) =>
        set((state) => ({
          squads: state.squads.filter((squad) => squad.id !== squadId),
          activeSquadId: state.activeSquadId === squadId ? null : state.activeSquadId,
        })),

      setActiveSquadId: (squadId) => set({ activeSquadId: squadId }),

      // User Management
      setCurrentUser: (userId, userName) =>
        set({ currentUserId: userId, currentUserName: userName }),

      // Outfit Management
      addOutfitToSquad: (squadId, outfit) =>
        set((state) => ({
          squads: state.squads.map((squad) =>
            squad.id === squadId
              ? { ...squad, outfits: [outfit, ...squad.outfits] }
              : squad
          ),
        })),

      updateOutfitInSquad: (squadId, outfitId, updates) =>
        set((state) => ({
          squads: state.squads.map((squad) =>
            squad.id === squadId
              ? {
                  ...squad,
                  outfits: squad.outfits.map((outfit) =>
                    outfit.id === outfitId ? { ...outfit, ...updates } : outfit
                  ),
                }
              : squad
          ),
        })),

      // Loading
      setLoading: (loading) => set({ isLoading: loading }),

      // Selectors
      getActiveSquad: () => {
        const { squads, activeSquadId } = get();
        return squads.find((squad) => squad.id === activeSquadId) || null;
      },

      getSquadById: (squadId) => {
        const { squads } = get();
        return squads.find((squad) => squad.id === squadId) || null;
      },
    }),
    {
      name: 'squad-storage',
      partialize: (state) => ({
        squads: state.squads,
        activeSquadId: state.activeSquadId,
        currentUserId: state.currentUserId,
        currentUserName: state.currentUserName,
      }),
    }
  )
);
