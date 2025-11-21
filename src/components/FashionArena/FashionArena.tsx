import React, { useEffect } from 'react';
import { Loading } from '../common';
import { BrowseTab } from './BrowseTab';
import { LeaderboardTab } from './LeaderboardTab';
import { useArenaStore } from '../../store/arenaStore';
import { arenaApi } from '../../services/api';
import { handleApiError } from '../../utils/toast';
import { ARENA_TABS } from '../../constants';
import type { ArenaTab } from '../../types';
import styles from './FashionArena.module.css';

export const FashionArena: React.FC = () => {
  const {
    activeTab,
    submissions,
    leaderboard,
    isLoading,
    setActiveTab,
    setSubmissions,
    setLeaderboard,
    setLoading,
  } = useArenaStore();

  useEffect(() => {
    if (activeTab === ARENA_TABS.BROWSE) {
      loadSubmissions();
    } else {
      loadLeaderboard();
    }
  }, [activeTab]);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const data = await arenaApi.getSubmissions();
      setSubmissions(data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await arenaApi.getLeaderboard();
      setLeaderboard(data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: ArenaTab) => {
    setActiveTab(tab);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Fashion Arena</h2>
        <p className={styles.description}>
          Share your outfits, vote on others, and climb the leaderboard
        </p>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === ARENA_TABS.BROWSE ? styles.active : ''}`}
          onClick={() => handleTabChange(ARENA_TABS.BROWSE)}
        >
          🌟 Browse Outfits
        </button>
        <button
          className={`${styles.tab} ${activeTab === ARENA_TABS.LEADERBOARD ? styles.active : ''}`}
          onClick={() => handleTabChange(ARENA_TABS.LEADERBOARD)}
        >
          🏆 Leaderboard
        </button>
      </div>

      <div className={styles.content}>
        {isLoading && <Loading message="Loading..." fullScreen={false} />}

        {!isLoading && activeTab === ARENA_TABS.BROWSE && (
          <BrowseTab submissions={submissions} onRefresh={loadSubmissions} />
        )}

        {!isLoading && activeTab === ARENA_TABS.LEADERBOARD && (
          <LeaderboardTab leaderboard={leaderboard} onRefresh={loadLeaderboard} />
        )}
      </div>
    </div>
  );
};
