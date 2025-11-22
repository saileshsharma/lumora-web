import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from './components/common';
import { Header } from './components/Layout/Header';
import { Footer } from './components/Layout/Footer';
import { Login } from './components/Auth/Login';
import { OutfitRater } from './components/OutfitRater/OutfitRater';
import { OutfitGenerator } from './components/OutfitGenerator/OutfitGenerator';
import { FashionArena } from './components/FashionArena/FashionArena';
import { StyleSquad } from './components/StyleSquad';
import { TeamPage } from './components/Team/TeamPage';
import { useAppStore } from './store/appStore';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import { APP_MODES } from './constants';
import './styles/global.css';

const App: React.FC = () => {
  const currentMode = useAppStore((state) => state.currentMode);
  const { isAuthenticated, login } = useAuthStore();
  const { theme, setTheme } = useThemeStore();

  // Initialize theme on mount
  useEffect(() => {
    setTheme(theme);
  }, []);

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
  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <Login onLogin={login} />
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

export default App;
