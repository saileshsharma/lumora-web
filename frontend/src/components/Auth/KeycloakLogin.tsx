import React from 'react';
import { useKeycloak } from '../../providers/KeycloakProvider';
import { Button } from '../common';
import styles from './Login.module.css';

export const KeycloakLogin: React.FC = () => {
  const { login, register } = useKeycloak();

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
              Welcome to Lumora
            </h2>
            <p className={styles.formSubtitle}>
              Sign in to access your personalized AI fashion assistant
            </p>
          </div>

          <div className={styles.form}>
            <Button
              type="button"
              variant="primary"
              fullWidth
              onClick={login}
            >
              ✨ Sign In
            </Button>

            <div className={styles.divider}>
              <span>OR</span>
            </div>

            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={register}
            >
              🚀 Create Account
            </Button>
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
