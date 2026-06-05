import React from 'react';
import { useLocation, history, Outlet } from 'umi';
import { useAuthStore } from '@/stores/auth.store';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';
import { useTranslation } from '@/hooks/useTranslation';
import styles from './AdminLayout.less';

const NAV = [
  {
    section: 'Overview',
    items: [
      { path: '/admin', label: 'Dashboard', icon: '◎', exact: true },
    ],
  },
  {
    section: 'Management',
    items: [
      { path: '/admin/users',      label: 'Users',      icon: '○' },
      { path: '/admin/vocabulary', label: 'Vocabulary', icon: '◈' },
      { path: '/admin/courses',    label: 'Courses',    icon: '◻' },
      { path: '/admin/quizzes',    label: 'Quizzes',    icon: '⬡' },
    ],
  },
  {
    section: 'System',
    items: [
      { path: '/admin/payments',  label: 'Payments',  icon: '◆' },
      { path: '/admin/analytics', label: 'Analytics', icon: '▲' },
      { path: '/admin/settings',  label: 'Settings',  icon: '◇' },
    ],
  },
];

const AdminLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();
  const { user, logout } = useAuthStore();
  const { t, language } = useTranslation();

  const isActive = (path: string, exact = false) =>
    exact ? pathname === path : pathname.startsWith(path);

  // Admin translations
  const translateGroupSection = (section: string) => {
    if (language === 'vi') {
      if (section === 'Overview') return 'Tổng quan';
      if (section === 'Management') return 'Quản lý';
      if (section === 'System') return 'Hệ thống';
    }
    return section;
  };

  const translateItemLabel = (label: string) => {
    if (language === 'vi') {
      if (label === 'Dashboard') return 'Bảng điều khiển';
      if (label === 'Users') return 'Người dùng';
      if (label === 'Vocabulary') return 'Từ vựng';
      if (label === 'Courses') return 'Khóa học';
      if (label === 'Quizzes') return 'Trắc nghiệm';
      if (label === 'Payments') return 'Thanh toán';
      if (label === 'Analytics') return 'Thống kê';
      if (label === 'Settings') return 'Cấu hình';
    }
    return label;
  };

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <span className={styles.logoMark}>A</span>
          <span className={styles.logoText}>
            ELP <span className={styles.adminTag}>Admin</span>
          </span>
        </div>

        <nav className={styles.nav}>
          {NAV.map(group => (
            <div key={group.section}>
              <div className={styles.navSection}>{translateGroupSection(group.section)}</div>
              {group.items.map(item => (
                <button
                  key={item.path}
                  className={`${styles.navItem} ${isActive(item.path, item.exact) ? styles.navItemOn : ''}`}
                  onClick={() => history.push(item.path)}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  <span>{translateItemLabel(item.label)}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className={styles.footer}>
          <div className={styles.footerUser}>
            <div className={styles.avatar}>
              {user?.email?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className={styles.footerInfo}>
              <div className={styles.footerEmail}>{user?.email?.split('@')[0]}</div>
              <div className={styles.footerRole}>Administrator</div>
            </div>
          </div>
          <div className={styles.footerActions}>
            <button
              className={styles.backBtn}
              onClick={() => history.push('/dashboard')}
            >
              ← App
            </button>
            <button className={styles.logoutBtn} onClick={logout}>
              {t('logout')}
            </button>
          </div>
        </div>
      </aside>

      <main className={styles.main}>
        <div className={styles.topRightHeader}>
          <LanguageSwitcher />
        </div>
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default AdminLayout;