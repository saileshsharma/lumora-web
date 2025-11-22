import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from './components/common';
import { Header } from './components/Layout/Header';
import { Footer } from './components/Layout/Footer';
import { KeycloakLogin } from './components/Auth/KeycloakLogin';
import { OutfitRater } from './components/OutfitRater/OutfitRater';
import { OutfitGenerator } from './components/OutfitGenerator/OutfitGenerator';
import { FashionArena } from './components/FashionArena/FashionArena';
import { StyleSquad } from './components/StyleSquad';
import { TeamPage } from './components/Team/TeamPage';
import { useAppStore } from './store/appStore';
import { useKeycloak } from './providers/KeycloakProvider';
import { useThemeStore } from './store/themeStore';
import { APP_MODES } from './constants';
import './styles/global.css';

const KeycloakApp: React.FC = () => {
  const currentMode = useAppStore((state) => state.currentMode);
  const { authenticated, user } = useKeycloak();
  const { theme, setTheme } = useThemeStore();

  // Initialize theme on mount
  useEffect(() => {
    setTheme(theme);
  }, []);

  // Log user info for debugging
  useEffect(() => {
    if (authenticated && user) {
      console.log('User authenticated:', user);
    }
  }, [authenticated, user]);

  const renderContent = () => {
    switch (currentMode) {
      case APP_MODES.RATER:
        return <OutfitRater />;
      case APP_MODES.GENERATOR:
        return <OutfitGenerator />;
      case APP_MODES.ARENA:
        return <FashionArena />;
      case APP_MODES.SQUAD:
        return <StyleSquad />;
      case APP_MODES.TEAM:
        return <TeamPage />;
      default:
        return <OutfitRater />;
    }
  };

  // Show login page if not authenticated
  if (!authenticated) {
    return (
      <ErrorBoundary>
        <KeycloakLogin />
        <Toaster />
      </ErrorBoundary>
    );
  }

  // Show main app if authenticated
  return (
    <ErrorBoundary>
      <div className="app">
        <Header />
        <main>{renderContent()}</main>
        <Footer />
        <Toaster />
      </div>
    </ErrorBoundary>
  );
};

export default KeycloakApp;
