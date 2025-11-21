import React from 'react';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { APP_MODES } from '../../constants';
import type { AppMode } from '../../types';
import styles from './Header.module.css';

export const Header: React.FC = () => {
  const { currentMode, setMode } = useAppStore();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  const modes: { value: AppMode; label: string }[] = [
    { value: APP_MODES.RATER, label: 'Outfit Rater' },
    { value: APP_MODES.GENERATOR, label: 'Outfit Generator' },
    { value: APP_MODES.ARENA, label: 'Fashion Arena' },
  ];

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
              className={styles.themeToggle}
              onClick={toggleTheme}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <span className={styles.userName}>👤 {user?.name || user?.email}</span>
            <button className={styles.logoutButton} onClick={logout}>
              Logout
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};
