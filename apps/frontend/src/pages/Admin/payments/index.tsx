import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Spin } from 'antd';
import { api } from '@/services/api';
import AdminPageHeader from '../_components/AdminPageHeader';
import styles from '../users/index.less';

const adminPaymentService = {
  getAll: (params?: { search?: string; status?: string; page?: number }) =>
    api.get('/admin/payments', { params }).then(r => r.data),
};

const STATUS_FILTERS = ['ALL', 'SUCCESS', 'FAILED', 'REFUNDED'];

const AdminPaymentsPage: React.FC = () => {
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('ALL');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-payments', search, statusFilter],
    queryFn: () => adminPaymentService.getAll({
      search:  search || undefined,
      status:  statusFilter === 'ALL' ? undefined : statusFilter,
    }),
  });

  const payments = data?.payments ?? data ?? [];
  const total    = data?.total    ?? payments.length;

  const totalRevenue = payments
    .filter((p: any) => p.status === 'SUCCESS')
    .reduce((s: number, p: any) => s + p.amount, 0);

  const statusCls: Record<string, string> = {
    SUCCESS:  styles.badgeGreen,
    FAILED:   styles.badgeDanger,
    REFUNDED: styles.badgeNeutral,
    PENDING:  styles.badgeNeutral,
  };

  const planCls: Record<string, string> = {
    PRO:  styles.badgeAccent,
    TEAM: styles.badgeGreen,
    FREE: styles.badgeNeutral,
  };

  const formatAmount = (amount: number, currency = 'USD') =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

  return (
    <div>
      <AdminPageHeader
        title="Payments"
        sub={`${total} transactions · ${formatAmount(totalRevenue)} total`}
        actions={
          <button
            className={styles.btnSecondary}
            onClick={() =>
              window.open(
                `${process.env.API_URL ?? 'http://localhost:3000'}/export/admin-report`,
                '_blank',
              )
            }
          >
            ↓ Export
          </button>
        }
      />

      <div className={styles.body}>
        {/* Summary KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
          {[
            {
              label: 'Total revenue',
              val: formatAmount(
                payments.filter((p: any) => p.status === 'SUCCESS')
                        .reduce((s: number, p: any) => s + p.amount, 0),
              ),
              cls: 'green',
            },
            {
              label: 'Successful',
              val: payments.filter((p: any) => p.status === 'SUCCESS').length,
              cls: 'green',
            },
            {
              label: 'Failed',
              val: payments.filter((p: any) => p.status === 'FAILED').length,
              cls: 'danger',
            },
            {
              label: 'Pro upgrades',
              val: payments.filter((p: any) => p.plan === 'PRO' && p.status === 'SUCCESS').length,
              cls: 'accent',
            },
          ].map(k => (
            <div key={k.label} style={{
              background: '#141416', border: '1px solid rgba(255,255,255,.08)',
              borderRadius: 6, padding: '12px 16px',
            }}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em', color: '#4A4A50', marginBottom: 8 }}>
                {k.label}
              </div>
              <div style={{
                fontSize: 22, fontWeight: 500, lineHeight: 1,
                color: k.cls === 'green' ? '#3ECF8E' : k.cls === 'danger' ? '#FF5B5B' : k.cls === 'accent' ? '#E8FF57' : '#F2F2F2',
              }}>
                {k.val}
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>⌕</span>
            <input
              className={styles.searchInp}
              placeholder="Search by email or reference…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.filters}>
            {STATUS_FILTERS.map(f => (
              <button
                key={f}
                className={`${styles.filter} ${statusFilter === f ? styles.filterOn : ''}`}
                onClick={() => setStatus(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className={styles.tableWrap}>
          {isLoading ? (
            <div className={styles.loading}><Spin /></div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Plan</th>
                  <th>Cycle</th>
                  <th>Amount</th>
                  <th>Reference</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th style={{ width: 60 }}></th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p: any) => (
                  <tr key={p.id}>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.avatar}>
                          {(p.user?.email?.[0] ?? 'U').toUpperCase()}
                        </div>
                        <span>{p.user?.email ?? '—'}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${planCls[p.plan] ?? styles.badgeNeutral}`}>
                        {p.plan}
                      </span>
                    </td>
                    <td className={styles.muted} style={{ textTransform: 'capitalize' }}>
                      {p.billingCycle}
                    </td>
                    <td style={{ fontWeight: 500 }}>
                      {formatAmount(p.amount, p.currency)}
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#4A4A50' }}>
                        {p.reference?.slice(0, 12)}…
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${statusCls[p.status] ?? styles.badgeNeutral}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className={styles.muted} style={{ fontSize: 11 }}>
                      {p.paidAt
                        ? new Date(p.paidAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                          })
                        : new Date(p.createdAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                          })}
                    </td>
                    <td>
                      <div className={styles.rowActions}>
                        {p.status === 'SUCCESS' && (
                          <button
                            className={styles.iconBtn}
                            title="Download receipt"
                            onClick={() => window.open(p.receiptUrl ?? '#', '_blank')}
                          >
                            ↓
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {!payments.length && (
                  <tr>
                    <td
                      colSpan={8}
                      style={{ textAlign: 'center', color: '#4A4A50', padding: '32px 0' }}
                    >
                      No payments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentsPage;
