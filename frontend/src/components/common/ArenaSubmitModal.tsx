import React, { useState } from 'react';
import { Button } from './Button';
import { arenaApi } from '../../services/api';
import { showSuccess, handleApiError } from '../../utils/toast';
import type { Occasion } from '../../types';
import styles from './ArenaSubmitModal.module.css';

interface ArenaSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageData: string;
  occasion: Occasion | null;
  sourceMode: 'rater' | 'generator';
  defaultTitle?: string;
  defaultDescription?: string;
}

export const ArenaSubmitModal: React.FC<ArenaSubmitModalProps> = ({
  isOpen,
  onClose,
  imageData,
  occasion,
  sourceMode,
  defaultTitle = '',
  defaultDescription = '',
}) => {
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState(defaultDescription);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      handleApiError(new Error('Please enter a title for your outfit'));
      return;
    }

    if (!occasion) {
      handleApiError(new Error('Occasion is required'));
      return;
    }

    setIsSubmitting(true);

    try {
      await arenaApi.submitOutfit(
        imageData,
        title.trim(),
        occasion,
        description.trim() || undefined,
        sourceMode
      );

      showSuccess('🏆 Outfit submitted to Fashion Arena!');
      onClose();

      // Reset form
      setTitle('');
      setDescription('');
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>🏆 Submit to Fashion Arena</h2>
          <button className={styles.closeButton} onClick={handleClose} disabled={isSubmitting}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.previewSection}>
            <img src={imageData} alt="Your outfit" className={styles.previewImage} />
            <div className={styles.occasionBadge}>{occasion || 'No occasion'}</div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Title <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., My Summer Beach Look"
              maxLength={100}
              required
              disabled={isSubmitting}
            />
            <div className={styles.charCount}>{title.length}/100</div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Description (Optional)</label>
            <textarea
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us about your outfit, inspiration, or styling choices..."
              maxLength={500}
              rows={4}
              disabled={isSubmitting}
            />
            <div className={styles.charCount}>{description.length}/500</div>
          </div>

          <div className={styles.infoBox}>
            <p className={styles.infoText}>
              ✨ Your outfit will be displayed in Fashion Arena where others can vote and like it!
            </p>
          </div>

          <div className={styles.actions}>
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              🚀 Submit to Arena
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
