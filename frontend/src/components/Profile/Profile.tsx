import React, { useState, useEffect } from 'react';
import { useKeycloak } from '../../providers/KeycloakProvider';
import { getUserInfo, getUserRoles } from '../../config/keycloak';
import { LogoutConfirmModal } from '../common';
import { userApi } from '../../services/api';
import styles from './Profile.module.css';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  name: string;
  given_name: string;
  family_name: string;
  email_verified: boolean;
}

interface UserStats {
  outfitsGenerated: number;
  outfitsRated: number;
  arenaSubmissions: number;
  favoriteOutfits: number;
}

export const Profile: React.FC = () => {
  const { keycloak, logout } = useKeycloak();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [stats, setStats] = useState<UserStats>({
    outfitsGenerated: 0,
    outfitsRated: 0,
    arenaSubmissions: 0,
    favoriteOutfits: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    arenaNotifications: true,
    styleRecommendations: true,
  });

  useEffect(() => {
    loadUserProfile();
    loadUserStats();
  }, []);

  const loadUserProfile = () => {
    try {
      const profile = getUserInfo();
      const roles = getUserRoles();

      if (profile) {
        setUserProfile(profile as UserProfile);
        setUserRoles(roles);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to load user profile:', error);
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const statsData = await userApi.getUserStats();

      setStats({
        outfitsGenerated: statsData.outfits_generated,
        outfitsRated: statsData.outfits_rated,
        arenaSubmissions: statsData.arena_submissions,
        favoriteOutfits: statsData.favorite_outfits,
      });
    } catch (error) {
      console.error('Failed to load user stats:', error);
      // Keep default zeros if API fails
      setStats({
        outfitsGenerated: 0,
        outfitsRated: 0,
        arenaSubmissions: 0,
        favoriteOutfits: 0,
      });
    }
  };

  const getInitials = (name: string): string => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Unused function - kept for future use
  // const formatDate = (timestamp?: number): string => {
  //   if (!timestamp) return 'N/A';
  //   return new Date(timestamp * 1000).toLocaleDateString('en-US', {
  //     year: 'numeric',
  //     month: 'long',
  //     day: 'numeric',
  //   });
  // };

  const handleEditProfile = () => {
    // Redirect to Keycloak account management
    const accountUrl = `${keycloak?.authServerUrl}/realms/${keycloak?.realm}/account`;
    window.open(accountUrl, '_blank');
  };

  const handleChangePassword = () => {
    // Redirect to Keycloak password change
    const passwordUrl = `${keycloak?.authServerUrl}/realms/${keycloak?.realm}/account/password`;
    window.open(passwordUrl, '_blank');
  };

  const handleManageSessions = () => {
    // Redirect to Keycloak sessions management
    const sessionsUrl = `${keycloak?.authServerUrl}/realms/${keycloak?.realm}/account/sessions`;
    window.open(sessionsUrl, '_blank');
  };

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
    // TODO: Save to backend
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    logout();
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading profile...</div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <div className={styles.errorTitle}>Profile Not Found</div>
          <div className={styles.errorMessage}>
            Unable to load your profile. Please try logging in again.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>My Profile</h1>
        <p className={styles.subtitle}>
          Manage your account settings and preferences
        </p>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>✨</div>
          <div className={styles.statValue}>{stats.outfitsGenerated}</div>
          <div className={styles.statLabel}>Outfits Generated</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>⭐</div>
          <div className={styles.statValue}>{stats.outfitsRated}</div>
          <div className={styles.statLabel}>Outfits Rated</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🏆</div>
          <div className={styles.statValue}>{stats.arenaSubmissions}</div>
          <div className={styles.statLabel}>Arena Submissions</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>❤️</div>
          <div className={styles.statValue}>{stats.favoriteOutfits}</div>
          <div className={styles.statLabel}>Favorite Outfits</div>
        </div>
      </div>

      {/* Main Grid */}
      <div className={styles.grid}>
        {/* Profile Card */}
        <div className={styles.profileCard}>
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>
              {getInitials(userProfile.name || userProfile.username)}
            </div>
            <div className={styles.userName}>
              {userProfile.name || userProfile.username}
            </div>
            <div className={styles.userEmail}>{userProfile.email}</div>
            {userProfile.email_verified && (
              <div className={styles.verifiedBadge}>
                ✓ Verified
              </div>
            )}
          </div>

          {userRoles.length > 0 && (
            <div className={styles.roles}>
              <div className={styles.rolesTitle}>Roles</div>
              <div className={styles.rolesList}>
                {userRoles
                  .filter(role => !role.startsWith('default-') && !role.startsWith('offline_') && !role.startsWith('uma_'))
                  .map(role => (
                    <span
                      key={role}
                      className={`${styles.roleBadge} ${styles[role.toLowerCase()]}`}
                    >
                      {role}
                    </span>
                  ))}
              </div>
            </div>
          )}

          <div className={styles.actions}>
            <button
              className={`${styles.actionButton} ${styles.primary}`}
              onClick={handleEditProfile}
            >
              ✏️ Edit Profile
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div className={styles.infoCard}>
          <h2 className={styles.sectionTitle}>
            👤 Account Information
          </h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Username</div>
              <div className={styles.infoValue}>
                {userProfile.username || 'Not set'}
              </div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Email</div>
              <div className={styles.infoValue}>{userProfile.email}</div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>First Name</div>
              <div className={styles.infoValue}>
                {userProfile.given_name || (
                  <span className={styles.empty}>Not set</span>
                )}
              </div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Last Name</div>
              <div className={styles.infoValue}>
                {userProfile.family_name || (
                  <span className={styles.empty}>Not set</span>
                )}
              </div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>User ID</div>
              <div className={styles.infoValue}>
                {userProfile.id.substring(0, 8)}...
              </div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Email Status</div>
              <div className={styles.infoValue}>
                {userProfile.email_verified ? (
                  <span style={{ color: '#10b981' }}>✓ Verified</span>
                ) : (
                  <span style={{ color: '#f59e0b' }}>⚠ Not Verified</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className={styles.preferencesCard}>
        <h2 className={styles.sectionTitle}>
          ⚙️ Preferences
        </h2>
        <div className={styles.preferencesList}>
          <div className={styles.preferenceItem}>
            <div>
              <div className={styles.preferenceLabel}>Email Notifications</div>
              <div className={styles.preferenceDescription}>
                Receive email updates about your outfits and activity
              </div>
            </div>
            <div
              className={`${styles.toggle} ${preferences.emailNotifications ? styles.active : ''}`}
              onClick={() => togglePreference('emailNotifications')}
            >
              <div className={styles.toggleHandle}></div>
            </div>
          </div>
          <div className={styles.preferenceItem}>
            <div>
              <div className={styles.preferenceLabel}>Arena Notifications</div>
              <div className={styles.preferenceDescription}>
                Get notified when your outfits receive votes or comments
              </div>
            </div>
            <div
              className={`${styles.toggle} ${preferences.arenaNotifications ? styles.active : ''}`}
              onClick={() => togglePreference('arenaNotifications')}
            >
              <div className={styles.toggleHandle}></div>
            </div>
          </div>
          <div className={styles.preferenceItem}>
            <div>
              <div className={styles.preferenceLabel}>Style Recommendations</div>
              <div className={styles.preferenceDescription}>
                Receive personalized outfit suggestions based on your style
              </div>
            </div>
            <div
              className={`${styles.toggle} ${preferences.styleRecommendations ? styles.active : ''}`}
              onClick={() => togglePreference('styleRecommendations')}
            >
              <div className={styles.toggleHandle}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className={styles.accountSection}>
        <h2 className={styles.sectionTitle}>
          🔐 Account Security
        </h2>
        <div className={styles.accountActions}>
          <div className={styles.accountAction} onClick={handleChangePassword}>
            <div className={styles.accountActionInfo}>
              <div className={styles.accountActionIcon}>🔑</div>
              <div>
                <div className={styles.accountActionTitle}>Change Password</div>
                <div className={styles.accountActionDesc}>
                  Update your password to keep your account secure
                </div>
              </div>
            </div>
            <div>→</div>
          </div>
          <div className={styles.accountAction} onClick={handleManageSessions}>
            <div className={styles.accountActionInfo}>
              <div className={styles.accountActionIcon}>📱</div>
              <div>
                <div className={styles.accountActionTitle}>Manage Sessions</div>
                <div className={styles.accountActionDesc}>
                  View and manage your active login sessions
                </div>
              </div>
            </div>
            <div>→</div>
          </div>
          <div className={styles.accountAction} onClick={handleEditProfile}>
            <div className={styles.accountActionInfo}>
              <div className={styles.accountActionIcon}>👤</div>
              <div>
                <div className={styles.accountActionTitle}>Account Settings</div>
                <div className={styles.accountActionDesc}>
                  Manage your Keycloak account settings
                </div>
              </div>
            </div>
            <div>→</div>
          </div>
        </div>

        {/* Danger Zone - Logout */}
        <div className={styles.dangerZone}>
          <div className={styles.dangerTitle}>Sign Out</div>
          <div className={styles.dangerDescription}>
            Sign out of your account. You can sign back in anytime.
          </div>
          <button className={styles.dangerButton} onClick={handleLogoutClick}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />
    </div>
  );
};
