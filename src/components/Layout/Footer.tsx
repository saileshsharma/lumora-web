import React from 'react';
import { useAppStore } from '../../store/appStore';
import { APP_MODES } from '../../constants';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  const setMode = useAppStore((state) => state.setMode);

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Branding */}
          <div className={styles.branding}>
            <h3 className={styles.brandName}>Lumora</h3>
            <p className={styles.tagline}>Powered by OpenAI GPT-4o & NanobananaAPI</p>
          </div>

          {/* Team Members */}
          <div className={styles.team}>
            <p className={styles.developedBy}>Developed by</p>
            <button
              className={styles.teamLink}
              onClick={() => setMode(APP_MODES.TEAM)}
            >
              View Our Team →
            </button>
          </div>

          {/* Copyright */}
          <div className={styles.copyright}>
            <p>© {new Date().getFullYear()} Lumora. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
