import React from 'react';
import { EmptyState } from '../common';
import type { LeaderboardEntry } from '../../types';
import { arenaApi } from '../../services/api';
import { showSuccess, handleApiError } from '../../utils/toast';
import styles from './LeaderboardTab.module.css';

interface LeaderboardTabProps {
  leaderboard: LeaderboardEntry[];
  onRefresh: () => void;
}

export const LeaderboardTab: React.FC<LeaderboardTabProps> = ({ leaderboard, onRefresh }) => {
  const handleLike = async (id: string) => {
    try {
      await arenaApi.likeSubmission(id);
      showSuccess('Liked!');
      onRefresh();
    } catch (error) {
      handleApiError(error);
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  if (leaderboard.length === 0) {
    return (
      <EmptyState
        icon="🏆"
        title="No Rankings Yet"
        description="The leaderboard is waiting for fashion champions! Submit your outfit to start competing for the top spot."
        actionLabel="Refresh"
        onAction={onRefresh}
      />
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.list}>
        {leaderboard.map((entry, index) => (
          <div key={entry.id} className={`${styles.item} ${index < 3 ? styles.topThree : ''}`}>
            <div className={styles.rank}>{getRankBadge(index + 1)}</div>
            <div className={styles.imageContainer}>
              <img src={entry.photo} alt={entry.title} className={styles.image} />
            </div>
            <div className={styles.details}>
              <div className={styles.titleText}>{entry.title}</div>
              <div className={styles.occasion}>{entry.occasion}</div>
              <div className={styles.stats}>
                <span className={styles.stat}>⭐ {entry.avg_rating.toFixed(1)}/10</span>
                <span className={styles.stat}>
                  <button className={styles.likeButton} onClick={() => handleLike(entry.id)}>
                    👍 {entry.likes}
                  </button>
                </span>
                {entry.votes > 0 && <span className={styles.stat}>🗳️ {entry.votes} votes</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
