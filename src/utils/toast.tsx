/**
 * Toast Notification Utilities
 * Wrapper around react-hot-toast for consistent notifications
 */

import toast from 'react-hot-toast';
import { ERROR_MESSAGES } from '../constants';
import { ApiException } from '../services/api';

/**
 * Show success toast with celebration animation
 */
export const showSuccess = (message: string, celebrate = false) => {
  toast.success(message, {
    duration: 3000,
    position: 'top-center',
    style: {
      background: '#10b981',
      color: '#fff',
      fontFamily: 'EB Garamond, serif',
      fontSize: '16px',
      padding: '16px 24px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      fontWeight: '600',
    },
    icon: celebrate ? '🎉' : '✅',
  });

  // Trigger confetti for celebrations (high scores, etc.)
  if (celebrate && typeof window !== 'undefined') {
    triggerConfetti();
  }
};

/**
 * Trigger confetti animation
 */
const triggerConfetti = () => {
  // Simple confetti effect using emoji
  const confetti = document.createElement('div');
  confetti.className = 'confetti-container';
  confetti.innerHTML = Array(20)
    .fill(0)
    .map(
      (_, i) =>
        `<span class="confetti" style="left: ${Math.random() * 100}%; animation-delay: ${
          i * 0.05
        }s;">🎉</span>`
    )
    .join('');

  document.body.appendChild(confetti);

  // Remove after animation
  setTimeout(() => {
    confetti.remove();
  }, 3000);
};

/**
 * Show error toast with optional retry button
 */
export const showError = (message: string, onRetry?: () => void) => {
  toast.error(
    (t) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ flex: 1 }}>{message}</span>
        {onRetry && (
          <button
            onClick={() => {
              toast.dismiss(t.id);
              onRetry();
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '6px',
              padding: '6px 12px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            Retry
          </button>
        )}
      </div>
    ),
    {
      duration: onRetry ? 6000 : 4000, // Longer duration if retry is available
      position: 'top-center',
      style: {
        background: '#ef4444',
        color: '#fff',
        fontFamily: 'EB Garamond, serif',
        fontSize: '16px',
        padding: '16px 24px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        maxWidth: '500px',
      },
    }
  );
};

/**
 * Show loading toast (returns toast ID for updating later)
 */
export const showLoading = (message: string) => {
  return toast.loading(message, {
    position: 'top-center',
    style: {
      fontFamily: 'EB Garamond, serif',
      fontSize: '16px',
    },
  });
};

/**
 * Update a loading toast to success
 */
export const updateToSuccess = (toastId: string, message: string) => {
  toast.success(message, {
    id: toastId,
    duration: 3000,
  });
};

/**
 * Update a loading toast to error
 */
export const updateToError = (toastId: string, message: string) => {
  toast.error(message, {
    id: toastId,
    duration: 4000,
  });
};

/**
 * Handle API errors with appropriate toast messages
 */
export const handleApiError = (error: unknown) => {
  if (error instanceof ApiException) {
    showError(error.message);
  } else if (error instanceof Error) {
    showError(error.message);
  } else {
    showError(ERROR_MESSAGES.SERVER_ERROR);
  }
};

/**
 * Show info toast
 */
export const showInfo = (message: string) => {
  toast(message, {
    duration: 3000,
    position: 'top-center',
    icon: 'ℹ️',
    style: {
      fontFamily: 'EB Garamond, serif',
      fontSize: '16px',
    },
  });
};

export default {
  showSuccess,
  showError,
  showLoading,
  updateToSuccess,
  updateToError,
  handleApiError,
  showInfo,
};
