import React from 'react';
import styles from './Loading.module.css';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({ message, fullScreen = false }) => {
  const containerClass = fullScreen ? styles.fullScreen : styles.inline;

  return (
    <div className={containerClass}>
      <div className={styles.spinner} />
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
};
