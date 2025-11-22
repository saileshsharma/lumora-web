import React, { useState, useEffect } from 'react';
import { useSquadStore } from '../../store/squadStore';
import { squadApi } from '../../services/squadApi';
import { handleApiError, showSuccess } from '../../utils/toast';
import { OutfitFeed } from './OutfitFeed';
import { ShareOutfitModal } from './ShareOutfitModal';
import styles from './SquadDetail.module.css';

interface SquadDetailProps {
  onBack: () => void;
  onRefresh: () => void;
}

type TabType = 'feed' | 'members' | 'settings';

export const SquadDetail: React.FC<SquadDetailProps> = ({ onBack, onRefresh }) => {
  const { getActiveSquad, currentUserId, removeSquad, setActiveSquadId } = useSquadStore();
  const squad = getActiveSquad();
  const [activeTab, setActiveTab] = useState<TabType>('feed');
  const [showShareModal, setShowShareModal] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (!squad) {
      onBack();
    }
  }, [squad, onBack]);

  if (!squad) return null;

  const isCreator = squad.createdBy === currentUserId;
  const hasOutfits = squad.outfits.length > 0;

  const handleLeaveSquad = async () => {
    if (!confirm('Are you sure you want to leave this squad?')) return;

    setIsLeaving(true);
    try {
      await squadApi.leaveSquad(squad.id, currentUserId);
      removeSquad(squad.id);
      showSuccess(`Left "${squad.name}"`);
      setActiveSquadId(null);
      onBack();
      onRefresh();
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLeaving(false);
    }
  };

  const handleDeleteSquad = async () => {
    if (!confirm(`Delete "${squad.name}"? This cannot be undone!`)) return;

    setIsLeaving(true);
    try {
      await squadApi.deleteSquad(squad.id, currentUserId);
      removeSquad(squad.id);
      showSuccess(`Squad deleted`);
      setActiveSquadId(null);
      onBack();
      onRefresh();
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLeaving(false);
    }
  };

  const handleCopyInviteCode = () => {
    if (squad.inviteCode) {
      navigator.clipboard.writeText(squad.inviteCode);
      showSuccess('Invite code copied to clipboard! 📋');
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button onClick={onBack} className={styles.backButton}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Back
        </button>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>{squad.name}</h1>
          {squad.description && (
            <p className={styles.description}>{squad.description}</p>
          )}
          <div className={styles.stats}>
            <span className={styles.stat}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
              {squad.members.length}/{squad.maxMembers} members
            </span>
            <span className={styles.stat}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              {squad.outfits.length} outfits
            </span>
            {squad.inviteCode && (
              <button onClick={handleCopyInviteCode} className={styles.inviteButton}>
                🔑 {squad.inviteCode}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          onClick={() => setActiveTab('feed')}
          className={`${styles.tab} ${activeTab === 'feed' ? styles.tabActive : ''}`}
        >
          Feed
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`${styles.tab} ${activeTab === 'members' ? styles.tabActive : ''}`}
        >
          Members
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`${styles.tab} ${activeTab === 'settings' ? styles.tabActive : ''}`}
        >
          Settings
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.content}>
        {activeTab === 'feed' && (
          <>
            {hasOutfits ? (
              <OutfitFeed squadId={squad.id} />
            ) : (
              <div className={styles.emptyFeed}>
                <span className={styles.emptyIcon}>👗</span>
                <h3 className={styles.emptyTitle}>No Outfits Yet</h3>
                <p className={styles.emptyText}>
                  Be the first to share an outfit with your squad!
                </p>
                <button onClick={() => setShowShareModal(true)} className={styles.shareButton}>
                  Share Outfit
                </button>
              </div>
            )}
          </>
        )}

        {activeTab === 'members' && (
          <div className={styles.membersList}>
            {squad.members.map((member) => (
              <div key={member.userId} className={styles.memberCard}>
                <div className={styles.memberAvatar}>
                  {member.userName.charAt(0).toUpperCase()}
                </div>
                <div className={styles.memberInfo}>
                  <div className={styles.memberName}>{member.userName}</div>
                  <div className={styles.memberMeta}>
                    Joined {new Date(member.joinedAt).toLocaleDateString()}
                    {member.userId === squad.createdBy && (
                      <span className={styles.creatorBadge}>Creator</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className={styles.settings}>
            <div className={styles.settingsSection}>
              <h3 className={styles.settingsTitle}>Squad Information</h3>
              <div className={styles.settingsItem}>
                <span className={styles.settingsLabel}>Created by</span>
                <span className={styles.settingsValue}>
                  {squad.members.find(m => m.userId === squad.createdBy)?.userName || 'Unknown'}
                </span>
              </div>
              <div className={styles.settingsItem}>
                <span className={styles.settingsLabel}>Created on</span>
                <span className={styles.settingsValue}>
                  {new Date(squad.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className={styles.settingsItem}>
                <span className={styles.settingsLabel}>Invite Code</span>
                <button onClick={handleCopyInviteCode} className={styles.copyCodeButton}>
                  {squad.inviteCode} <span className={styles.copyIcon}>📋</span>
                </button>
              </div>
            </div>

            <div className={styles.settingsSection}>
              <h3 className={styles.settingsTitle}>Actions</h3>
              {isCreator ? (
                <button
                  onClick={handleDeleteSquad}
                  disabled={isLeaving}
                  className={styles.deleteButton}
                >
                  {isLeaving ? 'Deleting...' : 'Delete Squad'}
                </button>
              ) : (
                <button
                  onClick={handleLeaveSquad}
                  disabled={isLeaving}
                  className={styles.leaveButton}
                >
                  {isLeaving ? 'Leaving...' : 'Leave Squad'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Share Button */}
      {activeTab === 'feed' && hasOutfits && (
        <button onClick={() => setShowShareModal(true)} className={styles.fab}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
        </button>
      )}

      {/* Modals */}
      {showShareModal && (
        <ShareOutfitModal
          photo="https://via.placeholder.com/400x600/667eea/ffffff?text=Your+Outfit"
          occasion="squad"
          onClose={() => setShowShareModal(false)}
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
};
