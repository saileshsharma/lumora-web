import React, { useEffect, useState } from 'react';
import { useSquadStore } from '../../store/squadStore';
import { squadApi } from '../../services/squadApi';
import { handleApiError } from '../../utils/toast';
import { OutfitCard } from './OutfitCard';
import type { SquadOutfit } from '../../types';
import styles from './OutfitFeed.module.css';

interface OutfitFeedProps {
  squadId: string;
}

export const OutfitFeed: React.FC<OutfitFeedProps> = ({ squadId }) => {
  const { getSquadById, updateOutfitInSquad } = useSquadStore();
  const squad = getSquadById(squadId);
  const [isLoading, setIsLoading] = useState(false);

  const outfits = squad?.outfits || [];

  const handleVoteUpdate = (outfitId: string, updates: Partial<SquadOutfit>) => {
    updateOutfitInSquad(squadId, outfitId, updates);
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const freshOutfits = await squadApi.getSquadOutfits(squadId);
      // Update the squad with fresh outfits
      useSquadStore.getState().updateSquad(squadId, { outfits: freshOutfits });
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (outfits.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>👗</span>
        <h3 className={styles.emptyTitle}>No outfits yet</h3>
        <p className={styles.emptyText}>
          Be the first to share an outfit with your squad!
        </p>
      </div>
    );
  }

  return (
    <div className={styles.feed}>
      {isLoading && (
        <div className={styles.refreshing}>
          <div className={styles.spinner}></div>
          <span>Refreshing...</span>
        </div>
      )}

      <div className={styles.outfits}>
        {outfits.map((outfit) => (
          <OutfitCard
            key={outfit.id}
            outfit={outfit}
            squadId={squadId}
            onUpdate={(updates) => handleVoteUpdate(outfit.id, updates)}
          />
        ))}
      </div>
    </div>
  );
};
