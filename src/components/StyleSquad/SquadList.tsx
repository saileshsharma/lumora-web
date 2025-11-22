import React, { useState } from 'react';
import { useSquadStore } from '../../store/squadStore';
import { SquadCard } from './SquadCard';
import { CreateSquadModal } from './CreateSquadModal';
import { JoinSquadModal } from './JoinSquadModal';
import { EmptyState } from '../common';
import styles from './SquadList.module.css';

interface SquadListProps {
  onRefresh: () => void;
}

export const SquadList: React.FC<SquadListProps> = ({ onRefresh }) => {
  const { squads, setActiveSquadId } = useSquadStore();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  const handleSquadClick = (squadId: string) => {
    setActiveSquadId(squadId);
  };

  const handleCreateSuccess = () => {
    setShowCreate(false);
    onRefresh();
  };

  const handleJoinSuccess = () => {
    setShowJoin(false);
    onRefresh();
  };

  if (squads.length === 0) {
    return (
      <>
        <div className={styles.emptyContainer}>
          <EmptyState
            icon="👥"
            title="No Squads Yet"
            description="Create your first squad or join one with an invite code to get honest fashion feedback from friends!"
            actionLabel="Create Squad"
            onAction={() => setShowCreate(true)}
          />
          <button onClick={() => setShowJoin(true)} className={styles.joinButton}>
            Join with Invite Code
          </button>
        </div>
        {showCreate && <CreateSquadModal onClose={() => setShowCreate(false)} onSuccess={handleCreateSuccess} />}
        {showJoin && <JoinSquadModal onClose={() => setShowJoin(false)} onSuccess={handleJoinSuccess} />}
      </>
    );
  }

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>Your Style Squads</h1>
          <p className={styles.subtitle}>Get honest fashion feedback from your trusted friends</p>
        </div>
        <div className={styles.actions}>
          <button onClick={() => setShowCreate(true)} className={styles.createBtn}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Create Squad
          </button>
          <button onClick={() => setShowJoin(true)} className={styles.joinBtn}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Join Squad
          </button>
        </div>
      </div>

      {/* Squads Grid */}
      <div className={styles.grid}>
        {squads.map((squad, index) => (
          <SquadCard
            key={squad.id}
            squad={squad}
            onClick={() => handleSquadClick(squad.id)}
            style={{ animationDelay: `${index * 0.1}s` }}
          />
        ))}
      </div>

      {/* Modals */}
      {showCreate && <CreateSquadModal onClose={() => setShowCreate(false)} onSuccess={handleCreateSuccess} />}
      {showJoin && <JoinSquadModal onClose={() => setShowJoin(false)} onSuccess={handleJoinSuccess} />}
    </div>
  );
};
