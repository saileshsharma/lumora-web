import React, { useMemo } from 'react';
import { EmptyState } from '../common';
import { useArenaStore } from '../../store/arenaStore';
import { arenaApi } from '../../services/api';
import { showSuccess, handleApiError } from '../../utils/toast';
import type { ArenaSubmission } from '../../types';
import { ITEMS_PER_PAGE } from '../../constants';
import styles from './BrowseTab_NEW.module.css';

interface BrowseTabProps {
  submissions: ArenaSubmission[];
  onRefresh: () => void;
  sortBy: 'recent' | 'top_voted' | 'top_rated';
}

export const BrowseTab: React.FC<BrowseTabProps> = ({ submissions, onRefresh, sortBy }) => {
  const { currentPage, setCurrentPage, updateSubmissionLikes } = useArenaStore();

  // Sort submissions based on sortBy
  const sortedSubmissions = useMemo(() => {
    const sorted = [...submissions];
    switch (sortBy) {
      case 'top_voted':
        return sorted.sort((a, b) => (b.votes || 0) - (a.votes || 0));
      case 'top_rated':
        return sorted.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0));
      case 'recent':
      default:
        return sorted.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }
  }, [submissions, sortBy]);

  const totalPages = Math.ceil(sortedSubmissions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedSubmissions = sortedSubmissions.slice(startIndex, endIndex);

  const handleLike = async (id: string) => {
    try {
      const result = await arenaApi.likeSubmission(id);
      updateSubmissionLikes(id, result.likes);
      showSuccess('Liked! 👍');
    } catch (error) {
      handleApiError(error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
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
      {/* Results count */}
      <div className={styles.resultsBar}>
        <span className={styles.resultsCount}>
          Showing {startIndex + 1}-{Math.min(endIndex, sortedSubmissions.length)} of{' '}
          {sortedSubmissions.length} outfits
        </span>
      </div>

      {/* Grid */}
      <div className={styles.grid}>
        {paginatedSubmissions.map((submission, index) => (
          <div
            key={submission.id}
            className={styles.card}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Image Container */}
            <div className={styles.imageContainer}>
              <img src={submission.photo} alt={submission.title} className={styles.image} />
              <div className={styles.imageOverlay}>
                <button
                  className={styles.quickLikeButton}
                  onClick={() => handleLike(submission.id)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 22V12M2 14v6a2 2 0 002 2h3M17 22v-10M22 14v6a2 2 0 01-2 2h-3M12 13V2l3 7h4l-3 7-4-3z" />
                  </svg>
                </button>
              </div>
              <div className={styles.occasionBadge}>{submission.occasion}</div>
              {index < 3 && sortBy === 'top_rated' && (
                <div className={styles.trendingBadge}>
                  🔥 Trending
                </div>
              )}
            </div>

            {/* Content */}
            <div className={styles.cardContent}>
              <h3 className={styles.title}>{submission.title}</h3>

              {submission.description && (
                <p className={styles.description}>{submission.description}</p>
              )}

              {/* Stats */}
              <div className={styles.stats}>
                <div className={styles.stat}>
                  <div className={styles.statIcon}>⭐</div>
                  <div className={styles.statContent}>
                    <div className={styles.statValue}>
                      {submission.avg_rating ? submission.avg_rating.toFixed(1) : '0.0'}
                    </div>
                    <div className={styles.statLabel}>Rating</div>
                  </div>
                </div>

                <div className={styles.stat}>
                  <div className={styles.statIcon}>🗳️</div>
                  <div className={styles.statContent}>
                    <div className={styles.statValue}>{submission.votes || 0}</div>
                    <div className={styles.statLabel}>Votes</div>
                  </div>
                </div>

                <div className={styles.stat}>
                  <div className={styles.statIcon}>👍</div>
                  <div className={styles.statContent}>
                    <div className={styles.statValue}>{submission.likes || 0}</div>
                    <div className={styles.statLabel}>Likes</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className={styles.actions}>
                <button className={styles.likeButton} onClick={() => handleLike(submission.id)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  Like
                </button>

                <div className={styles.timeAgo}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  {getTimeAgo(submission.created_at)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.paginationButton}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Previous
          </button>

          <div className={styles.paginationPages}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`${styles.paginationPage} ${page === currentPage ? styles.active : ''}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            className={styles.paginationButton}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};
