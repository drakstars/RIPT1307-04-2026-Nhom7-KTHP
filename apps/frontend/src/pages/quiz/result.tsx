import React from 'react';
import { useNavigate, useParams } from 'umi';
import { useQuery } from '@tanstack/react-query';
import { useQuizStore } from '@/stores/quiz.store';
import { quizService } from '@/services/quiz.service';
import type { GradedAnswer, Question } from '@/types/quiz.types';
import styles from './result.less';

const QuizResultPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const storeResult = useQuizStore(s => s.result);

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
        if (pct >= 90) return 'Xuất sắc!';
        if (pct >= 75) return 'Rất tốt!';
        if (pct >= 60) return 'Cố gắng tốt.';
        return 'Tiếp tục ôn luyện nhé.';
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
                <div className={styles.scoreSub}>Bạn đạt {percentage}%</div>
            </div>

            {/* Stats row */}
            <div className={styles.statsRow}>
                <div className={styles.stat}>
                    <div className={styles.statVal} style={{ color: '#3ECF8E' }}>{score}</div>
                    <div className={styles.statLabel}>Đúng</div>
                </div>
                <div className={styles.stat}>
                    <div className={styles.statVal} style={{ color: '#FF5B5B' }}>{totalQ - score}</div>
                    <div className={styles.statLabel}>Sai</div>
                </div>
                <div className={styles.stat}>
                    <div className={styles.statVal}>{formatTime(timeTaken)}</div>
                    <div className={styles.statLabel}>Thời gian</div>
                </div>
            </div>

            {/* Review */}
            <div className={styles.reviewSection}>
                <div className={styles.reviewLabel}>Xem lại đáp án</div>
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
                                    <span className={styles.reviewRowLabel}>Câu trả lời của bạn</span>
                                    <span className={`${styles.badge} ${g.isCorrect ? styles.badgeSuccess : styles.badgeDanger}`}>
                                        {g.given || '(skipped)'} {g.isCorrect ? '✓' : '✗'}
                                    </span>
                                </div>
                                {!g.isCorrect && (
                                    <div className={styles.reviewRow}>
                                        <span className={styles.reviewRowLabel}>Đáp án đúng</span>
                                        <span className={`${styles.badge} ${styles.badgeSuccess}`}>{g.correct}</span>
                                    </div>
                                )}
                                {g.explanation && (
                                    <div className={styles.explanation}>
                                        <div className={styles.explLabel}>Giải thích</div>
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
                    Quay lại danh sách
                </button>
                <button className={styles.btnPrimary} onClick={() => navigate(`/quiz/${id}/play`)}>
                    Làm lại →
                </button>
            </div>
        </div>
    );
};

export default QuizResultPage;