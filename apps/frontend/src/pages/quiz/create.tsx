import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'umi';
import { flashcardService } from '@/services/flashcards.service';
import { quizService } from '@/services/quiz.service';
import type { CreateQuizPayload } from '@/types/quiz.types';
import type { FlashcardSet } from '@/types/flashcards.type';
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
    onError: () => setError('Không thể tạo bài kiểm tra. Vui lòng thử lại.'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Vui lòng nhập tiêu đề'); return; }
    if (!setId) { setError('Vui lòng chọn bộ thẻ flashcard'); return; }
    if (!includeMultipleChoice && !includeTrueFalse && !includeFillInBlank) {
      setError('Vui lòng chọn ít nhất một dạng câu hỏi');
      return;
    }
    if (totalCards === 0) { setError('Bộ thẻ này chưa có thẻ nào'); return; }
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
      <button type="button" className={styles.back} onClick={() => navigate('/quiz')}>← Quay lại</button>

      <div>
        <div className={styles.heading}>Tạo bài kiểm tra</div>
        <div className={styles.sub}>Tự động tạo câu hỏi từ bộ thẻ flashcard</div>
      </div>

      {/* Basic info */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Thông tin bài kiểm tra</div>

        <div className={styles.field}>
          <label className={styles.label}>Tiêu đề *</label>
          <input
            className={styles.input}
            placeholder="VD: Kiểm tra từ vựng IELTS"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Bộ thẻ flashcard *</label>
          <select
            className={styles.select}
            value={setId}
            onChange={e => setSetId(e.target.value)}
            disabled={loadingSets}
          >
            <option value="">
              {loadingSets ? 'Đang tải…' : 'Chọn bộ thẻ'}
            </option>
            {sets?.map((s: FlashcardSet) => {
              const count = s._count?.flashcards ?? s.flashcards?.length ?? 0;
              return (
                <option key={s.id} value={s.id} disabled={count === 0}>
                  {s.title} — {count} thẻ{count === 0 ? ' (rỗng)' : ''}
                </option>
              );
            })}
          </select>
        </div>

        {setId && totalCards > 0 && (
          <div className={styles.field}>
            <label className={styles.label}>
              Số lượng câu hỏi
              <span className={styles.labelNote}>tối đa {totalCards}</span>
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
            <span className={styles.toggleLabel}>Xáo trộn câu hỏi</span>
            <span className={styles.toggleDesc}>Thứ tự ngẫu nhiên mỗi lần làm</span>
          </div>
          <Toggle checked={shuffle} onChange={setShuffle} />
        </div>
      </div>

      {/* Question types */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Dạng câu hỏi</div>
        <div className={styles.checkList}>
          {[
            { label: 'Trắc nghiệm', checked: includeMultipleChoice, set: setIncludeMultipleChoice },
            { label: 'Đúng / Sai', checked: includeTrueFalse, set: setIncludeTrueFalse },
            { label: 'Điền vào chỗ trống', checked: includeFillInBlank, set: setIncludeFillInBlank },
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
            <span className={styles.toggleLabel}>Giới hạn thời gian mỗi câu</span>
            <span className={styles.toggleDesc}>Đếm ngược hiển thị cho mỗi câu hỏi</span>
          </div>
          <Toggle checked={enableTimer} onChange={setEnableTimer} />
        </div>

        {enableTimer && (
          <div className={styles.field}>
            <label className={styles.label}>Số giây mỗi câu</label>
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
        <button type="button" className={styles.cancelBtn} onClick={() => navigate('/quiz')}>Hủy</button>
        <button type="submit" className={styles.submitBtn} disabled={createMutation.isPending}>
          {createMutation.isPending ? 'Đang tạo…' : 'Tạo bài kiểm tra →'}
        </button>
      </div>
    </form>
  );
};

export default CreateQuizPage;
