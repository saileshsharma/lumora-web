import React, { useState } from 'react';
import { Modal } from '../common';
import { squadApi } from '../../services/squadApi';
import { useSquadStore } from '../../store/squadStore';
import { showSuccess, handleApiError } from '../../utils/toast';
import styles from './ShareOutfitModal.module.css';

interface ShareOutfitModalProps {
  photo: string;
  occasion: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ShareOutfitModal: React.FC<ShareOutfitModalProps> = ({
  photo,
  occasion,
  onClose,
  onSuccess,
}) => {
  const { squads, currentUserId, currentUserName, addOutfitToSquad } = useSquadStore();
  const [selectedSquadId, setSelectedSquadId] = useState('');
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSquadId) {
      handleApiError(new Error('Please select a squad'));
      return;
    }

    setIsLoading(true);
    try {
      const outfit = await squadApi.shareOutfit({
        squadId: selectedSquadId,
        userId: currentUserId,
        userName: currentUserName,
        photo,
        occasion,
        question: question.trim() || undefined,
      });

      addOutfitToSquad(selectedSquadId, outfit);

      const selectedSquad = squads.find(s => s.id === selectedSquadId);
      showSuccess(`Outfit shared to "${selectedSquad?.name}"! 🎉`);

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (squads.length === 0) {
    return (
      <Modal isOpen onClose={onClose} title="Share to Squad">
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>👥</span>
          <h3 className={styles.emptyTitle}>No Squads Yet</h3>
          <p className={styles.emptyText}>
            Create or join a squad first to share your outfits!
          </p>
          <button onClick={onClose} className={styles.okButton}>
            Got it
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen onClose={onClose} title="Share to Squad">
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Preview */}
        <div className={styles.preview}>
          <img src={photo} alt={occasion} className={styles.previewImage} />
          <div className={styles.previewOverlay}>
            <span className={styles.previewOccasion}>{occasion}</span>
          </div>
        </div>

        {/* Squad Selection */}
        <div className={styles.field}>
          <label className={styles.label}>
            Select Squad <span className={styles.required}>*</span>
          </label>
          <select
            value={selectedSquadId}
            onChange={(e) => setSelectedSquadId(e.target.value)}
            className={styles.select}
            required
          >
            <option value="">Choose a squad...</option>
            {squads.map((squad) => (
              <option key={squad.id} value={squad.id}>
                {squad.name} ({squad.members.length} members)
              </option>
            ))}
          </select>
        </div>

        {/* Question */}
        <div className={styles.field}>
          <label className={styles.label}>Ask Your Squad (optional)</label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g., Does this work for a wedding? Too casual?"
            maxLength={200}
            rows={3}
            className={styles.textarea}
          />
          <span className={styles.hint}>{question.length}/200 characters</span>
        </div>

        <div className={styles.info}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <span>Your squad members can vote and give feedback!</span>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className={styles.cancelBtn}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !selectedSquadId}
            className={styles.submitBtn}
          >
            {isLoading ? 'Sharing...' : 'Share Outfit'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
