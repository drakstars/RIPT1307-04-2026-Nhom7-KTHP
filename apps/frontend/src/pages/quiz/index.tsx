import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'umi';
import { quizService } from '@/services/quiz.service';
import type { Quiz } from '@/types/quiz.types';
import styles from './index.less';

const QuizListPage: React.FC = () => {
    const navigate = useNavigate();
    const qc = useQueryClient();

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
        if (!last) return { label: 'Chưa làm', cls: 'neutral' };
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
                    <h1 className={styles.title}>Kiểm tra</h1>
                    <p className={styles.sub}>{quizzes?.length ?? 0} bài kiểm tra · ôn luyện kiến thức</p>
                </div>
                <button className={styles.btnPrimary} onClick={() => navigate('/quiz/create')}>
                    + Tạo bài kiểm tra
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
                                        {quiz._count?.questions ?? 0} câu hỏi
                                        {quiz.timeLimitSecs && ` · ${quiz.timeLimitSecs}s mỗi câu`}
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
                                    onClick={() => { if (confirm('Xóa bài kiểm tra này?')) deleteMutation.mutate(quiz.id); }}
                                >Xóa</button>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    {attempted && (
                                        <button
                                            className={styles.btnGhost}
                                            onClick={() => navigate(`/quiz/${quiz.id}/result`)}
                                        >
                                            Xem lại
                                        </button>
                                    )}
                                    <button
                                        className={styles.btnPrimary}
                                        onClick={() => navigate(`/quiz/${quiz.id}/play`)}
                                    >
                                        {attempted ? 'Làm lại →' : 'Bắt đầu →'}
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
                    + Tạo bài kiểm tra mới
                </div>
            </div>
        </div>
    );
};

export default QuizListPage;