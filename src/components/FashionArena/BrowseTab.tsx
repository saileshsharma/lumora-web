import React from 'react';
import { Button, EmptyState } from '../common';
import { useArenaStore } from '../../store/arenaStore';
import { arenaApi } from '../../services/api';
import { showSuccess, handleApiError } from '../../utils/toast';
import type { ArenaSubmission } from '../../types';
import { ITEMS_PER_PAGE } from '../../constants';
import styles from './BrowseTab.module.css';

interface BrowseTabProps {
  submissions: ArenaSubmission[];
  onRefresh: () => void;
}

export const BrowseTab: React.FC<BrowseTabProps> = ({ submissions, onRefresh }) => {
  const { currentPage, setCurrentPage, updateSubmissionLikes } = useArenaStore();

  const totalPages = Math.ceil(submissions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedSubmissions = submissions.slice(startIndex, endIndex);

  const handleLike = async (id: string) => {
    try {
      const result = await arenaApi.likeSubmission(id);
      updateSubmissionLikes(id, result.likes);
      showSuccess('Liked!');
    } catch (error) {
      handleApiError(error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (submissions.length === 0) {
    return (
      <EmptyState
        icon="🌟"
        title="No Outfits Yet"
        description="Be the first to share your style with the community! Rate your outfit and submit it to the arena to get started."
        actionLabel="Refresh"
        onAction={onRefresh}
      />
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {paginatedSubmissions.map((submission) => (
          <div key={submission.id} className={styles.card}>
            <div className={styles.imageContainer}>
              <img src={submission.photo} alt={submission.title} className={styles.image} />
              <div className={styles.occasionBadge}>{submission.occasion}</div>
            </div>
            <div className={styles.cardContent}>
              <h4 className={styles.title}>{submission.title}</h4>
              {submission.description && (
                <p className={styles.description}>{submission.description}</p>
              )}
              <div className={styles.rating}>
                <span className={styles.ratingLabel}>Rating:</span>
                <span className={styles.ratingValue}>{submission.avg_rating.toFixed(1)}/10</span>
                <span className={styles.votes}>({submission.votes} votes)</span>
              </div>
              <div className={styles.actions}>
                <button className={styles.likeButton} onClick={() => handleLike(submission.id)}>
                  👍 {submission.likes}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <Button
            variant="secondary"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ← Previous
          </Button>
          <span className={styles.pageInfo}>
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="secondary"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next →
          </Button>
        </div>
      )}
    </div>
  );
};
