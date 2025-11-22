import React, { useState } from 'react';
import { Modal } from '../common';
import { squadApi } from '../../services/squadApi';
import { useSquadStore } from '../../store/squadStore';
import { showSuccess, handleApiError } from '../../utils/toast';
import styles from './CreateSquadModal.module.css';

interface CreateSquadModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateSquadModal: React.FC<CreateSquadModalProps> = ({ onClose, onSuccess }) => {
  const { currentUserId, currentUserName, addSquad } = useSquadStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [maxMembers, setMaxMembers] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      handleApiError(new Error('Squad name is required'));
      return;
    }

    setIsLoading(true);
    try {
      const squad = await squadApi.createSquad({
        name: name.trim(),
        description: description.trim(),
        userId: currentUserId,
        userName: currentUserName,
        maxMembers,
      });

      addSquad(squad);
      showSuccess(`Squad "${squad.name}" created! 🎉\nInvite code: ${squad.inviteCode}`);
      onSuccess();
      onClose();
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Create Style Squad">
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label}>
            Squad Name <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Fashion Friends, Style Crew"
            maxLength={50}
            className={styles.input}
            required
            autoFocus
          />
          <span className={styles.hint}>{name.length}/50 characters</span>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this squad about? (optional)"
            maxLength={200}
            rows={3}
            className={styles.textarea}
          />
          <span className={styles.hint}>{description.length}/200 characters</span>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Max Members</label>
          <select
            value={maxMembers}
            onChange={(e) => setMaxMembers(Number(e.target.value))}
            className={styles.select}
          >
            <option value={5}>5 members</option>
            <option value={10}>10 members (recommended)</option>
            <option value={15}>15 members</option>
            <option value={20}>20 members</option>
          </select>
        </div>

        <div className={styles.info}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <span>You'll get an invite code to share with friends!</span>
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
            disabled={isLoading}
            className={styles.submitBtn}
          >
            {isLoading ? 'Creating...' : 'Create Squad'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
