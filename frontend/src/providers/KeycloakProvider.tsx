/**
 * Keycloak Provider Component
 * Initializes and manages Keycloak authentication
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import keycloak, { keycloakInitOptions, getUserInfo, getUserRoles } from '../config/keycloak';
import type Keycloak from 'keycloak-js';

interface KeycloakContextType {
  keycloak: Keycloak | null;
  initialized: boolean;
  authenticated: boolean;
  user: any | null;
  roles: string[];
  login: () => void;
  logout: () => void;
  register: () => void;
  updateToken: () => Promise<boolean>;
}

const KeycloakContext = createContext<KeycloakContextType | undefined>(undefined);

interface KeycloakProviderProps {
  children: ReactNode;
}

export const KeycloakProvider: React.FC<KeycloakProviderProps> = ({ children }) => {
  const [initialized, setInitialized] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    // Initialize Keycloak
    const initKeycloak = async () => {
      try {
        console.log('Initializing Keycloak...');

        const auth = await keycloak.init(keycloakInitOptions);

        console.log('Keycloak initialized:', auth ? 'authenticated' : 'not authenticated');

        setAuthenticated(auth);
        setInitialized(true);

        if (auth) {
          // User is authenticated
          const userInfo = getUserInfo();
          const userRoles = getUserRoles();

          console.log('User info:', userInfo);
          console.log('User roles:', userRoles);

          setUser(userInfo);
          setRoles(userRoles);

          // Set up token refresh
          setupTokenRefresh();
        }
      } catch (error) {
        console.error('Keycloak initialization failed:', error);
        setInitialized(true);
      }
    };

    initKeycloak();

    // Cleanup
    return () => {
      // Clear any intervals/timers if needed
    };
  }, []);

  // Set up automatic token refresh
  const setupTokenRefresh = () => {
    // Refresh token every 4 minutes (tokens expire in 5 minutes by default)
    const refreshInterval = setInterval(async () => {
      try {
        const refreshed = await keycloak.updateToken(70);
        if (refreshed) {
          console.log('Token refreshed automatically');
        }
      } catch (error) {
        console.error('Failed to refresh token:', error);
        clearInterval(refreshInterval);
        // Logout on refresh failure
        logout();
      }
    }, 4 * 60 * 1000); // 4 minutes

    return () => clearInterval(refreshInterval);
  };

  const login = () => {
    keycloak.login({
      redirectUri: window.location.origin + window.location.pathname,
    });
  };

  const logout = () => {
    keycloak.logout({
      redirectUri: window.location.origin,
    });
  };

  const register = () => {
    keycloak.register({
      redirectUri: window.location.origin + window.location.pathname,
    });
  };

  const updateToken = async (): Promise<boolean> => {
    try {
      return await keycloak.updateToken(70);
    } catch (error) {
      console.error('Token update failed:', error);
      return false;
    }
  };

  const value: KeycloakContextType = {
    keycloak,
    initialized,
    authenticated,
    user,
    roles,
    login,
    logout,
    register,
    updateToken,
  };

  // Show loading state while initializing
  if (!initialized) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        <div>
          <div>🔐 Initializing authentication...</div>
        </div>
      </div>
    );
  }

  return (
    <KeycloakContext.Provider value={value}>
      {children}
    </KeycloakContext.Provider>
  );
};

// Custom hook to use Keycloak context
export const useKeycloak = (): KeycloakContextType => {
  const context = useContext(KeycloakContext);

  if (!context) {
    throw new Error('useKeycloak must be used within KeycloakProvider');
  }

  return context;
};

// HOC for protected routes
export const withKeycloak = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  return (props: P) => {
    const { authenticated, login } = useKeycloak();

    useEffect(() => {
      if (!authenticated) {
        login();
      }
    }, [authenticated]);

    if (!authenticated) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}>
          <div>Redirecting to login...</div>
        </div>
      );
    }

    return <Component {...props} />;
  };
};
