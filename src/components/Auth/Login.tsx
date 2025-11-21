import React, { useState } from 'react';
import { Button } from '../common';
import { showError, showSuccess } from '../../utils/toast';
import styles from './Login.module.css';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!email || !password) {
      showError('Please fill in all fields');
      return;
    }

    if (!isLogin) {
      if (!name) {
        showError('Please enter your name');
        return;
      }
      if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        showError('Password must be at least 6 characters');
        return;
      }
    }

    setIsLoading(true);

    try {
      await onLogin(email, password);
      showSuccess(isLogin ? 'Welcome back!' : 'Account created successfully!');
    } catch (error: any) {
      showError(error.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.background}>
        <div className={styles.circle1}></div>
        <div className={styles.circle2}></div>
        <div className={styles.circle3}></div>
      </div>

      <div className={styles.content}>
        <div className={styles.logoSection}>
          <img src="/logo.jpeg" alt="Lumora Logo" className={styles.logo} />
          <h1 className={styles.brandName}>Lumora</h1>
          <p className={styles.brandTagline}>Your AI Fashion Assistant</p>
        </div>

        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className={styles.formSubtitle}>
              {isLogin
                ? 'Sign in to access your personalized fashion assistant'
                : 'Join Lumora to get AI-powered fashion recommendations'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {!isLogin && (
              <div className={styles.inputGroup}>
                <label htmlFor="name" className={styles.label}>
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  className={styles.input}
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            )}

            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className={styles.input}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>
                Password
              </label>
              <input
                id="password"
                type="password"
                className={styles.input}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {!isLogin && (
              <div className={styles.inputGroup}>
                <label htmlFor="confirmPassword" className={styles.label}>
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  className={styles.input}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            )}

            {isLogin && (
              <div className={styles.forgotPassword}>
                <a href="#" className={styles.link}>
                  Forgot password?
                </a>
              </div>
            )}

            <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
              {isLogin ? '✨ Sign In' : '🚀 Create Account'}
            </Button>
          </form>

          <div className={styles.divider}>
            <span>OR</span>
          </div>

          <div className={styles.switchMode}>
            <p>
              {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button type="button" onClick={toggleMode} className={styles.switchButton}>
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>

          <div className={styles.demoInfo}>
            <p className={styles.demoText}>
              <strong>Demo Mode:</strong> Use any email and password to try the app
            </p>
          </div>
        </div>

        <div className={styles.features}>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>⭐</span>
            <div>
              <h3 className={styles.featureTitle}>AI-Powered Ratings</h3>
              <p className={styles.featureText}>Get instant feedback on your outfits</p>
            </div>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>🎨</span>
            <div>
              <h3 className={styles.featureTitle}>Outfit Generator</h3>
              <p className={styles.featureText}>Create perfect looks for any occasion</p>
            </div>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>🏆</span>
            <div>
              <h3 className={styles.featureTitle}>Fashion Arena</h3>
              <p className={styles.featureText}>Share and compete with others</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
