import React, { useState } from 'react';
import { useFavoritesStore } from '../../store/favoritesStore';
import { Modal } from '../common';
import styles from './OutfitHistory.module.css';

interface OutfitHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OutfitHistory: React.FC<OutfitHistoryProps> = ({ isOpen, onClose }) => {
  const {
    history,
    favorites,
    getFavorites,
    getRecentOutfits,
    toggleFavorite,
    removeFromHistory,
    clearHistory,
  } = useFavoritesStore();

  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const displayedOutfits =
    activeTab === 'favorites' ? getFavorites() : getRecentOutfits(100);

  const filteredOutfits = displayedOutfits.filter((outfit) => {
    const matchesSearch =
      !searchQuery ||
      outfit.results.outfit_description
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      outfit.occasion?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Outfit History">
      <div className={styles.container}>
        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'all' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('all')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            All History ({history.length})
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'favorites' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            Favorites ({favorites.length})
          </button>
        </div>

        {/* Search & Filter */}
        <div className={styles.controls}>
          <div className={styles.searchBox}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            <input
              type="text"
              placeholder="Search outfits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {history.length > 0 && (
            <button
              className={styles.clearButton}
              onClick={() => {
                if (confirm('Are you sure you want to clear all history?')) {
                  clearHistory();
                }
              }}
            >
              Clear All
            </button>
          )}
        </div>

        {/* Outfit Grid */}
        {filteredOutfits.length === 0 ? (
          <div className={styles.emptyState}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            <h3>No outfits yet</h3>
            <p>
              {activeTab === 'favorites'
                ? 'Save your favorite outfits to see them here'
                : 'Generated outfits will appear here'}
            </p>
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredOutfits.map((outfit) => (
              <div key={outfit.id} className={styles.card}>
                {/* Image */}
                <div className={styles.imageContainer}>
                  <img
                    src={outfit.results.outfit_image_url}
                    alt="Generated outfit"
                    className={styles.image}
                  />
                  {outfit.isFavorite && (
                    <div className={styles.favoriteBadge}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className={styles.info}>
                  {outfit.occasion && (
                    <span className={styles.occasion}>{outfit.occasion}</span>
                  )}
                  <p className={styles.date}>{formatDate(outfit.timestamp)}</p>
                </div>

                {/* Actions */}
                <div className={styles.actions}>
                  <button
                    className={styles.iconButton}
                    onClick={() => toggleFavorite(outfit.id)}
                    title={outfit.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill={outfit.isFavorite ? 'currentColor' : 'none'}
                    >
                      <path
                        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  </button>

                  <button
                    className={styles.iconButton}
                    onClick={() => {
                      if (confirm('Delete this outfit from history?')) {
                        removeFromHistory(outfit.id);
                      }
                    }}
                    title="Delete outfit"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};
