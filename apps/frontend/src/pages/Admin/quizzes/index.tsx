import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Popconfirm, message } from 'antd';
import { Spin } from 'antd';
import { api } from '@/services/api';
import AdminPageHeader from '../_components/AdminPageHeader';
import styles from '../users/index.less';

const adminQuizService = {
  getAll: (params?: { search?: string; page?: number }) =>
    api.get('/admin/quizzes', { params }).then(r => r.data),

  delete: (id: string) =>
    api.delete(`/admin/quizzes/${id}`).then(r => r.data),

  getAttempts: (quizId: string) =>
    api.get(`/admin/quizzes/${quizId}/attempts`).then(r => r.data),
};

const AdminQuizzesPage: React.FC = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-quizzes', search],
    queryFn: () => adminQuizService.getAll({ search: search || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: adminQuizService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-quizzes'] });
      message.success('Quiz deleted');
    },
    onError: () => message.error('Delete failed'),
  });

  const quizzes = data?.quizzes ?? data ?? [];
  const total   = data?.total ?? quizzes.length;

  const getAvgColor = (pct: number) => {
    if (pct >= 75) return styles.green;
    if (pct >= 55) return styles.warn;
    return styles.danger;
  };

  return (
    <div>
      <AdminPageHeader
        title="Quizzes"
        sub={`${total} quizzes across all users`}
      />

      <div className={styles.body}>
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>⌕</span>
            <input
              className={styles.searchInp}
              placeholder="Search by title or owner…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.tableWrap}>
          {isLoading ? (
            <div className={styles.loading}><Spin /></div>
          ) : (
            <>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Owner</th>
                    <th>Questions</th>
                    <th>Attempts</th>
                    <th>Avg score</th>
                    <th>Created</th>
                    <th style={{ width: 60 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {quizzes.map((q: any) => {
                    const avgPct = q._count?.attempts > 0
                      ? Math.round(
                          (q.attempts?.reduce((s: number, a: any) =>
                            s + (a.score / a.totalQ) * 100, 0) ?? 0)
                          / (q._count?.attempts ?? 1),
                        )
                      : null;

                    return (
                      <tr key={q.id}>
                        <td style={{ fontWeight: 500 }}>{q.title}</td>
                        <td className={styles.muted} style={{ fontSize: 11 }}>
                          {q.user?.email ?? '—'}
                        </td>
                        <td className={styles.num}>{q._count?.questions ?? 0}</td>
                        <td className={styles.num}>{q._count?.attempts ?? 0}</td>
                        <td>
                          {avgPct !== null ? (
                            <span className={`${styles.num} ${getAvgColor(avgPct)}`}>
                              {avgPct}%
                            </span>
                          ) : (
                            <span className={styles.muted}>—</span>
                          )}
                        </td>
                        <td className={styles.muted} style={{ fontSize: 11 }}>
                          {new Date(q.createdAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                          })}
                        </td>
                        <td>
                          <div className={styles.rowActions}>
                            <Popconfirm
                              title="Delete this quiz and all attempts?"
                              onConfirm={() => deleteMutation.mutate(q.id)}
                              okText="Delete"
                              cancelText="Cancel"
                              okButtonProps={{ danger: true }}
                            >
                              <button
                                className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                                title="Delete"
                              >
                                ⌫
                              </button>
                            </Popconfirm>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {!quizzes.length && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', color: '#4A4A50', padding: '32px 0' }}>
                        No quizzes found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminQuizzesPage;
