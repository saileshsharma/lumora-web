/**
 * Keycloak Configuration
 * Configure Keycloak connection settings
 */

import Keycloak from 'keycloak-js';

// Keycloak configuration from environment variables
const keycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'lumora',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'lumora-frontend',
};

// Initialize Keycloak instance
const keycloak = new Keycloak(keycloakConfig);

// Keycloak initialization options
export const keycloakInitOptions = {
  onLoad: 'check-sso' as const, // Check if user is already logged in
  silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
  pkceMethod: 'S256' as const, // Use PKCE for enhanced security
  checkLoginIframe: false, // Disable iframe checking for better performance
};

export default keycloak;

// Helper to get token with automatic refresh
export const getToken = async (): Promise<string | undefined> => {
  try {
    // Refresh token if it will expire in the next 70 seconds
    const refreshed = await keycloak.updateToken(70);

    if (refreshed) {
      console.log('Token refreshed');
    }

    return keycloak.token;
  } catch (error) {
    console.error('Failed to refresh token', error);
    // Logout if refresh fails
    keycloak.logout();
    return undefined;
  }
};

// Helper to check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!keycloak.authenticated;
};

// Helper to get user info
export const getUserInfo = () => {
  if (!keycloak.tokenParsed) return null;

  return {
    id: keycloak.tokenParsed.sub,
    username: keycloak.tokenParsed.preferred_username,
    email: keycloak.tokenParsed.email,
    name: keycloak.tokenParsed.name,
    given_name: keycloak.tokenParsed.given_name,
    family_name: keycloak.tokenParsed.family_name,
    email_verified: keycloak.tokenParsed.email_verified,
  };
};

// Helper to get user roles
export const getUserRoles = (): string[] => {
  if (!keycloak.tokenParsed) return [];

  const realmRoles = keycloak.tokenParsed.realm_access?.roles || [];
  const clientRoles = keycloak.tokenParsed.resource_access?.[keycloakConfig.clientId]?.roles || [];

  return [...realmRoles, ...clientRoles];
};

// Helper to check if user has role
export const hasRole = (role: string): boolean => {
  return getUserRoles().includes(role);
};

// Helper to check if user has any of the roles
export const hasAnyRole = (roles: string[]): boolean => {
  const userRoles = getUserRoles();
  return roles.some(role => userRoles.includes(role));
};
