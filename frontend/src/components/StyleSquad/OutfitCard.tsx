import React, { useState } from 'react';
import type { SquadOutfit } from '../../types';
import { VoteButtons } from './VoteButtons';
import { CommentSection } from './CommentSection';
import styles from './OutfitCard.module.css';

interface OutfitCardProps {
  outfit: SquadOutfit;
  squadId: string;
  onUpdate: (updates: Partial<SquadOutfit>) => void;
}

export const OutfitCard: React.FC<OutfitCardProps> = ({ outfit, squadId, onUpdate }) => {
  const [showComments, setShowComments] = useState(false);

  const voteCounts = {
    thumbs_up: outfit.votes.filter(v => v.voteType === 'thumbs_up').length,
    thumbs_down: outfit.votes.filter(v => v.voteType === 'thumbs_down').length,
    fire: outfit.votes.filter(v => v.voteType === 'fire').length,
  };

  const totalVotes = voteCounts.thumbs_up + voteCounts.thumbs_down + voteCounts.fire;
  const commentCount = outfit.chatMessages.length;

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.userAvatar}>
          {outfit.userName.charAt(0).toUpperCase()}
        </div>
        <div className={styles.userInfo}>
          <div className={styles.userName}>{outfit.userName}</div>
          <div className={styles.timestamp}>{getTimeAgo(outfit.createdAt)}</div>
        </div>
      </div>

      {/* Question */}
      {outfit.question && (
        <div className={styles.question}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <span>{outfit.question}</span>
        </div>
      )}

      {/* Image */}
      <div className={styles.imageContainer}>
        <img src={outfit.photo} alt={outfit.occasion} className={styles.image} />
        <div className={styles.occasionTag}>{outfit.occasion}</div>
      </div>

      {/* Vote Summary */}
      {totalVotes > 0 && (
        <div className={styles.voteSummary}>
          {voteCounts.fire > 0 && (
            <span className={styles.voteCount}>🔥 {voteCounts.fire}</span>
          )}
          {voteCounts.thumbs_up > 0 && (
            <span className={styles.voteCount}>👍 {voteCounts.thumbs_up}</span>
          )}
          {voteCounts.thumbs_down > 0 && (
            <span className={styles.voteCount}>👎 {voteCounts.thumbs_down}</span>
          )}
        </div>
      )}

      {/* Vote Buttons */}
      <VoteButtons
        outfitId={outfit.id}
        squadId={squadId}
        votes={outfit.votes}
        onVoteUpdate={(votes) => onUpdate({ votes })}
      />

      {/* Comments Toggle */}
      <div className={styles.commentsToggle}>
        <button
          onClick={() => setShowComments(!showComments)}
          className={styles.toggleButton}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
          </svg>
          <span>
            {commentCount === 0
              ? 'Be the first to comment'
              : `${commentCount} comment${commentCount === 1 ? '' : 's'}`}
          </span>
        </button>
      </div>

      {/* Comment Section */}
      {showComments && (
        <CommentSection
          outfitId={outfit.id}
          squadId={squadId}
          messages={outfit.chatMessages}
          onMessageUpdate={(chatMessages) => onUpdate({ chatMessages })}
        />
      )}
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
