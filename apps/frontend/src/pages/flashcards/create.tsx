import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'umi';
import { flashcardService } from '@/services/flashcards.service';
import type { CreateFlashcardSetPayload } from '@/types/flashcards.type';
import styles from './create.less';

interface CardField {
  front: string;
  back: string;
  hint: string;
}

const CreateFlashcardSetPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cards, setCards] = useState<CardField[]>([{ front: '', back: '', hint: '' }]);
  const [error, setError] = useState('');

  const createMutation = useMutation({
    mutationFn: (payload: CreateFlashcardSetPayload) => flashcardService.createSet(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['flashcard-sets'] });
      navigate(`/flashcards/${data.id}/study`);
    },
    onError: () => setError('Failed to create set. Please try again.'),
  });

  const addCard = () => setCards(c => [...c, { front: '', back: '', hint: '' }]);
  const removeCard = (i: number) => setCards(c => c.filter((_, idx) => idx !== i));
  const updateCard = (i: number, field: keyof CardField, val: string) =>
    setCards(c => c.map((card, idx) => idx === i ? { ...card, [field]: val } : card));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required'); return; }
    setError('');
    createMutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      flashcards: cards
        .filter(c => c.front.trim() && c.back.trim())
        .map(c => ({ front: c.front.trim(), back: c.back.trim(), hint: c.hint.trim() || undefined })),
    });
  };

  return (
    <form className={styles.page} onSubmit={handleSubmit}>
      <button type="button" className={styles.back} onClick={() => navigate('/flashcards')}>
        ← Quay lại
      </button>

      <div className={styles.heading}>Tạo bộ thẻ mới</div>

      {/* Meta */}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>Thông tin bộ thẻ</div>
        <div className={styles.field}>
          <label className={styles.label}>Tiêu đề *</label>
          <input
            className={styles.input}
            placeholder="VD: Từ vựng IELTS Band 7"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Mô tả</label>
          <textarea
            className={styles.textarea}
            placeholder="Mô tả ngắn (không bắt buộc)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
          />
        </div>
      </div>

      {/* Cards */}
      <div className={styles.divider}>Thẻ</div>

      {cards.map((card, i) => (
        <div key={i} className={styles.cardItem}>
          <div className={styles.cardItemHeader}>
            <span className={styles.cardNum}>Thẻ {i + 1}</span>
            {cards.length > 1 && (
              <button type="button" className={styles.removeBtn} onClick={() => removeCard(i)}>×</button>
            )}
          </div>
          <div className={styles.cardFields}>
            <div className={styles.field}>
              <label className={styles.label}>Mặt trước (Từ / câu hỏi)</label>
              <input className={styles.input} placeholder="VD: Accomplish" value={card.front}
                onChange={e => updateCard(i, 'front', e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Mặt sau (Định nghĩa / đáp án)</label>
              <input className={styles.input} placeholder="VD: Hoàn thành, đạt được" value={card.back}
                onChange={e => updateCard(i, 'back', e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Gợi ý (không bắt buộc)</label>
              <input className={styles.input} placeholder="VD: động từ" value={card.hint}
                onChange={e => updateCard(i, 'hint', e.target.value)} />
            </div>
          </div>
        </div>
      ))}

      <button type="button" className={styles.addCardBtn} onClick={addCard}>
        + Thêm thẻ
      </button>

      {error && <div className={styles.errorMsg}>{error}</div>}

      <div className={styles.footer}>
        <button type="button" className={styles.cancelBtn} onClick={() => navigate('/flashcards')}>
          Hủy
        </button>
        <button type="submit" className={styles.submitBtn} disabled={createMutation.isPending}>
          {createMutation.isPending ? 'Đang tạo…' : 'Tạo bộ thẻ →'}
        </button>
      </div>
    </form>
  );
};

export default CreateFlashcardSetPage;