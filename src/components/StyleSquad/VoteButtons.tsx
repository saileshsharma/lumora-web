import React, { useState } from 'react';
import type { VoteType, SquadOutfitVote } from '../../types';
import { useSquadStore } from '../../store/squadStore';
import { squadApi } from '../../services/squadApi';
import { handleApiError } from '../../utils/toast';
import styles from './VoteButtons.module.css';

interface VoteButtonsProps {
  outfitId: string;
  squadId: string;
  votes: SquadOutfitVote[];
  onVoteUpdate: (votes: SquadOutfitVote[]) => void;
}

export const VoteButtons: React.FC<VoteButtonsProps> = ({
  outfitId,
  squadId,
  votes,
  onVoteUpdate,
}) => {
  const { currentUserId, currentUserName } = useSquadStore();
  const [isVoting, setIsVoting] = useState(false);

  const userVote = votes.find(v => v.userId === currentUserId);

  const handleVote = async (voteType: VoteType) => {
    // If user already voted with this type, do nothing
    if (userVote?.voteType === voteType) return;

    setIsVoting(true);
    try {
      await squadApi.voteOnOutfit({
        outfitId,
        userId: currentUserId,
        userName: currentUserName,
        voteType,
      });

      // Optimistically update the votes
      const newVotes = votes.filter(v => v.userId !== currentUserId);
      newVotes.push({
        userId: currentUserId,
        userName: currentUserName,
        voteType,
        votedAt: new Date().toISOString(),
      });

      onVoteUpdate(newVotes);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsVoting(false);
    }
  };

  const getButtonClass = (type: VoteType) => {
    const isActive = userVote?.voteType === type;
    return `${styles.voteButton} ${isActive ? styles.active : ''} ${styles[type]}`;
  };

  return (
    <div className={styles.container}>
      <button
        onClick={() => handleVote('thumbs_up')}
        disabled={isVoting}
        className={getButtonClass('thumbs_up')}
        title="This looks great!"
      >
        <span className={styles.icon}>👍</span>
        <span className={styles.label}>Great</span>
      </button>

      <button
        onClick={() => handleVote('fire')}
        disabled={isVoting}
        className={getButtonClass('fire')}
        title="Fire! 🔥"
      >
        <span className={styles.icon}>🔥</span>
        <span className={styles.label}>Fire</span>
      </button>

      <button
        onClick={() => handleVote('thumbs_down')}
        disabled={isVoting}
        className={getButtonClass('thumbs_down')}
        title="Needs improvement"
      >
        <span className={styles.icon}>👎</span>
        <span className={styles.label}>Nah</span>
      </button>
    </div>
  );
};
