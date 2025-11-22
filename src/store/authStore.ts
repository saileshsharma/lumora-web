/**
 * Authentication Store with JWT
 * Manages user authentication state, tokens, and API calls
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '../constants';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

interface User {
  id: string;
  email: string;
  name: string;
  created_at?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  register: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
  getCurrentUser: () => Promise<void>;
  updateProfile: (name: string, password?: string) => Promise<void>;
  checkEmailAvailability: (email: string) => Promise<boolean>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      clearError: () => {
        set({ error: null });
      },

      register: async (email: string, password: string, name: string) => {
        try {
          set({ isLoading: true, error: null });

          const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, name }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
          }

          // Store tokens and user info
          set({
            user: data.user,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            error: error.message || 'Registration failed',
            isLoading: false,
          });
          throw error;
        }
      },

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });

          const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Login failed');
          }

          // Store tokens and user info
          set({
            user: data.user,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            error: error.message || 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          const { accessToken } = get();

          if (accessToken) {
            // Call logout endpoint to blacklist token
            await fetch(`${API_URL}/api/auth/logout`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
            });
          }
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Clear state regardless of API call success
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      refreshAccessToken: async () => {
        try {
          const { refreshToken } = get();

          if (!refreshToken) {
            return false;
          }

          const response = await fetch(`${API_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${refreshToken}`,
              'Content-Type': 'application/json',
            },
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error('Token refresh failed');
          }

          // Update access token
          set({
            accessToken: data.access_token,
          });

          return true;
        } catch (error) {
          console.error('Token refresh error:', error);
          // Clear auth state on refresh failure
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          });
          return false;
        }
      },

      getCurrentUser: async () => {
        try {
          const { accessToken } = get();

          if (!accessToken) {
            return;
          }

          const response = await fetch(`${API_URL}/api/auth/me`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error('Failed to get user');
          }

          set({
            user: data.user,
          });
        } catch (error) {
          console.error('Get current user error:', error);
        }
      },

      updateProfile: async (name: string, password?: string) => {
        try {
          const { accessToken } = get();

          if (!accessToken) {
            throw new Error('Not authenticated');
          }

          set({ isLoading: true, error: null });

          const body: any = { name };
          if (password) {
            body.password = password;
          }

          const response = await fetch(`${API_URL}/api/auth/profile`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Profile update failed');
          }

          set({
            user: data.user,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            error: error.message || 'Profile update failed',
            isLoading: false,
          });
          throw error;
        }
      },

      checkEmailAvailability: async (email: string) => {
        try {
          const response = await fetch(`${API_URL}/api/auth/check-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
          });

          const data = await response.json();

          return data.available || false;
        } catch (error) {
          console.error('Email check error:', error);
          return false;
        }
      },
    }),
    {
      name: STORAGE_KEYS.AUTH,
      // Only persist tokens and user, not loading/error states
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Auto-refresh token before expiration
setInterval(async () => {
  const { isAuthenticated, refreshAccessToken } = useAuthStore.getState();
  if (isAuthenticated) {
    await refreshAccessToken();
  }
}, 14 * 60 * 1000); // Refresh every 14 minutes (tokens expire in 15 min)
