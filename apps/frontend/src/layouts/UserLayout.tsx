import React from 'react';
import { useLocation, useNavigate, Outlet } from 'umi';
import { useAuthStore } from '@/stores/auth.store';
import { usePlanStore } from '@/stores/plan.store';
import { paymentService } from '@/services/payment.service';
import NotificationBell from '@/components/common/NotificationBell';
import DictionaryWidget from '@/components/common/DictionaryWidget';
import ProfileDropdown from '@/components/common/ProfileDropdown';
import EditProfileModal from '@/components/common/EditProfileModal';
import SettingsModal from '@/components/common/SettingsModal';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';
import { useTranslation } from '@/hooks/useTranslation';
import styles from './UserLayout.less';

const NAV = [
  { path: '/dashboard',  icon: '◎', key: 'dashboard' as const },
  { path: '/flashcards', icon: '⬡', key: 'flashcards' as const },
  { path: '/quiz',       icon: '◈', key: 'quiz' as const        },
  { path: '/courses',    icon: '◻', key: 'courses' as const     },
  { path: '/dictionary', icon: '⌕', key: 'dictionary' as const  },
  { path: '/chatbot',    icon: '○', key: 'aiTutor' as const     },
  { path: '/games',      icon: '◆', key: 'games' as const       },
  { path: '/typewords',  icon: '⌨', key: 'typeWords' as const   },
];

const UserLayout: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { plan } = usePlanStore();
  const { t } = useTranslation();

  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  const isAdmin = 
    user?.role?.name === 'ADMIN' || 
    user?.role === 'ADMIN' ||
    (user as any)?.roles?.some((r: any) => r.name === 'ADMIN' || r === 'ADMIN');

  const menuItems = [...NAV] as any[];
  if (isAdmin) {
    menuItems.push({ path: '/admin', icon: '▲', key: 'admin' as const });
  }

  React.useEffect(() => {
    if (user) {
      paymentService.getLimits().then(({ plan, limits }) => {
        usePlanStore.getState().setPlan(plan, limits);
      });
    }
  }, [user]);

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <div className={styles.logo}>
            <span className={styles.logoMark}>E</span>
            <span className={styles.logoText}>ELP</span>
          </div>
          <NotificationBell />
        </div>

        <nav className={styles.nav}>
          <div className={styles.navGroup}>
            {menuItems.map((item) => (
              <button
                key={item.path}
                className={`${styles.navItem} ${pathname.startsWith(item.path) ? styles.active : ''} ${item.path === '/admin' ? styles.adminNavItem : ''}`}
                onClick={() => navigate(item.path)}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span>{item.key ? t(item.key) : item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className={styles.sidebarFooter} style={{ position: 'relative' }}>
          {dropdownOpen && (
            <ProfileDropdown
              onClose={() => setDropdownOpen(false)}
              onEditProfile={() => setProfileOpen(true)}
              onOpenSettings={() => setSettingsOpen(true)}
            />
          )}
          <div className={styles.dictWrap}>
            <DictionaryWidget />
          </div>
          <div className={styles.userRow} onClick={() => setDropdownOpen(o => !o)} style={{ cursor: 'pointer' }}>
            <div className={styles.avatar}>
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                user?.email?.[0]?.toUpperCase() ?? 'U'
              )}
            </div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{user?.fullName || user?.email?.split('@')[0]}</div>
              <div className={styles.userRole}>
                {plan.toUpperCase() === 'FREE' ? t('freePlan') : 
                 plan.toUpperCase() === 'PRO' ? t('proPlan') : 
                 plan.toUpperCase() === 'TEAM' ? t('teamPlan') : 
                 `${plan} plan`}
              </div>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={logout}>
            {t('logout')}
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        <div className={styles.topRightHeader}>
          <LanguageSwitcher />
        </div>
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>

      <EditProfileModal open={profileOpen} onCancel={() => setProfileOpen(false)} />
      <SettingsModal open={settingsOpen} onCancel={() => setSettingsOpen(false)} />
    </div>
  );
};

export default UserLayout;