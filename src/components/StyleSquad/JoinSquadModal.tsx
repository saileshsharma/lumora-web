import React, { useState } from 'react';
import { Modal } from '../common';
import { squadApi } from '../../services/squadApi';
import { useSquadStore } from '../../store/squadStore';
import { showSuccess, handleApiError } from '../../utils/toast';
import styles from './JoinSquadModal.module.css';

interface JoinSquadModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const JoinSquadModal: React.FC<JoinSquadModalProps> = ({ onClose, onSuccess }) => {
  const { currentUserId, currentUserName, addSquad } = useSquadStore();
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const code = inviteCode.trim().toUpperCase();
    if (!code) {
      handleApiError(new Error('Invite code is required'));
      return;
    }

    if (code.length !== 6) {
      handleApiError(new Error('Invite code must be 6 characters'));
      return;
    }

    setIsLoading(true);
    try {
      const squad = await squadApi.joinSquad({
        inviteCode: code,
        userId: currentUserId,
        userName: currentUserName,
      });

      addSquad(squad);
      showSuccess(`Successfully joined "${squad.name}"! 🎉`);
      onSuccess();
      onClose();
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Convert to uppercase and limit to 6 characters
    const value = e.target.value.toUpperCase().slice(0, 6);
    setInviteCode(value);
  };

  return (
    <Modal isOpen onClose={onClose} title="Join Style Squad">
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label}>
            Invite Code <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            value={inviteCode}
            onChange={handleCodeChange}
            placeholder="ABC123"
            maxLength={6}
            className={styles.codeInput}
            required
            autoFocus
          />
          <span className={styles.hint}>
            Enter the 6-character code shared by a squad member
          </span>
        </div>

        <div className={styles.info}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <span>Ask a squad member to share their invite code with you!</span>
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
            disabled={isLoading || inviteCode.length !== 6}
            className={styles.submitBtn}
          >
            {isLoading ? 'Joining...' : 'Join Squad'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
