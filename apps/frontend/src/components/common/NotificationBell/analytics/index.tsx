import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Spin } from 'antd';
import { adminService } from '@/services/admin.service';
import styles from './index.less';

const AdminAnalyticsPage: React.FC = () => {
    const { data: overview, isLoading } = useQuery({
        queryKey: ['admin-analytics'],
        queryFn: adminService.getAnalyticsOverview,
        staleTime: 60_000,
    });

    const { data: topUsers } = useQuery({
        queryKey: ['admin-top-users'],
        queryFn: () => adminService.getTopUsers(10),
    });

    const { data: revenueChart } = useQuery({
        queryKey: ['admin-revenue'],
        queryFn: () => adminService.getRevenueChart(30),
    });

    if (isLoading) return <div className={styles.centered}><Spin /></div>;

    const maxRevenue = Math.max(...(revenueChart ?? []).map((r: any) => r.amount), 1);
    const maxSignups = Math.max(...(overview?.charts?.dailySignups ?? []).map((r: any) => r.count), 1);

    return (
        <div className={styles.pg}>
            <div className={styles.top}>
                <div>
                    <h1 className={styles.title}>Admin Analytics</h1>
                    <p className={styles.sub}>Platform overview · last 30 days</p>
                </div>
                <div className={styles.actions}>
                    <button className={styles.btnSecondary} onClick={adminService.exportVocabulary}>
                        ↓ Export vocabulary
                    </button>
                    <button className={styles.btnPrimary} onClick={adminService.exportAdminReport}>
                        ↓ Full report
                    </button>
                </div>
            </div>

            {/* KPI grid */}
            <div className={styles.kpiGrid}>
                {[
                    { label: 'Total users', val: overview?.users.total ?? 0, delta: `+${overview?.users.newThisWeek ?? 0} this week`, color: '' },
                    { label: 'Pro subscribers', val: overview?.users.pro ?? 0, color: 'accent' },
                    { label: 'MRR', val: `$${overview?.revenue.mrr ?? 0}`, color: 'green' },
                    { label: 'Revenue 30d', val: `$${overview?.revenue.last30d ?? 0}`, color: 'green' },
                    { label: 'Cards studied', val: overview?.content.studyRecords30d ?? 0, color: '' },
                    { label: 'Quiz attempts', val: overview?.content.quizAttempts30d ?? 0, color: '' },
                    { label: 'Total revenue', val: `$${overview?.revenue.total ?? 0}`, color: 'accent' },
                    { label: 'Free users', val: overview?.users.free ?? 0, color: '' },
                ].map(k => (
                    <div key={k.label} className={styles.kpi}>
                        <div className={styles.kpiLabel}>{k.label}</div>
                        <div className={`${styles.kpiVal} ${k.color ? styles[k.color] : ''}`}>{k.val}</div>
                        {k.delta && <div className={styles.kpiDelta}>{k.delta}</div>}
                    </div>
                ))}
            </div>

            <div className={styles.chartRow}>
                {/* Revenue chart */}
                <div className={styles.card}>
                    <div className={styles.cardHead}>
                        <span className={styles.cardTitle}>Daily revenue — last 30 days</span>
                    </div>
                    <div className={styles.barChart}>
                        {(revenueChart ?? []).map((r: any, i: number) => (
                            <div key={i} className={styles.barCol}>
                                <div
                                    className={styles.barFill}
                                    style={{ height: `${(r.amount / maxRevenue) * 80}px` }}
                                    title={`$${r.amount} on ${r.date}`}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Signups chart */}
                <div className={styles.card}>
                    <div className={styles.cardHead}>
                        <span className={styles.cardTitle}>Daily signups — last 14 days</span>
                    </div>
                    <div className={styles.barChart}>
                        {(overview?.charts?.dailySignups ?? []).map((r: any, i: number) => (
                            <div key={i} className={styles.barCol}>
                                <div
                                    className={`${styles.barFill} ${styles.barFillPurple}`}
                                    style={{ height: `${(r.count / maxSignups) * 80}px` }}
                                    title={`${r.count} signups on ${r.date}`}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Plan breakdown */}
            <div className={styles.card}>
                <div className={styles.cardHead}>
                    <span className={styles.cardTitle}>Plan distribution</span>
                </div>
                <div className={styles.planBreakdown}>
                    {[
                        { label: 'Free', val: overview?.users.free ?? 0, cls: styles.barNeutral },
                        { label: 'Pro', val: overview?.users.pro ?? 0, cls: styles.barAccent },
                        { label: 'Team', val: overview?.users.team ?? 0, cls: styles.barGreen },
                    ].map(p => {
                        const total = overview?.users.total ?? 1;
                        const pct = Math.round((p.val / total) * 100);
                        return (
                            <div key={p.label} className={styles.planRow}>
                                <div className={styles.planLabel}>{p.label}</div>
                                <div className={styles.planBar}>
                                    <div className={`${styles.planBarFill} ${p.cls}`} style={{ width: `${pct}%` }} />
                                </div>
                                <div className={styles.planStat}>{p.val} users <span className={styles.muted}>({pct}%)</span></div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Top users table */}
            {(topUsers ?? []).length > 0 && (
                <div className={styles.card}>
                    <div className={styles.cardHead}>
                        <span className={styles.cardTitle}>Top users by activity</span>
                    </div>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Email</th>
                                <th>Plan</th>
                                <th>Sets</th>
                                <th>Study records</th>
                                <th>Quizzes</th>
                                <th>Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(topUsers ?? []).map((u: any, i: number) => (
                                <tr key={i}>
                                    <td>{u.email}</td>
                                    <td>
                                        <span className={`${styles.badge} ${u.plan === 'PRO' ? styles.badgeAccent : u.plan === 'TEAM' ? styles.badgeGreen : styles.badgeNeutral}`}>
                                            {u.plan}
                                        </span>
                                    </td>
                                    <td className={styles.num}>{u.sets}</td>
                                    <td className={styles.num}>{u.studyRecords}</td>
                                    <td className={styles.num}>{u.quizzes}</td>
                                    <td className={styles.muted}>
                                        {new Date(u.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminAnalyticsPage;