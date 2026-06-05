import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'umi';
import { flashcardService } from '@/services/flashcards.service';
import { quizService } from '@/services/quiz.service';
import type { CreateQuizPayload } from '@/types/quiz.types';
import type { FlashcardSet } from '@/types/flashcards.type';
import { useTranslation } from '@/hooks/useTranslation';
import styles from './create.less';

// ─── Small toggle switch ─────────────────────────────────
const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void }> = ({ checked, onChange }) => (
  <label className={styles.toggle}>
    <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
    <span className={styles.track} />
    <span className={styles.thumb} />
  </label>
);

const CreateQuizPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t, language } = useTranslation();

  const [title, setTitle] = useState('');
  const [setId, setSetId] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [shuffle, setShuffle] = useState(true);
  const [enableTimer, setEnableTimer] = useState(false);
  const [timeLimitSecs, setTimeLimitSecs] = useState(30);
  const [includeMultipleChoice, setIncludeMultipleChoice] = useState(true);
  const [includeTrueFalse, setIncludeTrueFalse] = useState(true);
  const [includeFillInBlank, setIncludeFillInBlank] = useState(true);
  const [error, setError] = useState('');

  const { data: sets, isLoading: loadingSets } = useQuery({
    queryKey: ['flashcard-sets'],
    queryFn: flashcardService.getSets,
  });

  const selectedSet = sets?.find((s: FlashcardSet) => s.id === setId);
  const totalCards = selectedSet ? (selectedSet._count?.flashcards ?? selectedSet.flashcards?.length ?? 0) : 0;

  // Clamp question count when set changes
  useEffect(() => {
    if (totalCards > 0) setQuestionCount(Math.min(questionCount, totalCards));
  }, [setId, totalCards]);

  const createMutation = useMutation({
    mutationFn: (payload: CreateQuizPayload) => quizService.create(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      navigate(`/quiz/${data.id}/play`);
    },
    onError: () => setError(t('failedToCreateQuiz')),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError(t('titleRequiredQuizError')); return; }
    if (!setId) { setError(t('selectSetError')); return; }
    if (!includeMultipleChoice && !includeTrueFalse && !includeFillInBlank) {
      setError(t('selectQuestionTypeError'));
      return;
    }
    if (totalCards === 0) { setError(t('emptySetError')); return; }
    setError('');

    createMutation.mutate({
      title: title.trim(),
      flashcardSetId: setId,
      questionCount,
      shuffle,
      timeLimitSecs: enableTimer ? timeLimitSecs : undefined,
      includeMultipleChoice,
      includeTrueFalse,
      includeFillInBlank,
    });
  };

  return (
    <form className={styles.page} onSubmit={handleSubmit}>
      <button type="button" className={styles.back} onClick={() => navigate('/quiz')}>{t('backBtn')}</button>

      <div>
        <div className={styles.heading}>{t('createNewQuizTitle')}</div>
        <div className={styles.sub}>{t('autoQuizSub')}</div>
      </div>

      {/* Basic info */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>{language === 'vi' ? 'Thông tin bài kiểm tra' : 'Quiz Details'}</div>

        <div className={styles.field}>
          <label className={styles.label}>{t('setTitleLabel')}</label>
          <input
            className={styles.input}
            placeholder={t('quizTitlePlaceholder')}
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>{t('selectFlashcardSet')}</label>
          <select
            className={styles.select}
            value={setId}
            onChange={e => setSetId(e.target.value)}
            disabled={loadingSets}
          >
            <option value="">
              {loadingSets ? t('loadingSelectText') : t('chooseSetPlaceholder')}
            </option>
            {sets?.map((s: FlashcardSet) => {
              const count = s._count?.flashcards ?? s.flashcards?.length ?? 0;
              return (
                <option key={s.id} value={s.id} disabled={count === 0}>
                  {s.title} — {count} {t('cardsUnit')}{count === 0 ? ` (${t('emptySetLabel')})` : ''}
                </option>
              );
            })}
          </select>
        </div>

        {setId && totalCards > 0 && (
          <div className={styles.field}>
            <label className={styles.label}>
              {t('questionsCountLabel')}
              <span className={styles.labelNote}>{t('maxQuestionsNote').replace('{count}', totalCards.toString())}</span>
            </label>
            <input
              type="number"
              className={styles.numInput}
              min={1}
              max={totalCards}
              value={questionCount}
              onChange={e => setQuestionCount(Math.min(totalCards, Math.max(1, Number(e.target.value))))}
            />
          </div>
        )}

        <div className={styles.toggleRow}>
          <div className={styles.toggleInfo}>
            <span className={styles.toggleLabel}>{t('shuffleQuestionsLabel')}</span>
            <span className={styles.toggleDesc}>{t('shuffleQuestionsDesc')}</span>
          </div>
          <Toggle checked={shuffle} onChange={setShuffle} />
        </div>
      </div>

      {/* Question types */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>{t('questionTypeSection')}</div>
        <div className={styles.checkList}>
          {[
            { label: t('multipleChoiceLabel'), checked: includeMultipleChoice, set: setIncludeMultipleChoice },
            { label: t('trueFalseLabel'), checked: includeTrueFalse, set: setIncludeTrueFalse },
            { label: t('fillInBlankLabel'), checked: includeFillInBlank, set: setIncludeFillInBlank },
          ].map(({ label, checked, set }) => (
            <label key={label} className={styles.checkItem}>
              <input
                type="checkbox"
                checked={checked}
                onChange={e => set(e.target.checked)}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Timer */}
      <div className={styles.section}>
        <div className={styles.toggleRow}>
          <div className={styles.toggleInfo}>
            <span className={styles.toggleLabel}>{t('timeLimitLabel')}</span>
            <span className={styles.toggleDesc}>{t('timeLimitDesc')}</span>
          </div>
          <Toggle checked={enableTimer} onChange={setEnableTimer} />
        </div>

        {enableTimer && (
          <div className={styles.field}>
            <label className={styles.label}>{t('secsPerQuestionLabel')}</label>
            <input
              type="number"
              className={styles.numInput}
              min={5}
              max={300}
              value={timeLimitSecs}
              onChange={e => setTimeLimitSecs(Math.max(5, Math.min(300, Number(e.target.value))))}
            />
          </div>
        )}
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.actions}>
        <button type="button" className={styles.cancelBtn} onClick={() => navigate('/quiz')}>{t('cancelBtn')}</button>
        <button type="submit" className={styles.submitBtn} disabled={createMutation.isPending}>
          {createMutation.isPending ? t('creatingBtn') : t('createNewQuizBtn')}
        </button>
      </div>
    </form>
  );
};

export default CreateQuizPage;
