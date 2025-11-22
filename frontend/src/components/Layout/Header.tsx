import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { useKeycloak } from '../../providers/KeycloakProvider';
import { useThemeStore } from '../../store/themeStore';
import { useFavoritesStore } from '../../store/favoritesStore';
import { OutfitHistory } from '../OutfitHistory/OutfitHistory';
import { LogoutConfirmModal } from '../common';
import { APP_MODES } from '../../constants';
import type { AppMode } from '../../types';
import styles from './Header.module.css';

export const Header: React.FC = () => {
  const { currentMode, setMode } = useAppStore();
  const { user, logout: keycloakLogout } = useKeycloak();
  const { theme, toggleTheme } = useThemeStore();
  const { history } = useFavoritesStore();
  const [showHistory, setShowHistory] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const modes: { value: AppMode; label: string }[] = [
    { value: APP_MODES.RATER, label: 'Outfit Rater' },
    { value: APP_MODES.GENERATOR, label: 'Outfit Generator' },
    { value: APP_MODES.ARENA, label: 'Fashion Arena' },
    { value: APP_MODES.SQUAD, label: 'Style Squad' },
  ];

  const handleLogoutClick = () => {
    setShowUserMenu(false);
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    keycloakLogout();
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  const handleProfileClick = () => {
    setMode(APP_MODES.PROFILE);
    setShowUserMenu(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.titleContainer}>
          <img src="/logo.jpeg" alt="AI Outfit Assistant Logo" className={styles.logo} />
          <h1 className={styles.title}>AI Outfit Assistant</h1>
        </div>
        <nav className={styles.nav}>
          {modes.map((mode) => (
            <button
              key={mode.value}
              className={`${styles.navButton} ${
                currentMode === mode.value ? styles.active : ''
              }`}
              onClick={() => setMode(mode.value)}
            >
              {mode.label}
            </button>
          ))}
          <div className={styles.userSection}>
            <button
              className={styles.historyButton}
              onClick={() => setShowHistory(true)}
              title="View outfit history"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
              {history.length > 0 && (
                <span className={styles.historyBadge}>{history.length}</span>
              )}
            </button>
            <button
              className={styles.themeToggle}
              onClick={toggleTheme}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <div className={styles.userMenuContainer}>
              <button
                className={styles.userButton}
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                👤 {user?.name || user?.email}
              </button>
              {showUserMenu && (
                <div className={styles.userMenu}>
                  <button className={styles.menuItem} onClick={handleProfileClick}>
                    👤 My Profile
                  </button>
                  <button className={styles.menuItem} onClick={handleLogoutClick}>
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>

      {/* Outfit History Modal */}
      <OutfitHistory isOpen={showHistory} onClose={() => setShowHistory(false)} />

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />
    </header>
  );
};
