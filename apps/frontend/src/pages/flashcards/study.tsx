import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'umi';
import { useQuery, useMutation } from '@tanstack/react-query';
import { flashcardService } from '@/services/flashcards.service';
import {
  useFlashcardStore,
  selectCurrentCard,
  selectIsSessionDone,
} from '@/stores/flashcards.store';
import styles from './study.less';

const StudyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { startSession, flip, markCard, nextCard, resetSession, isFlipped } =
    useFlashcardStore();
  const currentCard = useFlashcardStore(selectCurrentCard);
  const isDone = useFlashcardStore(selectIsSessionDone);

  // ── primitive selectors — each returns a number/bool, stable for Object.is comparison
  const progressCurrent = useFlashcardStore(s => s.currentIndex + 1);
  const progressTotal   = useFlashcardStore(s => s.cards.length);
  const progressKnown   = useFlashcardStore(s =>
    Object.values(s.results).filter(v => v === 'KNOWN').length
  );
  const progressNeedReview = useFlashcardStore(s =>
    Object.values(s.results).filter(v => v === 'NEED_REVIEW').length
  );

  const { data: set, isLoading } = useQuery({
    queryKey: ['flashcard-set', id],
    queryFn: () => flashcardService.getSet(id!),
    enabled: !!id,
  });

  const recordMutation = useMutation({
    mutationFn: ({ flashcardId, status }: { flashcardId: string; status: 'KNOWN' | 'NEED_REVIEW' }) =>
      flashcardService.recordStudy(flashcardId, status),
  });

  useEffect(() => {
    if (set?.flashcards?.length) startSession(set.flashcards);
    return () => resetSession();
  }, [set]);

  const handleMark = (status: 'KNOWN' | 'NEED_REVIEW') => {
    if (!currentCard) return;
    markCard(currentCard.id, status);
    recordMutation.mutate({ flashcardId: currentCard.id, status });
    nextCard();
  };

  if (isLoading) {
    return (
      <div className={styles.centered}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (!set) return null;

  // ─── Result screen ───────────────────────────────────────
  if (isDone) {
    return (
      <div className={styles.result}>
        <div className={styles.resultEmoji}>🎉</div>
        <div className={styles.resultTitle}>Hoàn thành phiên học!</div>
        <div className={styles.resultSub}>Bạn đã học {progressTotal} thẻ</div>

        <div className={styles.resultStats}>
          <div className={styles.statItem}>
            <span className={`${styles.statNum} ${styles.green}`}>{progressKnown}</span>
            <span className={styles.statLabel}>Known</span>
          </div>
          <div className={styles.statItem}>
            <span className={`${styles.statNum} ${styles.amber}`}>{progressNeedReview}</span>
            <span className={styles.statLabel}>Review</span>
          </div>
        </div>

        <div className={styles.resultActions}>
          <button className={styles.outlineBtn} onClick={() => set.flashcards && startSession(set.flashcards)}>
            ↺ Học lại
          </button>
          <button className={styles.primaryBtn} onClick={() => navigate('/flashcards')}>
            ← Quay lại bộ thẻ
          </button>
        </div>
      </div>
    );
  }

  const progressPercent = progressTotal > 0
    ? Math.round((progressCurrent - 1) / progressTotal * 100)
    : 0;

  // ─── Study screen ────────────────────────────────────────
  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.exitBtn} onClick={() => navigate('/flashcards')}>
          ← Thoát
        </button>
        <span className={styles.setTitle}>{set.title}</span>
        <span className={styles.counter}>{progressCurrent}/{progressTotal}</span>
      </div>

      {/* Progress */}
      <div className={styles.progressWrap}>
        <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
      </div>

      {/* Stats */}
      <div className={styles.statsBar}>
        <span className={`${styles.stat} ${styles.known}`}>✓ {progressKnown} thuộc</span>
        <span className={`${styles.stat} ${styles.review}`}>◌ {progressNeedReview} cần ôn</span>
      </div>

      {/* Flip Card */}
      {currentCard && (
        <div className={styles.scene} onClick={flip}>
          <div className={`${styles.cardInner} ${isFlipped ? styles.flipped : ''}`}>
            {/* Front */}
            <div className={styles.face + ' ' + styles.front}>
              <span className={styles.faceLabel}>Mặt trước · nhấn để lật</span>
              <div className={styles.cardWord}>{currentCard.front}</div>
              {currentCard.hint && (
                <div className={styles.cardHint}>💡 {currentCard.hint}</div>
              )}
            </div>
            {/* Back */}
            <div className={styles.face + ' ' + styles.back}>
              <span className={styles.faceLabel}>Mặt sau</span>
              <div className={styles.cardWord}>{currentCard.back}</div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      {isFlipped ? (
        <div className={styles.actions}>
          <button className={styles.btnReview} onClick={() => handleMark('NEED_REVIEW')}>
            ✕ Cần ôn lại
          </button>
          <button className={styles.btnKnown} onClick={() => handleMark('KNOWN')}>
            ✓ Đã thuộc
          </button>
        </div>
      ) : (
        <div className={styles.tapHint}>Nhấn vào thẻ để xem đáp án</div>
      )}
    </div>
  );
};

export default StudyPage;