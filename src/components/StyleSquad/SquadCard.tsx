import React from 'react';
import type { Squad } from '../../types';
import styles from './SquadCard.module.css';

interface SquadCardProps {
  squad: Squad;
  onClick: () => void;
  style?: React.CSSProperties;
}

export const SquadCard: React.FC<SquadCardProps> = ({ squad, onClick, style }) => {
  const latestOutfit = squad.outfits[0];
  const hasOutfits = squad.outfits.length > 0;

  return (
    <div className={styles.card} onClick={onClick} style={style}>
      {/* Preview Image */}
      <div className={styles.preview}>
        {hasOutfits && latestOutfit ? (
          <img src={latestOutfit.photo} alt={squad.name} className={styles.previewImage} />
        ) : (
          <div className={styles.emptyPreview}>
            <span className={styles.emptyIcon}>👥</span>
          </div>
        )}
        <div className={styles.overlay}>
          <span className={styles.viewText}>View Squad</span>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.name}>{squad.name}</h3>
          <div className={styles.memberBadge}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
            {squad.members.length}/{squad.maxMembers}
          </div>
        </div>

        {squad.description && (
          <p className={styles.description}>{squad.description}</p>
        )}

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statIcon}>👗</span>
            <span className={styles.statText}>{squad.outfits.length} outfits</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statIcon}>🔑</span>
            <span className={styles.statText}>{squad.inviteCode}</span>
          </div>
        </div>

        {hasOutfits && (
          <div className={styles.activity}>
            <span className={styles.activityText}>
              Latest: {latestOutfit.userName} shared
            </span>
            <span className={styles.activityTime}>
              {getTimeAgo(latestOutfit.createdAt)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}
