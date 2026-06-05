import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'umi';
import { quizService } from '@/services/quiz.service';
import type { Quiz } from '@/types/quiz.types';
import { useTranslation } from '@/hooks/useTranslation';
import styles from './index.less';

const QuizListPage: React.FC = () => {
    const navigate = useNavigate();
    const qc = useQueryClient();
    const { t } = useTranslation();

    const { data: quizzes, isLoading } = useQuery({
        queryKey: ['quizzes'],
        queryFn: quizService.getAll,
    });

    const deleteMutation = useMutation({
        mutationFn: quizService.delete,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['quizzes'] }),
    });

    const getStatus = (quiz: Quiz) => {
        const last = quiz.attempts?.[0];
        if (!last) return { label: t('notAttemptedYet'), cls: 'neutral' };
        const pct = Math.round((last.score / last.totalQ) * 100);
        return { label: `${last.score}/${last.totalQ} · ${pct}%`, cls: pct >= 80 ? 'success' : 'warn' };
    };

    if (isLoading) return (
        <div className={styles.centered}>
            <div style={{ width: 20, height: 20, border: '2px solid #242428', borderTopColor: '#E8FF57', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
        </div>
    );

    return (
        <div className={styles.pg}>
            <div className={styles.top}>
                <div>
                    <h1 className={styles.title}>{t('quiz')}</h1>
                    <p className={styles.sub}>{quizzes?.length ?? 0} {t('quizzesCountUnit')} · {t('quizSub')}</p>
                </div>
                <button className={styles.btnPrimary} onClick={() => navigate('/quiz/create')}>
                    {t('createNewQuizBtn')}
                </button>
            </div>

            <div className={styles.grid}>
                {quizzes?.map((quiz: Quiz) => {
                    const status = getStatus(quiz);
                    const attempted = (quiz._count?.attempts ?? 0) > 0;

                    return (
                        <div key={quiz.id} className={styles.card}>
                            <div className={styles.cardHead}>
                                <div>
                                    <div className={styles.cardTitle}>{quiz.title}</div>
                                    <div className={styles.cardSub}>
                                        {t('questionsCount').replace('{count}', (quiz._count?.questions ?? 0).toString())}
                                        {quiz.timeLimitSecs && ` · ${t('secsPerQuestion').replace('{secs}', quiz.timeLimitSecs.toString())}`}
                                    </div>
                                </div>
                                <span className={`${styles.badge} ${styles[status.cls]}`}>
                                    {status.label}
                                </span>
                            </div>

                            <div className={styles.progBar}>
                                <div
                                    className={styles.progFill}
                                    style={{
                                        width: attempted
                                            ? `${Math.round(((quiz.attempts?.[0]?.score ?? 0) / (quiz.attempts?.[0]?.totalQ ?? 1)) * 100)}%`
                                            : '0%',
                                    }}
                                />
                            </div>

                            <div className={styles.cardFoot}>
                                <button
                                    className={styles.btnDanger}
                                    onClick={() => { if (confirm(t('deleteQuizConfirm'))) deleteMutation.mutate(quiz.id); }}
                                >
                                    {t('deleteBtn')}
                                </button>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    {attempted && (
                                        <button
                                            className={styles.btnGhost}
                                            onClick={() => navigate(`/quiz/${quiz.id}/result`)}
                                        >
                                            {t('reviewQuizBtn')}
                                        </button>
                                    )}
                                    <button
                                        className={styles.btnPrimary}
                                        onClick={() => navigate(`/quiz/${quiz.id}/play`)}
                                    >
                                        {attempted ? t('retakeQuizBtn') : t('startQuizBtn')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}

                <div
                    className={`${styles.card} ${styles.cardEmpty}`}
                    onClick={() => navigate('/quiz/create')}
                >
                    {t('createNewQuizTitle')}
                </div>
            </div>
        </div>
    );
};

export default QuizListPage;