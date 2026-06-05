import React from 'react';
import { history } from 'umi';
import { useQuery } from '@tanstack/react-query';
import { Spin } from 'antd';
import { adminService } from '@/services/admin.service';
import AdminPageHeader from './_components/AdminPageHeader';
import styles from './index.less';

const AdminDashboardPage: React.FC = () => {
  const { data: overview, isLoading } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: adminService.getAnalyticsOverview,
    staleTime: 60_000,
  });

  const { data: topUsers } = useQuery({
    queryKey: ['admin-top-users'],
    queryFn: () => adminService.getTopUsers(5),
  });

  const { data: revenueChart } = useQuery({
    queryKey: ['admin-revenue-chart'],
    queryFn: () => adminService.getRevenueChart(14),
  });

  if (isLoading) return <div className={styles.centered}><Spin /></div>;

  const maxRev = Math.max(...(revenueChart ?? []).map((r: any) => r.amount), 1);

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        sub="Platform overview"
        actions={
          <>
            <button className={styles.btnSecondary} onClick={adminService.exportAdminReport}>
              ↓ Export report
            </button>
            <button className={styles.btnPrimary} onClick={() => history.push('/admin/users')}>
              Manage users
            </button>
          </>
        }
      />

      <div className={styles.body}>
        {/* KPIs */}
        <div className={styles.kpis}>
          {[
            { label: 'Total users',    val: overview?.users.total ?? 0,         delta: `+${overview?.users.newThisWeek ?? 0} this week` },
            { label: 'Pro users',      val: overview?.users.pro ?? 0,           cls: 'accent' },
            { label: 'MRR',            val: `$${overview?.revenue.mrr ?? 0}`,   cls: 'green' },
            { label: 'Revenue 30d',    val: `$${overview?.revenue.last30d ?? 0}`, cls: 'green' },
            { label: 'Cards studied',  val: overview?.content.studyRecords30d ?? 0 },
            { label: 'Quiz attempts',  val: overview?.content.quizAttempts30d ?? 0 },
            { label: 'Total revenue',  val: `$${overview?.revenue.total ?? 0}`, cls: 'accent' },
            { label: 'Active today',   val: '—' },
          ].map(k => (
            <div key={k.label} className={styles.kpi}>
              <div className={styles.kpiLabel}>{k.label}</div>
              <div className={`${styles.kpiVal} ${(k as any).cls ? styles[(k as any).cls] : ''}`}>
                {k.val}
              </div>
              {(k as any).delta && (
                <div className={styles.kpiDelta}>{(k as any).delta}</div>
              )}
            </div>
          ))}
        </div>

        <div className={styles.charts}>
          {/* Mini bar chart */}
          <div className={styles.chartCard}>
            <div className={styles.chartTitle}>Revenue — last 14 days</div>
            <div className={styles.barChart}>
              {(revenueChart ?? []).map((r: any, i: number) => (
                <div key={i} className={styles.barCol}>
                  <div
                    className={styles.bar}
                    style={{ height: `${Math.max(3, (r.amount / maxRev) * 60)}px` }}
                    title={`$${r.amount} · ${r.date}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Plan breakdown */}
          <div className={styles.chartCard}>
            <div className={styles.chartTitle}>Plan distribution</div>
            <div className={styles.planList}>
              {[
                { label: 'Free',  val: overview?.users.free ?? 0,  color: '#4A4A50' },
                { label: 'Pro',   val: overview?.users.pro ?? 0,   color: '#E8FF57' },
                { label: 'Team',  val: overview?.users.team ?? 0,  color: '#3ECF8E' },
              ].map(p => {
                const total = (overview?.users.total ?? 1);
                const pct = Math.round((p.val / total) * 100);
                return (
                  <div key={p.label} className={styles.planRow}>
                    <span className={styles.planLabel}>{p.label}</span>
                    <div className={styles.planBar}>
                      <div className={styles.planFill} style={{ width: `${pct}%`, background: p.color }} />
                    </div>
                    <span className={styles.planStat}>{p.val} <span className={styles.muted}>({pct}%)</span></span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick nav cards */}
        <div className={styles.quickNav}>
          {[
            { label: 'Users',      count: overview?.users.total ?? 0,  path: '/admin/users',      icon: '○' },
            { label: 'Courses',    count: '—',                          path: '/admin/courses',    icon: '◻' },
            { label: 'Vocabulary', count: '—',                          path: '/admin/vocabulary', icon: '◈' },
            { label: 'Payments',   count: '—',                          path: '/admin/payments',   icon: '◆' },
          ].map(q => (
            <div
              key={q.label}
              className={styles.quickCard}
              onClick={() => history.push(q.path)}
            >
              <span className={styles.quickIcon}>{q.icon}</span>
              <div className={styles.quickLabel}>{q.label}</div>
              <div className={styles.quickCount}>{q.count}</div>
            </div>
          ))}
        </div>

        {/* Recent top users */}
        {(topUsers ?? []).length > 0 && (
          <div className={styles.tableCard}>
            <div className={styles.tableCardHead}>
              <span className={styles.tableCardTitle}>Top users by activity</span>
              <button
                className={styles.seeAll}
                onClick={() => history.push('/admin/users')}
              >
                See all →
              </button>
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Plan</th>
                  <th>Sets</th>
                  <th>Study records</th>
                  <th>Quizzes</th>
                </tr>
              </thead>
              <tbody>
                {(topUsers ?? []).map((u: any, i: number) => (
                  <tr key={i}>
                    <td>{u.email}</td>
                    <td>
                      <span className={`${styles.badge} ${
                        u.plan === 'PRO' ? styles.badgeAccent :
                        u.plan === 'TEAM' ? styles.badgeGreen : styles.badgeNeutral
                      }`}>
                        {u.plan}
                      </span>
                    </td>
                    <td className={styles.num}>{u.sets}</td>
                    <td className={styles.num}>{u.studyRecords}</td>
                    <td className={styles.num}>{u.quizzes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;