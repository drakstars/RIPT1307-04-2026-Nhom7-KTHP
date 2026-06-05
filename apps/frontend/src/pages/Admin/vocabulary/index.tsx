import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Popconfirm, message, Modal } from 'antd';
import { Spin } from 'antd';
import { api } from '@/services/api';
import AdminPageHeader from '../_components/AdminPageHeader';
import styles from '../users/index.less';
import vocabStyles from './index.less';

interface DocumentSet {
  id: string;
  title: string;
  topic: string;
  description: string;
  isCustom?: boolean;
}

const DEFAULT_DOCUMENTS: DocumentSet[] = [
  {
    id: 'IELTS',
    title: 'IELTS Core Vocabulary',
    topic: 'IELTS',
    description: 'A collection of 30 core vocabulary words crucial for the IELTS Academic exam.',
  },
  {
    id: 'TOEIC',
    title: 'TOEIC Common Vocabulary',
    topic: 'TOEIC',
    description: 'A compilation of the 30 most common vocabulary words in corporate & TOEIC communication environments.',
  },
  {
    id: 'TOEFL',
    title: 'TOEFL Academic Vocabulary',
    topic: 'TOEFL',
    description: 'A summary of 30 advanced academic vocabulary words for the TOEFL exam.',
  }
];

const getSavedDocuments = (): DocumentSet[] => {
  if (typeof window === 'undefined') return DEFAULT_DOCUMENTS;
  const saved = localStorage.getItem('elp_admin_vocab_documents');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return DEFAULT_DOCUMENTS;
    }
  }
  return DEFAULT_DOCUMENTS;
};

const saveDocuments = (docs: DocumentSet[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('elp_admin_vocab_documents', JSON.stringify(docs));
};

const WORD_TYPES = ['Noun', 'Verb', 'Adjective', 'Adverb', 'Phrase', 'Other'];

const emptyForm = {
  word: '', pronunciation: '', definition: '',
  example: '', type: 'Adjective', meaning: '', topic: '',
};

const AdminVocabularyPage: React.FC = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);

  // Document states
  const [documents, setDocuments] = useState<DocumentSet[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentSet | null>(null);
  const [showDocModal, setShowDocModal] = useState(false);
  const [editDocItem, setEditDocItem] = useState<DocumentSet | null>(null);
  const [docForm, setDocForm] = useState({ title: '', topic: '', description: '' });

  useEffect(() => {
    setDocuments(getSavedDocuments());
  }, []);

  const handleAddDocument = () => {
    if (!docForm.title || !docForm.topic) {
      message.error('Please fill in the document title and topic code');
      return;
    }
    if (editDocItem) {
      // Edit mode
      const updated = documents.map(d =>
        d.id === editDocItem.id
          ? { ...d, title: docForm.title, topic: docForm.topic.toUpperCase(), description: docForm.description }
          : d
      );
      setDocuments(updated);
      saveDocuments(updated);
      message.success('Document set updated');
      setEditDocItem(null);
    } else {
      // Create mode
      const newDoc: DocumentSet = {
        id: docForm.topic.toUpperCase(),
        title: docForm.title,
        topic: docForm.topic.toUpperCase(),
        description: docForm.description,
        isCustom: true,
      };
      const updated = [...documents, newDoc];
      setDocuments(updated);
      saveDocuments(updated);
      message.success('New document set added');
    }
    setShowDocModal(false);
    setDocForm({ title: '', topic: '', description: '' });
  };

  const handleOpenEditDocument = (doc: DocumentSet, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditDocItem(doc);
    setDocForm({
      title: doc.title,
      topic: doc.topic,
      description: doc.description,
    });
    setShowDocModal(true);
  };

  const handleDeleteDocument = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this document set? Words inside will still be stored.')) {
      const updated = documents.filter(d => d.id !== id);
      setDocuments(updated);
      saveDocuments(updated);
      message.success('Document deleted');
    }
  };

  const { data, isLoading } = useQuery({
    queryKey: ['admin-vocab', search],
    queryFn: () => api.get('/vocabularies').then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (payload: any) =>
      editItem
        ? api.put(`/vocabularies/${editItem.id}`, payload).then(r => r.data)
        : api.post('/vocabularies', payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-vocab'] });
      message.success(editItem ? 'Word updated' : 'Word created');
      setShowModal(false);
      setEditItem(null);
      setForm(emptyForm);
    },
    onError: () => message.error('Save failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/vocabularies/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-vocab'] });
      message.success('Word deleted');
    },
  });

  const openEdit = (item: any) => {
    setEditItem(item);
    setForm({
      word: item.word ?? '',
      pronunciation: item.pronunciation ?? '',
      definition: item.definition ?? '',
      example: item.example ?? '',
      type: item.type ?? 'Adjective',
      meaning: item.meaning ?? '',
      topic: item.topic ?? (selectedDoc?.topic || ''),
    });
    setShowModal(true);
  };

  const vocab: any[] = data?.vocabularies ?? data ?? [];

  // Filter vocabulary by selected document's topic code
  const filteredVocab = selectedDoc
    ? vocab.filter((v: any) => v.topic === selectedDoc.topic)
    : vocab;

  const total = filteredVocab.length;

  // View 1: Main Documents List
  if (!selectedDoc) {
    return (
      <div>
        <AdminPageHeader
          title="Vocabulary"
          sub={`${documents.length} document set${documents.length !== 1 ? 's' : ''} in the system`}
          actions={
            <button
              className={styles.btnPrimary}
              onClick={() => setShowDocModal(true)}
            >
              + Add document
            </button>
          }
        />

        <div className={styles.body}>
          {isLoading ? (
            <div className={styles.loading}><Spin /></div>
          ) : (
            <div className={vocabStyles.docGrid}>
              {documents.map((doc) => {
                const wordCount = vocab.filter((v: any) => v.topic === doc.topic).length;
                const badgeClass =
                  doc.topic.toLowerCase() === 'ielts' ? vocabStyles.ielts :
                  doc.topic.toLowerCase() === 'toeic' ? vocabStyles.toeic :
                  doc.topic.toLowerCase() === 'toefl' ? vocabStyles.toefl :
                  vocabStyles.custom;

                return (
                  <div
                    key={doc.id}
                    className={vocabStyles.docCard}
                    onClick={() => setSelectedDoc(doc)}
                  >
                    <div>
                      <div className={vocabStyles.docCardHeader}>
                        <span className={`${vocabStyles.docBadge} ${badgeClass}`}>
                          {doc.topic}
                        </span>
                        <span className={vocabStyles.docWordCount}>
                          {wordCount} word{wordCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className={vocabStyles.docCardTitle}>{doc.title}</div>
                      <div className={vocabStyles.docCardDesc}>{doc.description}</div>
                    </div>
                    <div className={vocabStyles.docCardActions}>
                      <button
                        className={vocabStyles.docEditBtn}
                        onClick={(e) => handleOpenEditDocument(doc, e)}
                      >
                        ✎ Edit
                      </button>
                      <button
                        className={vocabStyles.docDeleteBtn}
                        onClick={(e) => handleDeleteDocument(doc.id, e)}
                      >
                        ✕ Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Create / Edit Document Modal */}
        <Modal
          open={showDocModal}
          onCancel={() => { setShowDocModal(false); setEditDocItem(null); setDocForm({ title: '', topic: '', description: '' }); }}
          title={editDocItem ? `Edit · ${editDocItem.title}` : 'Add new document set'}
          footer={null}
          width={400}
          styles={{
            content: { background: '#141416', border: '1px solid rgba(255,255,255,.1)' },
            header: { background: '#141416', borderBottom: '1px solid rgba(255,255,255,.08)' },
          }}
        >
          <div className={styles.modalBody}>
            <div className={styles.field}>
              <label className={styles.label}>Document title *</label>
              <input
                className={styles.inp}
                value={docForm.title}
                onChange={e => setDocForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. SAT Core Vocabulary"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Topic code *</label>
              <input
                className={styles.inp}
                value={docForm.topic}
                onChange={e => setDocForm(f => ({ ...f, topic: e.target.value.toUpperCase() }))}
                placeholder="e.g. SAT"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Description</label>
              <input
                className={styles.inp}
                value={docForm.description}
                onChange={e => setDocForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Short description..."
              />
            </div>
            <div className={styles.modalFoot}>
              <button
                className={styles.btnSecondary}
                onClick={() => { setShowDocModal(false); setEditDocItem(null); setDocForm({ title: '', topic: '', description: '' }); }}
              >
                Cancel
              </button>
              <button
                className={styles.btnPrimary}
                onClick={handleAddDocument}
                disabled={!docForm.title || !docForm.topic}
              >
                {editDocItem ? 'Save changes' : 'Add document'}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  // View 2: Individual Words inside Selected Document Set
  return (
    <div>
      <AdminPageHeader
        title={selectedDoc.title}
        sub={`${total} word${total !== 1 ? 's' : ''} in this document set`}
        actions={
          <>
            <button
              className={styles.btnSecondary}
              onClick={() => setSelectedDoc(null)}
            >
              ← Back to documents
            </button>
            <button
              className={styles.btnPrimary}
              onClick={() => {
                setEditItem(null);
                setForm({
                  ...emptyForm,
                  topic: selectedDoc.topic,
                });
                setShowModal(true);
              }}
            >
              + Add word
            </button>
          </>
        }
      />

      <div className={styles.body}>
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>⌕</span>
            <input
              className={styles.searchInp}
              placeholder="Search words in this document…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Word</th>
                <th>Definition</th>
                <th>Type</th>
                <th>Meaning (VI)</th>
                <th>Added</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredVocab
                .filter((v: any) => !search || v.word.toLowerCase().includes(search.toLowerCase()))
                .map((v: any) => (
                  <tr key={v.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{v.word}</div>
                      {v.pronunciation && (
                        <div style={{ fontSize: 11, color: '#4A4A50', fontFamily: 'serif' }}>
                          {v.pronunciation}
                        </div>
                      )}
                    </td>
                    <td
                      className={styles.muted}
                      style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {v.definition}
                    </td>
                    <td>
                      <span className={`${styles.badge} ${styles.badgeNeutral}`}>
                        {v.type ?? '—'}
                      </span>
                    </td>
                    <td className={styles.muted} style={{ fontSize: 11 }}>
                      {v.meaning ?? '—'}
                    </td>
                    <td className={styles.muted} style={{ fontSize: 11 }}>
                      {new Date(v.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric',
                      })}
                    </td>
                    <td>
                      <div className={styles.rowActions}>
                        <button
                          className={styles.iconBtn}
                          title="Edit"
                          onClick={() => openEdit(v)}
                        >
                          ✎
                        </button>
                        <Popconfirm
                          title={`Delete "${v.word}"?`}
                          onConfirm={() => deleteMutation.mutate(v.id)}
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
                ))}

              {!filteredVocab.length && (
                <tr>
                  <td
                    colSpan={6}
                    style={{ textAlign: 'center', color: '#4A4A50', padding: '32px 0' }}
                  >
                    No vocabulary found in this document set
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Word Modal */}
      <Modal
        open={showModal}
        onCancel={() => { setShowModal(false); setEditItem(null); setForm(emptyForm); }}
        title={editItem ? `Edit · ${editItem.word}` : 'Add word'}
        footer={null}
        width={480}
        styles={{
          content: { background: '#141416', border: '1px solid rgba(255,255,255,.1)' },
          header: { background: '#141416', borderBottom: '1px solid rgba(255,255,255,.08)' },
        }}
      >
        <div className={styles.modalBody}>
          <div className={styles.twoCol}>
            <div className={styles.field}>
              <label className={styles.label}>Word *</label>
              <input
                className={styles.inp}
                value={form.word}
                onChange={e => setForm(f => ({ ...f, word: e.target.value }))}
                placeholder="e.g. Meticulous"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Pronunciation</label>
              <input
                className={styles.inp}
                value={form.pronunciation}
                onChange={e => setForm(f => ({ ...f, pronunciation: e.target.value }))}
                placeholder="/mɪˈtɪk.jə.ləs/"
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Definition *</label>
            <input
              className={styles.inp}
              value={form.definition}
              onChange={e => setForm(f => ({ ...f, definition: e.target.value }))}
              placeholder="Clear, concise definition…"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Example sentence</label>
            <input
              className={styles.inp}
              value={form.example}
              onChange={e => setForm(f => ({ ...f, example: e.target.value }))}
              placeholder="She was meticulous about every detail."
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Word type</label>
            <select
              className={styles.inp}
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            >
              {WORD_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Vietnamese meaning</label>
            <input
              className={styles.inp}
              value={form.meaning}
              onChange={e => setForm(f => ({ ...f, meaning: e.target.value }))}
              placeholder="e.g. meticulous, careful"
            />
          </div>

          <div className={styles.modalFoot}>
            <button
              className={styles.btnSecondary}
              onClick={() => { setShowModal(false); setEditItem(null); setForm(emptyForm); }}
            >
              Cancel
            </button>
            <button
              className={styles.btnPrimary}
              onClick={() => createMutation.mutate(form)}
              disabled={createMutation.isPending || !form.word || !form.definition}
            >
              {createMutation.isPending
                ? 'Saving…'
                : editItem ? 'Save changes' : 'Add word'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminVocabularyPage;