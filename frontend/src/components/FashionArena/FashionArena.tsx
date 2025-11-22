import React, { useEffect, useState } from 'react';
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

  const [sortBy, setSortBy] = useState<'recent' | 'top_voted' | 'top_rated'>('recent');
  const [filterOccasion, setFilterOccasion] = useState<string>('all');
  const [stats, setStats] = useState({ total: 0, todayCount: 0, avgRating: 0 });

  useEffect(() => {
    if (activeTab === ARENA_TABS.BROWSE) {
      loadSubmissions();
    } else {
      loadLeaderboard();
    }
  }, [activeTab, sortBy]);

  useEffect(() => {
    // Calculate stats
    const today = new Date().setHours(0, 0, 0, 0);
    const todaySubmissions = submissions.filter(
      (s) => new Date(s.created_at).setHours(0, 0, 0, 0) === today
    );
    const avgRating =
      submissions.length > 0
        ? submissions.reduce((sum, s) => sum + (s.avg_rating || 0), 0) / submissions.length
        : 0;

    setStats({
      total: submissions.length,
      todayCount: todaySubmissions.length,
      avgRating: Number(avgRating.toFixed(1)),
    });
  }, [submissions]);

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

  const filteredSubmissions =
    filterOccasion === 'all'
      ? submissions
      : submissions.filter((s) => s.occasion === filterOccasion);

  // Get unique occasions for filter
  const occasions = ['all', ...new Set(submissions.map((s) => s.occasion))];

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <div className={styles.hero}>
        <div className={styles.heroBackground}>
          <div className={styles.heroGradient}></div>
          <div className={styles.heroPattern}></div>
        </div>

        <div className={styles.heroContent}>
          <div className={styles.heroIcon}>🏆</div>
          <h1 className={styles.heroTitle}>Fashion Arena</h1>
          <p className={styles.heroSubtitle}>
            Where Style Meets Competition • Showcase Your Best Looks
          </p>

          {/* Stats Bar */}
          <div className={styles.statsBar}>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{stats.total}</div>
              <div className={styles.statLabel}>Total Outfits</div>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{stats.todayCount}</div>
              <div className={styles.statLabel}>Today</div>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{stats.avgRating}</div>
              <div className={styles.statLabel}>Avg Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs with modern design */}
      <div className={styles.tabsContainer}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === ARENA_TABS.BROWSE ? styles.active : ''}`}
            onClick={() => handleTabChange(ARENA_TABS.BROWSE)}
          >
            <span className={styles.tabIcon}>🌟</span>
            <span className={styles.tabLabel}>Browse</span>
            {activeTab === ARENA_TABS.BROWSE && <div className={styles.tabIndicator}></div>}
          </button>
          <button
            className={`${styles.tab} ${activeTab === ARENA_TABS.LEADERBOARD ? styles.active : ''}`}
            onClick={() => handleTabChange(ARENA_TABS.LEADERBOARD)}
          >
            <span className={styles.tabIcon}>🏆</span>
            <span className={styles.tabLabel}>Leaderboard</span>
            {activeTab === ARENA_TABS.LEADERBOARD && <div className={styles.tabIndicator}></div>}
          </button>
        </div>

        {/* Filters for Browse tab */}
        {activeTab === ARENA_TABS.BROWSE && (
          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Sort By:</label>
              <select
                className={styles.filterSelect}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="recent">Most Recent</option>
                <option value="top_voted">Most Voted</option>
                <option value="top_rated">Highest Rated</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Occasion:</label>
              <select
                className={styles.filterSelect}
                value={filterOccasion}
                onChange={(e) => setFilterOccasion(e.target.value)}
              >
                {occasions.map((occasion) => (
                  <option key={occasion} value={occasion}>
                    {occasion === 'all' ? 'All Occasions' : occasion}
                  </option>
                ))}
              </select>
            </div>

            <button className={styles.refreshButton} onClick={loadSubmissions}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
              Refresh
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={styles.content}>
        {isLoading && <Loading message="Loading amazing outfits..." fullScreen={false} />}

        {!isLoading && activeTab === ARENA_TABS.BROWSE && (
          <BrowseTab submissions={filteredSubmissions} onRefresh={loadSubmissions} sortBy={sortBy} />
        )}

        {!isLoading && activeTab === ARENA_TABS.LEADERBOARD && (
          <LeaderboardTab leaderboard={leaderboard} onRefresh={loadLeaderboard} />
        )}
      </div>
    </div>
  );
};
