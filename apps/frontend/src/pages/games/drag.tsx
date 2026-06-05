import React, { useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'umi';
import { useQuery } from '@tanstack/react-query';
import { Spin } from 'antd';
import { flashcardService } from '@/services/flashcards.service';
import { buildDragQuestions } from '@/utils/game.utils';
import { useDragGame } from '@/hooks/useDragGame';
import GameResult from '@/components/common/GameResult';
import { useTranslation } from '@/hooks/useTranslation';
import styles from './drag.less';

const DragGamePage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const setId = params.get('set');
    const startedAt = useRef(Date.now());
    const { t } = useTranslation();

    const { data: set, isLoading } = useQuery({
        queryKey: ['game-set-drag', setId],
        queryFn: async () => {
            const all = await flashcardService.getSets();
            const target = setId ? all.find(s => s.id === setId) : all[0];
            if (!target) return null;
            return flashcardService.getSet(target.id);
        },
    });

    const questions = useMemo(() => {
        if (!set?.flashcards) return [];
        return buildDragQuestions(
            set.flashcards.map(c => ({ id: c.id, front: c.front, back: c.back })),
            5,
        );
    }, [set]);

    const {
        currentQ, currentIdx, score, filledAnswer,
        checked, isCorrect, gameOver, isLast, total,
        fill, clear, check, next, reset,
    } = useDragGame(questions);

    React.useEffect(() => {
        if (gameOver && questions.length > 0) {
            questions.forEach(q => {
                flashcardService.recordStudy(q.id, 'KNOWN').catch(e => console.error('Error recording study:', e));
            });
        }
    }, [gameOver, questions]);

    if (isLoading) return <div className={styles.centered}><Spin /></div>;

    if (gameOver) {
        return (
            <div className={styles.pg}>
                <GameResult
                    result={{
                        score,
                        total,
                        pct: Math.round((score / total) * 100),
                        errors: total - score,
                        timeTaken: Math.round((Date.now() - startedAt.current) / 1000),
                    }}
                    onReplay={() => { reset(); startedAt.current = Date.now(); }}
                    onBack={() => navigate('/games')}
                />
            </div>
        );
    }

    if (!currentQ) return null;

    // Render sentence with blank
    const [before, after] = currentQ.sentence.split('___');

    return (
        <div className={styles.pg}>
            <div className={styles.topBar}>
                <button className={styles.exitBtn} onClick={() => navigate('/games')}>← {t('exitBtnText')}</button>
                <div className={styles.stats}>
                    <div className={styles.statPill}>Q <span className={styles.statVal}>{currentIdx + 1}/{total}</span></div>
                    <div className={styles.statPill}>{t('scoreLabelText').charAt(0).toUpperCase() + t('scoreLabelText').slice(1)} <span className={styles.statVal}>{score}</span></div>
                </div>
                <button className={styles.restartBtn} onClick={() => { reset(); startedAt.current = Date.now(); }}>{t('restartBtnText')}</button>
            </div>

            <div className={styles.progWrap}>
                <div className={styles.progFill} style={{ width: `${((currentIdx) / total) * 100}%` }} />
            </div>

            {/* Question */}
            <div className={styles.questionCard}>
                <div className={styles.qLabel}>{t('fillInBlankLabel')}</div>
                <div className={styles.sentence}>
                    {before}
                    <span
                        className={`${styles.blank}
              ${filledAnswer ? styles.blankFilled : ''}
              ${checked && isCorrect ? styles.blankCorrect : ''}
              ${checked && !isCorrect ? styles.blankWrong : ''}
            `}
                        onClick={!checked ? clear : undefined}
                    >
                        {filledAnswer || '___________'}
                    </span>
                    {after}
                </div>
            </div>

            {/* Word bank */}
            <div className={styles.wordBank}>
                {currentQ.options.map(word => (
                    <button
                        key={word}
                        className={`${styles.chip}
              ${filledAnswer === word ? styles.chipUsed : ''}
            `}
                        onClick={() => !checked && fill(word)}
                        disabled={checked || filledAnswer === word}
                    >
                        {word}
                    </button>
                ))}
            </div>

            {/* Feedback */}
            {checked && (
                <div className={`${styles.feedback} ${isCorrect ? styles.feedbackCorrect : styles.feedbackWrong}`}>
                    {isCorrect
                        ? t('dragCorrectFeedback').replace('{ans}', currentQ.answer)
                        : t('dragWrongFeedback').replace('{ans}', currentQ.answer)
                    }
                </div>
            )}

            {/* Actions */}
            <div className={styles.actions}>
                {!checked ? (
                    <>
                        <button className={styles.btnSecondary} onClick={clear} disabled={!filledAnswer}>{t('clearBtnText')}</button>
                        <button className={styles.btnPrimary} onClick={check} disabled={!filledAnswer}>{t('checkBtnText')}</button>
                    </>
                ) : (
                    <button className={styles.btnPrimary} onClick={next}>
                        {isLast ? t('seeResultsBtnText') : t('nextBtnText')}
                    </button>
                )}
            </div>
        </div>
    );
};

export default DragGamePage;