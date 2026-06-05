import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Popconfirm, message, Modal } from 'antd';
import { api } from '@/services/api';
import AdminPageHeader from '../_components/AdminPageHeader';
import styles from '../users/index.less'; // reuse same table styles

const adminCourseService = {
  getAll: () => api.get('/courses?admin=true').then(r => r.data),
  create: (data: any) => api.post('/courses', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/courses/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/courses/${id}`).then(r => r.data),
  togglePublish: (id: string) => api.post(`/courses/${id}/publish`).then(r => r.data),
};

const LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

const AdminCoursesPage: React.FC = () => {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', level: 'BEGINNER', emoji: '📖', published: false });

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: adminCourseService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: adminCourseService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-courses'] }); message.success('Course created'); setShowModal(false); },
  });

  const publishMutation = useMutation({
    mutationFn: adminCourseService.togglePublish,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-courses'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: adminCourseService.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-courses'] }); message.success('Deleted'); },
  });

  return (
    <div>
      <AdminPageHeader
        title="Courses"
        sub={`${(courses as any[]).length} courses`}
        actions={<button className={styles.btnPrimary} onClick={() => setShowModal(true)}>+ New course</button>}
      />

      <div className={styles.body}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr><th>Course</th><th>Level</th><th>Lessons</th><th>Enrolled</th><th>Status</th><th style={{ width: 110 }}></th></tr>
            </thead>
            <tbody>
              {(courses as any[]).map((c: any) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 18 }}>{c.emoji}</span>
                      <span style={{ fontWeight: 500 }}>{c.title}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${c.level === 'BEGINNER' ? styles.badgeGreen : c.level === 'INTERMEDIATE' ? styles.badgeAccent : styles.badgeDanger}`}>
                      {c.level}
                    </span>
                  </td>
                  <td className={styles.num}>{c._count?.lessons ?? 0}</td>
                  <td className={styles.num}>{c._count?.enrollments ?? 0}</td>
                  <td>
                    <span className={`${styles.badge} ${c.published ? styles.badgeGreen : styles.badgeNeutral}`}>
                      {c.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <button
                        className={styles.iconBtn}
                        onClick={() => publishMutation.mutate(c.id)}
                        title={c.published ? 'Unpublish' : 'Publish'}
                      >
                        {c.published ? '⊙' : '▶'}
                      </button>
                      <Popconfirm title="Delete course?" onConfirm={() => deleteMutation.mutate(c.id)} okText="Delete" cancelText="Cancel" okButtonProps={{ danger: true }}>
                        <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`}>⌫</button>
                      </Popconfirm>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={showModal}
        onCancel={() => setShowModal(false)}
        title="New course"
        footer={null}
        styles={{ content: { background: '#141416' }, header: { background: '#141416', borderBottom: '1px solid rgba(255,255,255,.08)' } }}
      >
        <div className={styles.modalBody}>
          <div className={styles.field}>
            <label className={styles.label}>Title</label>
            <input className={styles.inp} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Course title" />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <input className={styles.inp} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description" />
          </div>
          <div className={styles.twoCol}>
            <div className={styles.field}>
              <label className={styles.label}>Level</label>
              <select className={styles.inp} value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))}>
                {LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Emoji</label>
              <input className={styles.inp} value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} maxLength={2} />
            </div>
          </div>
          <div className={styles.modalFoot}>
            <button className={styles.btnSecondary} onClick={() => setShowModal(false)}>Cancel</button>
            <button className={styles.btnPrimary} onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending}>Create</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminCoursesPage;
