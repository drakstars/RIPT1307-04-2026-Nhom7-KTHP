import React from 'react';
import { useNavigate, useParams } from 'umi';
import { useQuery } from '@tanstack/react-query';
import { useQuizStore } from '@/stores/quiz.store';
import { quizService } from '@/services/quiz.service';
import type { GradedAnswer, Question } from '@/types/quiz.types';
import { useTranslation } from '@/hooks/useTranslation';
import styles from './result.less';

const QuizResultPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const storeResult = useQuizStore(s => s.result);
    const { t } = useTranslation();

    // If navigated directly (not from submit), load last attempt
    const { data: quiz, isLoading } = useQuery({
        queryKey: ['quiz', id],
        queryFn: () => quizService.getOne(id!),
        enabled: !storeResult,
    });

    const result = storeResult;
    if (!result && isLoading) return (
        <div className={styles.centered}>
            <div style={{ width: 20, height: 20, border: '2px solid #242428', borderTopColor: '#E8FF57', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
        </div>
    );
    if (!result) {
        navigate('/quiz');
        return null;
    }

    const { score, totalQ, percentage, timeTaken, gradedAnswers, questions } = result;

    const getLabel = (pct: number) => {
        if (pct >= 90) return t('quizResultSuccess');
        if (pct >= 75) return t('quizResultVeryGood');
        if (pct >= 60) return t('quizResultGoodTry');
        return t('quizResultKeepPracticing');
    };

    const formatTime = (s?: number) => {
        if (!s) return '—';
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
    };

    return (
        <div className={styles.wrap}>
            {/* Score card */}
            <div className={styles.scoreCard}>
                <div className={styles.scoreCircle}>
                    <span className={styles.scoreNum}>{score}</span>
                    <span className={styles.scoreDen}>/ {totalQ}</span>
                </div>
                <div className={styles.scoreLabel}>{getLabel(percentage)}</div>
                <div className={styles.scoreSub}>{t('quizResultPercentageLabel').replace('{pct}', percentage.toString())}</div>
            </div>

            {/* Stats row */}
            <div className={styles.statsRow}>
                <div className={styles.stat}>
                    <div className={styles.statVal} style={{ color: '#3ECF8E' }}>{score}</div>
                    <div className={styles.statLabel}>{t('correctUnit')}</div>
                </div>
                <div className={styles.stat}>
                    <div className={styles.statVal} style={{ color: '#FF5B5B' }}>{totalQ - score}</div>
                    <div className={styles.statLabel}>{t('incorrectUnit')}</div>
                </div>
                <div className={styles.stat}>
                    <div className={styles.statVal}>{formatTime(timeTaken)}</div>
                    <div className={styles.statLabel}>{t('timeTakenLabel')}</div>
                </div>
            </div>

            {/* Review */}
            <div className={styles.reviewSection}>
                <div className={styles.reviewLabel}>{t('quizResultTitle')}</div>
                <div className={styles.reviewList}>
                    {questions.map((q: Question) => {
                        const g: GradedAnswer = gradedAnswers[q.id];
                        if (!g) return null;

                        return (
                            <div
                                key={q.id}
                                className={`${styles.reviewItem} ${g.isCorrect ? styles.reviewCorrect : styles.reviewWrong}`}
                            >
                                <div
                                    className={styles.reviewPrompt}
                                    dangerouslySetInnerHTML={{ __html: q.prompt }}
                                />
                                <div className={styles.reviewRow}>
                                    <span className={styles.reviewRowLabel}>{t('yourAnswerLabel')}</span>
                                    <span className={`${styles.badge} ${g.isCorrect ? styles.badgeSuccess : styles.badgeDanger}`}>
                                        {g.given || t('skippedLabel')} {g.isCorrect ? '✓' : '✗'}
                                    </span>
                                </div>
                                {!g.isCorrect && (
                                    <div className={styles.reviewRow}>
                                        <span className={styles.reviewRowLabel}>{t('correctAnswerLabel')}</span>
                                        <span className={`${styles.badge} ${styles.badgeSuccess}`}>{g.correct}</span>
                                    </div>
                                )}
                                {g.explanation && (
                                    <div className={styles.explanation}>
                                        <div className={styles.explLabel}>{t('explanationLabel')}</div>
                                        {g.explanation}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Actions */}
            <div className={styles.resultActions}>
                <button className={styles.btnSecondary} onClick={() => navigate('/quiz')}>
                    {t('backToListBtn')}
                </button>
                <button className={styles.btnPrimary} onClick={() => navigate(`/quiz/${id}/play`)}>
                    {t('retakeQuizBtn')}
                </button>
            </div>
        </div>
    );
};

export default QuizResultPage;