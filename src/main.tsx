import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { KeycloakProvider } from './providers/KeycloakProvider';
import KeycloakApp from './KeycloakApp';
import './styles/global.css';

// Use Keycloak authentication
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <KeycloakProvider>
      <KeycloakApp />
    </KeycloakProvider>
  </StrictMode>
);
