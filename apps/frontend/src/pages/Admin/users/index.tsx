import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, message, Popconfirm } from 'antd';
import { Spin } from 'antd';
import { api } from '@/services/api';
import AdminPageHeader from '../_components/AdminPageHeader';
import styles from './index.less';

// Admin user service
const adminUserService = {
  getUsers: (params?: { search?: string; plan?: string; page?: number }) =>
    api.get('/admin/users', { params }).then(r => r.data),

  createUser: (data: any) =>
    api.post('/admin/users', data).then(r => r.data),

  updateUser: (id: string, data: any) =>
    api.put(`/admin/users/${id}`, data).then(r => r.data),

  deleteUser: (id: string) =>
    api.delete(`/admin/users/${id}`).then(r => r.data),

  banUser: (id: string) =>
    api.post(`/admin/users/${id}/ban`).then(r => r.data),

  unbanUser: (id: string) =>
    api.post(`/admin/users/${id}/unban`).then(r => r.data),

  impersonate: (id: string) =>
    api.post(`/admin/users/${id}/impersonate`).then(r => r.data),
};

const PLAN_FILTERS = ['ALL', 'FREE', 'PRO', 'TEAM'];

const AdminUsersPage: React.FC = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [form, setForm] = useState({ email: '', password: '', role: 'USER', plan: 'FREE' });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, planFilter],
    queryFn: () => adminUserService.getUsers({
      search: search || undefined,
      plan: planFilter === 'ALL' ? undefined : planFilter,
    }),
  });

  const createMutation = useMutation({
    mutationFn: adminUserService.createUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      message.success('User created');
      setShowModal(false);
      setForm({ email: '', password: '', role: 'USER', plan: 'FREE' });
    },
    onError: () => message.error('Failed to create user'),
  });

  const banMutation = useMutation({
    mutationFn: ({ id, banned }: { id: string; banned: boolean }) =>
      banned ? adminUserService.unbanUser(id) : adminUserService.banUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: adminUserService.deleteUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      message.success('User deleted');
    },
  });

  const users = data?.users ?? data ?? [];

  return (
    <div>
      <AdminPageHeader
        title="Users"
        sub={`${data?.total ?? users.length} total users`}
        actions={
          <button className={styles.btnPrimary} onClick={() => setShowModal(true)}>
            + Add user
          </button>
        }
      />

      <div className={styles.body}>
        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>⌕</span>
            <input
              className={styles.searchInp}
              placeholder="Search by email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.filters}>
            {PLAN_FILTERS.map(f => (
              <button
                key={f}
                className={`${styles.filter} ${planFilter === f ? styles.filterOn : ''}`}
                onClick={() => setPlanFilter(f)}
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
                  <th><input type="checkbox" style={{ accentColor: '#E8FF57' }} /></th>
                  <th>User</th>
                  <th>Role</th>
                  <th>Plan</th>
                  <th>Sets</th>
                  <th>Last active</th>
                  <th>Status</th>
                  <th style={{ width: 100 }}></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u: any) => (
                  <tr key={u.id}>
                    <td><input type="checkbox" style={{ accentColor: '#E8FF57' }} /></td>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.avatar}>
                          {u.email[0].toUpperCase()}
                        </div>
                        <div>
                          <div className={styles.userEmail}>{u.email}</div>
                          <div className={styles.userId}>#{u.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${u.roles?.some((r: any) => r.name === 'ADMIN' || r === 'ADMIN') ? styles.badgeDanger : styles.badgeNeutral}`}>
                        {u.roles?.some((r: any) => r.name === 'ADMIN' || r === 'ADMIN') ? 'ADMIN' : 'USER'}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${
                        u.subscription?.plan === 'PRO'  ? styles.badgeAccent :
                        u.subscription?.plan === 'TEAM' ? styles.badgeGreen  : styles.badgeNeutral
                      }`}>
                        {u.subscription?.plan ?? 'FREE'}
                      </span>
                    </td>
                    <td className={styles.num}>{u._count?.flashcardSets ?? 0}</td>
                    <td className={styles.muted}>—</td>
                    <td>
                      <span className={`${styles.badge} ${u.banned ? styles.badgeDanger : styles.badgeGreen}`}>
                        {u.banned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.rowActions}>
                        <button
                          className={styles.iconBtn}
                          title="Edit"
                          onClick={() => { setEditUser(u); setForm({ email: u.email, password: '', role: 'USER', plan: u.subscription?.plan ?? 'FREE' }); setShowModal(true); }}
                        >
                          ✎
                        </button>
                        <Popconfirm
                          title={u.banned ? 'Unban this user?' : 'Ban this user?'}
                          onConfirm={() => banMutation.mutate({ id: u.id, banned: u.banned })}
                          okText="Yes" cancelText="No"
                        >
                          <button className={`${styles.iconBtn} ${u.banned ? '' : styles.iconBtnWarn}`} title={u.banned ? 'Unban' : 'Ban'}>
                            {u.banned ? '✓' : '⊘'}
                          </button>
                        </Popconfirm>
                        <Popconfirm
                          title="Delete user permanently?"
                          onConfirm={() => deleteMutation.mutate(u.id)}
                          okText="Delete" cancelText="Cancel"
                          okButtonProps={{ danger: true }}
                        >
                          <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} title="Delete">⌫</button>
                        </Popconfirm>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal
        open={showModal}
        onCancel={() => { setShowModal(false); setEditUser(null); }}
        title={editUser ? `Edit · ${editUser.email}` : 'Add user'}
        footer={null}
        styles={{ content: { background: '#141416', border: '1px solid rgba(255,255,255,.1)' }, header: { background: '#141416', borderBottom: '1px solid rgba(255,255,255,.08)' } }}
      >
        <div className={styles.modalBody}>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              className={styles.inp}
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="user@example.com"
            />
          </div>
          {!editUser && (
            <div className={styles.field}>
              <label className={styles.label}>Password</label>
              <input
                className={styles.inp}
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Min. 8 characters"
              />
            </div>
          )}
          <div className={styles.twoCol}>
            <div className={styles.field}>
              <label className={styles.label}>Role</label>
              <select className={styles.inp} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Plan</label>
              <select className={styles.inp} value={form.plan} onChange={e => setForm(f => ({ ...f, plan: e.target.value }))}>
                <option value="FREE">FREE</option>
                <option value="PRO">PRO</option>
                <option value="TEAM">TEAM</option>
              </select>
            </div>
          </div>
          <div className={styles.modalFoot}>
            <button className={styles.btnSecondary} onClick={() => { setShowModal(false); setEditUser(null); }}>Cancel</button>
            <button
              className={styles.btnPrimary}
              onClick={() => createMutation.mutate(form)}
              disabled={createMutation.isPending}
            >
              {editUser ? 'Save changes' : 'Create user'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminUsersPage;
