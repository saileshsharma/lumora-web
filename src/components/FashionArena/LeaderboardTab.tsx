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
      showSuccess('Liked! 👍');
      onRefresh();
    } catch (error) {
      handleApiError(error);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return null;
    }
  };

  const getRankClass = (rank: number) => {
    switch (rank) {
      case 1:
        return styles.gold;
      case 2:
        return styles.silver;
      case 3:
        return styles.bronze;
      default:
        return '';
    }
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

  // Separate top 3 and rest
  const topThree = leaderboard.slice(0, 3);
  const restOfLeaderboard = leaderboard.slice(3);

  return (
    <div className={styles.container}>
      {/* Podium Section for Top 3 */}
      {topThree.length > 0 && (
        <div className={styles.podiumSection}>
          <div className={styles.podiumTitle}>
            <div className={styles.crownIcon}>👑</div>
            <h2 className={styles.sectionTitle}>Hall of Fame</h2>
            <p className={styles.sectionSubtitle}>The best of the best</p>
          </div>

          <div className={styles.podium}>
            {/* 2nd Place */}
            {topThree[1] && (
              <div className={`${styles.podiumPlace} ${styles.second}`}>
                <div className={styles.podiumRank}>
                  <span className={styles.medalIcon}>{getRankIcon(2)}</span>
                  <span className={styles.rankNumber}>2</span>
                </div>
                <div className={styles.podiumImageContainer}>
                  <img
                    src={topThree[1].photo}
                    alt={topThree[1].title}
                    className={styles.podiumImage}
                  />
                  <div className={styles.podiumOverlay}>
                    <button
                      className={styles.podiumLikeButton}
                      onClick={() => handleLike(topThree[1].id)}
                    >
                      👍 {topThree[1].likes || 0}
                    </button>
                  </div>
                </div>
                <div className={styles.podiumInfo}>
                  <h3 className={styles.podiumTitle}>{topThree[1].title}</h3>
                  <div className={styles.podiumStats}>
                    <span className={styles.podiumRating}>
                      ⭐ {topThree[1].avg_rating ? topThree[1].avg_rating.toFixed(1) : '0.0'}
                    </span>
                    <span className={styles.podiumVotes}>🗳️ {topThree[1].votes || 0}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 1st Place */}
            {topThree[0] && (
              <div className={`${styles.podiumPlace} ${styles.first}`}>
                <div className={styles.podiumRank}>
                  <span className={styles.medalIcon}>{getRankIcon(1)}</span>
                  <span className={styles.rankNumber}>1</span>
                </div>
                <div className={styles.winnerBadge}>Champion</div>
                <div className={styles.podiumImageContainer}>
                  <img
                    src={topThree[0].photo}
                    alt={topThree[0].title}
                    className={styles.podiumImage}
                  />
                  <div className={styles.podiumOverlay}>
                    <button
                      className={styles.podiumLikeButton}
                      onClick={() => handleLike(topThree[0].id)}
                    >
                      👍 {topThree[0].likes || 0}
                    </button>
                  </div>
                </div>
                <div className={styles.podiumInfo}>
                  <h3 className={styles.podiumTitle}>{topThree[0].title}</h3>
                  <div className={styles.podiumStats}>
                    <span className={styles.podiumRating}>
                      ⭐ {topThree[0].avg_rating ? topThree[0].avg_rating.toFixed(1) : '0.0'}
                    </span>
                    <span className={styles.podiumVotes}>🗳️ {topThree[0].votes || 0}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {topThree[2] && (
              <div className={`${styles.podiumPlace} ${styles.third}`}>
                <div className={styles.podiumRank}>
                  <span className={styles.medalIcon}>{getRankIcon(3)}</span>
                  <span className={styles.rankNumber}>3</span>
                </div>
                <div className={styles.podiumImageContainer}>
                  <img
                    src={topThree[2].photo}
                    alt={topThree[2].title}
                    className={styles.podiumImage}
                  />
                  <div className={styles.podiumOverlay}>
                    <button
                      className={styles.podiumLikeButton}
                      onClick={() => handleLike(topThree[2].id)}
                    >
                      👍 {topThree[2].likes || 0}
                    </button>
                  </div>
                </div>
                <div className={styles.podiumInfo}>
                  <h3 className={styles.podiumTitle}>{topThree[2].title}</h3>
                  <div className={styles.podiumStats}>
                    <span className={styles.podiumRating}>
                      ⭐ {topThree[2].avg_rating ? topThree[2].avg_rating.toFixed(1) : '0.0'}
                    </span>
                    <span className={styles.podiumVotes}>🗳️ {topThree[2].votes || 0}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rest of Leaderboard */}
      {restOfLeaderboard.length > 0 && (
        <div className={styles.listSection}>
          <h3 className={styles.listTitle}>Rising Stars</h3>
          <div className={styles.list}>
            {restOfLeaderboard.map((entry, index) => {
              const rank = index + 4;
              return (
                <div key={entry.id} className={styles.listItem} style={{ animationDelay: `${index * 0.05}s` }}>
                  <div className={styles.listRank}>#{rank}</div>

                  <div className={styles.listImageContainer}>
                    <img src={entry.photo} alt={entry.title} className={styles.listImage} />
                    <div className={styles.listOccasion}>{entry.occasion}</div>
                  </div>

                  <div className={styles.listContent}>
                    <h4 className={styles.listItemTitle}>{entry.title}</h4>
                    <div className={styles.listStats}>
                      <span className={styles.listStat}>
                        <span className={styles.listStatIcon}>⭐</span>
                        {entry.avg_rating ? entry.avg_rating.toFixed(1) : '0.0'}
                      </span>
                      <span className={styles.listStat}>
                        <span className={styles.listStatIcon}>🗳️</span>
                        {entry.votes || 0} votes
                      </span>
                    </div>
                  </div>

                  <button className={styles.listLikeButton} onClick={() => handleLike(entry.id)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span>{entry.likes || 0}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
