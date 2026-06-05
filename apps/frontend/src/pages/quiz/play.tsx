import React, { useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'umi';
import { useQuery, useMutation } from '@tanstack/react-query';

import { quizService } from '@/services/quiz.service';
import {
    useQuizStore, selectCurrentQuestion, selectElapsedSeconds,
} from '@/stores/quiz.store';
import type { Question } from '@/types/quiz.types';
import { useTranslation } from '@/hooks/useTranslation';
import styles from './play.less';

// ─── Sub-components ───────────────────────────────────────

const MultipleChoice: React.FC<{
    question: Question;
    selected: string;
    onSelect: (v: string) => void;
    revealed: boolean;
}> = ({ question, selected, onSelect, revealed }) => {
    const opts = question.options ?? [];
    const KEYS = ['A', 'B', 'C', 'D'];

    const getCls = (opt: string) => {
        if (!revealed) return selected === opt ? styles.choiceSelected : styles.choice;
        if (opt === question.answer) return styles.choiceCorrect;
        if (selected === opt && opt !== question.answer) return styles.choiceWrong;
        return styles.choice;
    };

    return (
        <div className={styles.choices}>
            {opts.map((opt, i) => (
                <button key={opt} className={getCls(opt)} onClick={() => !revealed && onSelect(opt)}>
                    <span className={styles.choiceKey}>{KEYS[i]}</span>
                    {opt}
                </button>
            ))}
        </div>
    );
};

const TrueFalse: React.FC<{
    question: Question;
    selected: string;
    onSelect: (v: string) => void;
    revealed: boolean;
}> = ({ question, selected, onSelect, revealed }) => {
    const { t } = useTranslation();
    const getCls = (val: string) => {
        if (!revealed) return selected === val ? styles.tfSelected : styles.tf;
        if (val === question.answer) return styles.tfCorrect;
        if (selected === val && val !== question.answer) return styles.tfWrong;
        return styles.tf;
    };

    return (
        <div className={styles.tfRow}>
            {['true', 'false'].map(val => (
                <button key={val} className={getCls(val)} onClick={() => !revealed && onSelect(val)}>
                    {val === 'true' ? t('trueText') : t('falseText')}
                </button>
            ))}
        </div>
    );
};

const FillInBlank: React.FC<{
    question: Question;
    value: string;
    onChange: (v: string) => void;
    revealed: boolean;
}> = ({ question, value, onChange, revealed }) => {
    const { t } = useTranslation();
    return (
        <div className={styles.fillWrap}>
            <div className={styles.fillPrompt}>
                {question.prompt.replace('___________', '')}
                <span className={styles.fillBlank}>
                    {value || '___________'}
                </span>
            </div>
            {!revealed && (
                <input
                    className={styles.fillInp}
                    placeholder={t('fillBlankPlaceholder')}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    autoFocus
                />
            )}
            {revealed && (
                <div className={`${styles.fillResult} ${value.toLowerCase().trim() === question.answer ? styles.fillCorrect : styles.fillWrong}`}>
                    {value.toLowerCase().trim() === question.answer
                        ? `✓ ${t('correctText')}`
                        : `✗ ${t('incorrectText').replace('{ans}', question.answer)}`}
                </div>
            )}
        </div>
    );
};

// ─── Main page ────────────────────────────────────────────

const QuizPlayPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [revealed, setRevealed] = React.useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval>>();

    const {
        startSession, answer, nextQuestion, prevQuestion,
        tickTimer, setResult, resetSession,
        answers, timeLeft, questions,
    } = useQuizStore();

    const currentQ = useQuizStore(selectCurrentQuestion);

    // ── primitive selectors — each returns a number, stable for Object.is
    const progressCurrent  = useQuizStore(s => s.currentIndex + 1);
    const progressTotal    = useQuizStore(s => s.questions.length);
    const progressAnswered = useQuizStore(s => Object.keys(s.answers).length);
    const progressPct      = useQuizStore(s =>
        s.questions.length
            ? Math.round(((s.currentIndex + 1) / s.questions.length) * 100)
            : 0
    );

    const { data: quiz, isLoading } = useQuery({
        queryKey: ['quiz', id],
        queryFn: () => quizService.getOne(id!),
        enabled: !!id,
    });

    const submitMutation = useMutation({
        mutationFn: quizService.submit,
        onSuccess: (data) => {
            setResult(data);
            navigate(`/quiz/${id}/result`);
        },
        onError: () => console.error('Submit failed'),
    });

    // Start session when quiz loads
    useEffect(() => {
        if (quiz?.questions?.length) {
            startSession(quiz.id, quiz.questions, quiz.timeLimitSecs ?? undefined);
            setRevealed(false);
        }
        return () => { resetSession(); clearInterval(timerRef.current); };
    }, [quiz]);

    // Per-question countdown
    useEffect(() => {
        if (!quiz?.timeLimitSecs) return;
        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            tickTimer();
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [progressCurrent, quiz]);

    // Auto-advance on timeout
    useEffect(() => {
        if (timeLeft === 0 && !revealed) {
            setRevealed(true);
        }
    }, [timeLeft]);

    const handleNext = useCallback(() => {
        setRevealed(false);
        if (progressCurrent >= progressTotal) {
            // Submit
            const elapsed = Math.round((Date.now() - (useQuizStore.getState().startedAt?.getTime() ?? Date.now())) / 1000);
            submitMutation.mutate({ quizId: id!, answers, timeTaken: elapsed });
        } else {
            nextQuestion();
        }
    }, [progressCurrent, progressTotal, answers, id]);

    const currentAnswer = currentQ ? (answers[currentQ.id] ?? '') : '';
    const isAnswered = currentAnswer !== '';
    const isLast = progressCurrent >= progressTotal;

    if (isLoading) return (
        <div className={styles.centered}>
            <div style={{ width: 20, height: 20, border: '2px solid #242428', borderTopColor: '#E8FF57', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
        </div>
    );

    // quiz data loaded but session hasn't been started yet (useEffect fires after render)
    if (!quiz) return null;
    if (!currentQ) return (
        <div className={styles.centered}>
            <div style={{ width: 20, height: 20, border: '2px solid #242428', borderTopColor: '#E8FF57', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
        </div>
    );

    const timerWarn = timeLeft !== null && timeLeft <= 8;

    return (
        <div className={styles.wrap}>
            {/* Top bar */}
            <div className={styles.topBar}>
                <button className={styles.exitBtn} onClick={() => navigate('/quiz')}>← {t('quizExitBtn')}</button>
                <span className={styles.counter}>{progressCurrent} / {progressTotal}</span>
                {timeLeft !== null && (
                    <span className={`${styles.timer} ${timerWarn ? styles.timerWarn : ''}`}>
                        ⏱ {t('timerUnit').replace('{secs}', timeLeft.toString())}
                    </span>
                )}
                {timeLeft === null && <span />}
            </div>

            {/* Progress */}
            <div className={styles.progWrap}>
                <div className={styles.progFill} style={{ width: `${progressPct}%` }} />
            </div>

            {/* Question card */}
            <div className={styles.qCard}>
                <div className={styles.qTypeBadge}>
                    {currentQ.type === 'MULTIPLE_CHOICE' && t('multipleChoiceTitle')}
                    {currentQ.type === 'TRUE_FALSE' && t('trueFalseTitle')}
                    {currentQ.type === 'FILL_IN_BLANK' && t('fillInBlankTitle')}
                </div>

                {currentQ.type !== 'FILL_IN_BLANK' && (
                    <div className={styles.qPrompt} dangerouslySetInnerHTML={{ __html: currentQ.prompt }} />
                )}

                {currentQ.type === 'MULTIPLE_CHOICE' && (
                    <MultipleChoice
                        question={currentQ}
                        selected={currentAnswer}
                        onSelect={v => { answer(currentQ.id, v); }}
                        revealed={revealed}
                    />
                )}

                {currentQ.type === 'TRUE_FALSE' && (
                    <TrueFalse
                        question={currentQ}
                        selected={currentAnswer}
                        onSelect={v => { answer(currentQ.id, v); }}
                        revealed={revealed}
                    />
                )}

                {currentQ.type === 'FILL_IN_BLANK' && (
                    <FillInBlank
                        question={currentQ}
                        value={currentAnswer}
                        onChange={v => answer(currentQ.id, v)}
                        revealed={revealed}
                    />
                )}

                {/* Explanation */}
                {revealed && currentQ.explanation && (
                    <div className={styles.explanation}>
                        <div className={styles.explLabel}>{t('explanationTitle')}</div>
                        {currentQ.explanation}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className={styles.actions}>
                <button
                    className={styles.btnGhost}
                    onClick={() => setRevealed(true)}
                    style={{ visibility: (!revealed && isAnswered) ? 'visible' : 'hidden' }}
                >
                    {t('checkAnswerBtn')}
                </button>
                <div style={{ display: 'flex', gap: 8 }}>
                    {progressCurrent > 1 && !revealed && (
                        <button className={styles.btnSecondary} onClick={prevQuestion}>{t('prevQBtn')}</button>
                    )}
                    {revealed && (
                        <button
                            className={styles.btnPrimary}
                            onClick={handleNext}
                            disabled={submitMutation.isPending}
                        >
                            {isLast ? t('submitQuizBtn') : t('nextQBtn')}
                        </button>
                    )}
                    {!revealed && !isAnswered && (
                        <button className={styles.btnGhost} onClick={() => { answer(currentQ.id, ''); setRevealed(true); }}>
                            {t('skipQBtn')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuizPlayPage;