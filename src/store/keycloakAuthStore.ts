/**
 * Keycloak Authentication Store
 * Manages Keycloak authentication state with Zustand
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import keycloak, { getUserInfo, getUserRoles } from '../config/keycloak';

interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  given_name?: string;
  family_name?: string;
  email_verified?: boolean;
}

interface KeycloakAuthState {
  // State
  user: User | null;
  roles: string[];
  isAuthenticated: boolean;
  isInitialized: boolean;
  token: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setRoles: (roles: string[]) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  setToken: (token: string | null) => void;
  login: () => void;
  logout: () => void;
  register: () => void;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  isPremium: () => boolean;
  isAdmin: () => boolean;
  updateToken: () => Promise<string | undefined>;
  reset: () => void;
}

export const useKeycloakAuthStore = create<KeycloakAuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      roles: [],
      isAuthenticated: false,
      isInitialized: false,
      token: null,

      // Setters
      setUser: (user) => set({ user }),
      setRoles: (roles) => set({ roles }),
      setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),
      setInitialized: (initialized) => set({ isInitialized: initialized }),
      setToken: (token) => set({ token }),

      // Actions
      login: () => {
        keycloak.login({
          redirectUri: window.location.origin + window.location.pathname,
        });
      },

      logout: () => {
        keycloak.logout({
          redirectUri: window.location.origin,
        });
        get().reset();
      },

      register: () => {
        keycloak.register({
          redirectUri: window.location.origin + window.location.pathname,
        });
      },

      hasRole: (role: string) => {
        return get().roles.includes(role);
      },

      hasAnyRole: (roles: string[]) => {
        const userRoles = get().roles;
        return roles.some(role => userRoles.includes(role));
      },

      isPremium: () => {
        return get().hasRole('premium') || get().hasRole('admin');
      },

      isAdmin: () => {
        return get().hasRole('admin');
      },

      updateToken: async () => {
        try {
          const refreshed = await keycloak.updateToken(70);

          if (refreshed && keycloak.token) {
            set({ token: keycloak.token });
            console.log('Token refreshed');
          }

          return keycloak.token;
        } catch (error) {
          console.error('Failed to refresh token', error);
          get().logout();
          return undefined;
        }
      },

      reset: () => {
        set({
          user: null,
          roles: [],
          isAuthenticated: false,
          token: null,
        });
      },
    }),
    {
      name: 'keycloak-auth-storage',
      partialize: (state) => ({
        // Only persist user and roles, not tokens (security)
        user: state.user,
        roles: state.roles,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Initialize store from Keycloak
export const initializeKeycloakStore = () => {
  if (keycloak.authenticated) {
    const userInfo = getUserInfo();
    const roles = getUserRoles();

    // Convert to User type with required id field
    const user: User | null = userInfo && userInfo.sub ? {
      id: userInfo.sub,
      username: userInfo.preferred_username || userInfo.email || '',
      email: userInfo.email || '',
      name: userInfo.name || '',
      given_name: userInfo.given_name,
      family_name: userInfo.family_name,
      email_verified: userInfo.email_verified,
    } : null;

    useKeycloakAuthStore.getState().setUser(user);
    useKeycloakAuthStore.getState().setRoles(roles);
    useKeycloakAuthStore.getState().setAuthenticated(true);
    useKeycloakAuthStore.getState().setToken(keycloak.token || null);
  }

  useKeycloakAuthStore.getState().setInitialized(true);
};
