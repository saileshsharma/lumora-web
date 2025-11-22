import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useFavoritesStore } from '../../store/favoritesStore';
import type { GeneratorResponse, Occasion } from '../../types';
import {
  shareOutfit,
  downloadOutfitImage,
  downloadOutfitCard,
  copyOutfitDetails,
  shareViaWebShare,
  isWebShareSupported,
} from '../../utils/outfitActions';
import styles from './OutfitActions.module.css';

interface OutfitActionsProps {
  results: GeneratorResponse;
  originalImage: string | null;
  occasion: Occasion | null;
  outfitId?: string;
}

export const OutfitActions: React.FC<OutfitActionsProps> = ({
  results,
  originalImage,
  occasion,
  outfitId,
}) => {
  const { addToHistory, toggleFavorite, getOutfitById } = useFavoritesStore();
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [currentOutfitId, setCurrentOutfitId] = useState(outfitId);

  // Get current outfit to check favorite status
  const savedOutfit = currentOutfitId ? getOutfitById(currentOutfitId) : null;
  const isFavorite = savedOutfit?.isFavorite || false;

  const handleSave = () => {
    if (!currentOutfitId) {
      // First time saving - add to history
      const id = addToHistory({
        occasion,
        originalImage,
        results,
      });
      setCurrentOutfitId(id);
      toast.success('Outfit saved to history!');
    } else {
      toast.success('Outfit already in your history!');
    }
  };

  const handleToggleFavorite = () => {
    if (!currentOutfitId) {
      // Need to save first
      const id = addToHistory({
        occasion,
        originalImage,
        results,
      });
      setCurrentOutfitId(id);
      toggleFavorite(id);
      toast.success('Added to favorites! ⭐');
    } else {
      toggleFavorite(currentOutfitId);
      toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites! ⭐');
    }
  };

  const handleShare = async (platform: 'twitter' | 'facebook' | 'instagram' | 'copy') => {
    try {
      const message = await shareOutfit(platform, results.outfit_image_url, occasion);
      if (message) {
        toast.success(message);
      }
      setShowShareMenu(false);
    } catch (error) {
      toast.error('Failed to share outfit');
    }
  };

  const handleWebShare = async () => {
    try {
      const message = await shareViaWebShare(results.outfit_image_url, occasion);
      toast.success(message);
      setShowShareMenu(false);
    } catch (error: any) {
      if (error.message.includes('not supported')) {
        setShowShareMenu(true); // Show manual share options
      } else {
        toast.error(error.message);
      }
    }
  };

  const handleDownloadImage = async () => {
    try {
      const message = await downloadOutfitImage(results.outfit_image_url, occasion);
      toast.success(message);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDownloadCard = async () => {
    try {
      const message = await downloadOutfitCard('outfit-results-container', occasion);
      toast.success(message);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleCopyDetails = async () => {
    try {
      const message = await copyOutfitDetails(results.outfit_description, occasion);
      toast.success(message);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className={styles.actionsContainer}>
      {/* Primary Actions */}
      <div className={styles.primaryActions}>
        <button
          className={`${styles.actionButton} ${isFavorite ? styles.favorited : ''}`}
          onClick={handleToggleFavorite}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'}>
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          <span>{isFavorite ? 'Favorited' : 'Favorite'}</span>
        </button>

        <button className={styles.actionButton} onClick={handleSave} title="Save to history">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path d="M17 21v-8H7v8M7 3v5h8" stroke="currentColor" strokeWidth="2" />
          </svg>
          <span>Save</span>
        </button>

        <div className={styles.shareButtonContainer}>
          <button
            className={styles.actionButton}
            onClick={() => {
              if (isWebShareSupported()) {
                handleWebShare();
              } else {
                setShowShareMenu(!showShareMenu);
              }
            }}
            title="Share outfit"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 8a3 3 0 100-6 3 3 0 000 6zM6 15a3 3 0 100-6 3 3 0 000 6zM18 22a3 3 0 100-6 3 3 0 000 6zM8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            <span>Share</span>
          </button>

          {showShareMenu && (
            <div className={styles.shareMenu}>
              <button onClick={() => handleShare('twitter')} className={styles.shareOption}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Twitter
              </button>
              <button onClick={() => handleShare('facebook')} className={styles.shareOption}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </button>
              <button onClick={() => handleShare('instagram')} className={styles.shareOption}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                Instagram
              </button>
              <button onClick={() => handleShare('copy')} className={styles.shareOption}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                Copy Link
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Secondary Actions */}
      <div className={styles.secondaryActions}>
        <button
          className={styles.secondaryButton}
          onClick={handleDownloadImage}
          title="Download outfit image"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          <span>Download Image</span>
        </button>

        <button
          className={styles.secondaryButton}
          onClick={handleDownloadCard}
          title="Download full outfit card"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          <span>Download Card</span>
        </button>

        <button
          className={styles.secondaryButton}
          onClick={handleCopyDetails}
          title="Copy outfit details"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          <span>Copy Details</span>
        </button>
      </div>
    </div>
  );
};
