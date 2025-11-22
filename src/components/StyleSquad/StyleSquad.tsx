import React, { useEffect } from 'react';
import { useSquadStore } from '../../store/squadStore';
import { squadApi } from '../../services/squadApi';
import { SquadList } from './SquadList';
import { SquadDetail } from './SquadDetail';
import { Loading } from '../common';
import { handleApiError } from '../../utils/toast';
import styles from './StyleSquad.module.css';

export const StyleSquad: React.FC = () => {
  const { squads, activeSquadId, currentUserId, isLoading, setSquads, setLoading, setActiveSquadId } = useSquadStore();

  useEffect(() => {
    // Initialize user if not set
    if (!currentUserId) {
      const userId = localStorage.getItem('userId') || generateUserId();
      const userName = localStorage.getItem('userName') || 'User';
      useSquadStore.getState().setCurrentUser(userId, userName);
      localStorage.setItem('userId', userId);
      localStorage.setItem('userName', userName);
    }

    loadSquads();
  }, [currentUserId]);

  const generateUserId = () => {
    return `user_${Math.random().toString(36).substr(2, 9)}`;
  };

  const loadSquads = async () => {
    const userId = useSquadStore.getState().currentUserId;
    if (!userId) return;

    setLoading(true);
    try {
      const data = await squadApi.getUserSquads(userId);
      setSquads(data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setActiveSquadId(null);
  };

  if (isLoading && squads.length === 0) {
    return <Loading message="Loading your squads..." fullScreen={false} />;
  }

  return (
    <div className={styles.container}>
      {activeSquadId ? (
        <SquadDetail onBack={handleBack} onRefresh={loadSquads} />
      ) : (
        <SquadList onRefresh={loadSquads} />
      )}
    </div>
  );
};
