/**
 * Fashion Arena State
 * Manages state for the fashion arena feature
 */

import { create } from 'zustand';
import { ARENA_TABS } from '../constants';
import type { ArenaState } from '../types';

export const useArenaStore = create<ArenaState>((set) => ({
  activeTab: ARENA_TABS.BROWSE,
  submissions: [],
  leaderboard: [],
  currentPage: 1,
  isLoading: false,

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSubmissions: (submissions) => set({ submissions }),
  setLeaderboard: (leaderboard) => set({ leaderboard }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setLoading: (loading) => set({ isLoading: loading }),

  addSubmission: (submission) =>
    set((state) => ({
      submissions: [submission, ...state.submissions],
    })),

  removeSubmission: (id) =>
    set((state) => ({
      submissions: state.submissions.filter((s) => s.id !== id),
    })),

  updateSubmissionLikes: (id, likes) =>
    set((state) => ({
      submissions: state.submissions.map((s) => (s.id === id ? { ...s, likes } : s)),
    })),
}));
