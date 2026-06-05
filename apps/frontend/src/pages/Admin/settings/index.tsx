import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { message } from 'antd';
import { api } from '@/services/api';
import AdminPageHeader from '../_components/AdminPageHeader';
import styles from './index.less';

const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    platformName: 'English Learning Platform',
    supportEmail: 'support@elp.dev',
    maxFreeSets: 3,
    maxFreeCards: 50,
    maxFreeAiMessages: 10,
    maintenanceMode: false,
  });

  const saveMutation = useMutation({
    mutationFn: () => api.post('/admin/settings', settings),
    onSuccess: () => message.success('Settings saved'),
    onError: () => message.error('Save failed'),
  });

  const sendStreakReminders = useMutation({
    mutationFn: () => api.post('/admin/notifications/streak-reminders'),
    onSuccess: (data: any) => message.success(`Sent to ${data?.data?.count ?? 0} users`),
  });

  return (
    <div>
      <AdminPageHeader
        title="Settings"
        sub="Platform configuration"
        actions={
          <button
            className={styles.btnPrimary}
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
          >
            Save settings
          </button>
        }
      />

      <div className={styles.body}>
        <div className={styles.twoCol}>
          {/* Site config */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>Site settings</div>
            <div className={styles.fields}>
              <div className={styles.field}>
                <label className={styles.label}>Platform name</label>
                <input
                  className={styles.inp}
                  value={settings.platformName}
                  onChange={e => setSettings(s => ({ ...s, platformName: e.target.value }))}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Support email</label>
                <input
                  className={styles.inp}
                  value={settings.supportEmail}
                  onChange={e => setSettings(s => ({ ...s, supportEmail: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Plan limits */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>Free plan limits</div>
            <div className={styles.fields}>
              {[
                { label: 'Max sets', key: 'maxFreeSets' },
                { label: 'Max cards per set', key: 'maxFreeCards' },
                { label: 'AI messages per day', key: 'maxFreeAiMessages' },
              ].map(f => (
                <div key={f.key} className={styles.field}>
                  <label className={styles.label}>{f.label}</label>
                  <input
                    className={styles.inp}
                    type="number"
                    value={(settings as any)[f.key]}
                    onChange={e => setSettings(s => ({ ...s, [f.key]: parseInt(e.target.value) }))}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Maintenance actions */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>Maintenance & operations</div>
          <div className={styles.actionList}>
            <div className={styles.actionRow}>
              <div>
                <div className={styles.actionLabel}>Maintenance mode</div>
                <div className={styles.actionSub}>Block all non-admin access to the platform</div>
              </div>
              <button
                className={`${styles.toggleBtn} ${settings.maintenanceMode ? styles.toggleBtnOn : ''}`}
                onClick={() => setSettings(s => ({ ...s, maintenanceMode: !s.maintenanceMode }))}
              >
                {settings.maintenanceMode ? 'On' : 'Off'}
              </button>
            </div>

            <div className={styles.actionRow}>
              <div>
                <div className={styles.actionLabel}>Send streak reminders</div>
                <div className={styles.actionSub}>Notify users who haven't studied today</div>
              </div>
              <button
                className={styles.actionBtn}
                onClick={() => sendStreakReminders.mutate()}
                disabled={sendStreakReminders.isPending}
              >
                {sendStreakReminders.isPending ? 'Sending…' : 'Send now'}
              </button>
            </div>

            <div className={styles.actionRow}>
              <div>
                <div className={styles.actionLabel}>Export full report</div>
                <div className={styles.actionSub}>Download all user data and analytics as Excel</div>
              </div>
              <button
                className={styles.actionBtn}
                onClick={() => window.open(`${process.env.API_URL ?? 'http://localhost:3000'}/export/admin-report`)}
              >
                Export
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
