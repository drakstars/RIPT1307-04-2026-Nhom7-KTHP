import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'umi';
import { flashcardService } from '@/services/flashcards.service';
import type { CreateFlashcardSetPayload } from '@/types/flashcards.type';
import { useTranslation } from '@/hooks/useTranslation';
import styles from './create.less';

interface CardField {
  front: string;
  back: string;
  hint: string;
}

const CreateFlashcardSetPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

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
    onError: () => setError(t('failedToCreateSet')),
  });

  const addCard = () => setCards(c => [...c, { front: '', back: '', hint: '' }]);
  const removeCard = (i: number) => setCards(c => c.filter((_, idx) => idx !== i));
  const updateCard = (i: number, field: keyof CardField, val: string) =>
    setCards(c => c.map((card, idx) => idx === i ? { ...card, [field]: val } : card));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError(t('titleRequiredError')); return; }
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
        {t('backBtn')}
      </button>

      <div className={styles.heading}>{t('createNewSetTitle')}</div>

      {/* Meta */}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>{t('setInfoTitle')}</div>
        <div className={styles.field}>
          <label className={styles.label}>{t('setTitleLabel')}</label>
          <input
            className={styles.input}
            placeholder={t('setTitlePlaceholder')}
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>{t('setDescriptionLabel')}</label>
          <textarea
            className={styles.textarea}
            placeholder={t('setDescriptionPlaceholder')}
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
          />
        </div>
      </div>

      {/* Cards */}
      <div className={styles.divider}>{t('dividerCards')}</div>

      {cards.map((card, i) => (
        <div key={i} className={styles.cardItem}>
          <div className={styles.cardItemHeader}>
            <span className={styles.cardNum}>{t('cardIndexLabel').replace('{index}', (i + 1).toString())}</span>
            {cards.length > 1 && (
              <button type="button" className={styles.removeBtn} onClick={() => removeCard(i)}>×</button>
            )}
          </div>
          <div className={styles.cardFields}>
            <div className={styles.field}>
              <label className={styles.label}>{t('frontLabel')}</label>
              <input className={styles.input} placeholder={t('frontPlaceholder')} value={card.front}
                onChange={e => updateCard(i, 'front', e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{t('backLabel')}</label>
              <input className={styles.input} placeholder={t('backPlaceholder')} value={card.back}
                onChange={e => updateCard(i, 'back', e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{t('hintLabel')}</label>
              <input className={styles.input} placeholder={t('hintPlaceholder')} value={card.hint}
                onChange={e => updateCard(i, 'hint', e.target.value)} />
            </div>
          </div>
        </div>
      ))}

      <button type="button" className={styles.addCardBtn} onClick={addCard}>
        {t('addCardBtn')}
      </button>

      {error && <div className={styles.errorMsg}>{error}</div>}

      <div className={styles.footer}>
        <button type="button" className={styles.cancelBtn} onClick={() => navigate('/flashcards')}>
          {t('cancelBtn')}
        </button>
        <button type="submit" className={styles.submitBtn} disabled={createMutation.isPending}>
          {createMutation.isPending ? t('creatingBtn') : t('createSetSubmitBtn')}
        </button>
      </div>
    </form>
  );
};

export default CreateFlashcardSetPage;