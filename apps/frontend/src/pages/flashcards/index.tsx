import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'umi';
import { flashcardService } from '@/services/flashcards.service';
import type { FlashcardSet } from '@/types/flashcards.type';
import { useTranslation } from '@/hooks/useTranslation';
import styles from './index.less';

const FlashcardListPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { data: sets, isLoading } = useQuery({
    queryKey: ['flashcard-sets'],
    queryFn: flashcardService.getSets,
  });

  const deleteMutation = useMutation({
    mutationFn: flashcardService.deleteSet,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['flashcard-sets'] }),
  });

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <div className={styles.heading}>{t('flashcards')}</div>
          <div className={styles.sub}>{t('flashcardsSub')}</div>
        </div>
        <button className={styles.createBtn} onClick={() => navigate('/flashcards/create')}>
          {t('newSetBtn')}
        </button>
      </div>

      {!sets?.length ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>⬡</div>
          <div className={styles.emptyTitle}>{t('noSetsTitle')}</div>
          <div className={styles.emptySub}>{t('noSetsSub')}</div>
          <button className={styles.createBtn} onClick={() => navigate('/flashcards/create')}>
            {t('createSetBtn')}
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {sets.map((set: FlashcardSet) => (
            <div
              key={set.id}
              className={styles.card}
              onClick={() => navigate(`/flashcards/${set.id}/study`)}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div className={styles.cardIcon}>⬡</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className={styles.cardTitle}>{set.title}</div>
                  {set.description && (
                    <div className={styles.cardDesc}>{set.description}</div>
                  )}
                </div>
              </div>

              <div className={styles.cardMeta}>
                <span className={styles.cardBadge}>
                  {set._count?.flashcards ?? set.flashcards?.length ?? 0} {t('cardsUnit')}
                </span>
                <div className={styles.cardActions}>
                  <button
                    className={`${styles.actionBtn} ${styles.danger}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(t('deleteSetConfirm'))) deleteMutation.mutate(set.id);
                    }}
                    title="Delete"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FlashcardListPage;