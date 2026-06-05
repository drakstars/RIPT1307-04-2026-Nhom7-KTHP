import React, { useRef, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { usePlanStore } from '@/stores/plan.store';
import styles from './index.less';

interface ProfileDropdownProps {
  onClose: () => void;
  onEditProfile: () => void;
  onOpenSettings: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  onClose,
  onEditProfile,
  onOpenSettings,
}) => {
  const { user, logout } = useAuthStore();
  const { plan } = usePlanStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [onClose]);

  const handleLogout = async () => {
    await logout();
    onClose();
    window.location.href = '/login';
  };

  const handleBillingRedirect = () => {
    onClose();
    window.location.href = '/settings/billing';
  };

  if (!user) return null;

  const isPro = plan === 'PRO' || plan === 'TEAM';
  const emailName = user.email.split('@')[0];
  const userDisplayName = user.fullName || emailName;

  return (
    <div className={styles.dropdown} ref={dropdownRef}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.userDetails}>
          <div className={styles.userNameRow}>
            <span className={styles.name}>{userDisplayName}</span>
            <span className={`${styles.badge} ${isPro ? styles.badgePro : styles.badgeFree}`}>
              {isPro ? 'Pro' : 'Free'}
            </span>
          </div>
          <span className={styles.email}>{user.email}</span>
        </div>
      </div>

      <div className={styles.divider} />

      {/* Menu Options */}
      <div className={styles.menu}>
        <button
          className={styles.menuItem}
          onClick={() => {
            onEditProfile();
            onClose();
          }}
        >
          Chỉnh sửa hồ sơ
        </button>
        <button className={styles.menuItem} onClick={handleBillingRedirect}>
          Thanh toán & Gói dịch vụ
        </button>
        <button
          className={styles.menuItem}
          onClick={() => {
            onOpenSettings();
            onClose();
          }}
        >
          Cài đặt
        </button>

        <div className={styles.menuDivider} />

        <button className={`${styles.menuItem} ${styles.signOut}`} onClick={handleLogout}>
          Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default ProfileDropdown;
