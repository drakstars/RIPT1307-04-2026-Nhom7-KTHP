import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'umi';
import { useQuery } from '@tanstack/react-query';
import { Spin } from 'antd';
import { flashcardService } from '@/services/flashcards.service';
import { buildMatchingPairs, shuffle } from '@/utils/game.utils';
import { useMatchingGame } from '@/hooks/useMatchingGame';
import GameResult from '@/components/common/GameResult';
import { useTranslation } from '@/hooks/useTranslation';
import styles from './matching.less';

const MatchingGamePage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const setId = params.get('set');
    const { t } = useTranslation();

    const { data: sets, isLoading } = useQuery({
        queryKey: ['flashcard-sets-with-cards', setId],
        queryFn: async () => {
            const all = await flashcardService.getSets();
            // Load first valid set if no setId
            const target = setId ? all.find(s => s.id === setId) : all[0];
            if (!target) return null;
            return flashcardService.getSet(target.id);
        },
    });

    const pairs = useMemo(() => {
        if (!sets?.flashcards) return [];
        return buildMatchingPairs(
            sets.flashcards.map(c => ({ id: c.id, front: c.front, back: c.back })),
            6,
        );
    }, [sets]);

    const wordOrder = useMemo(() => shuffle(pairs), [pairs]);
    const defOrder = useMemo(() => shuffle(pairs), [pairs]);

    const {
        matched, selected, score, errors, timeLeft,
        gameOver, wrongPair, selectCard, isSelected, isWrong, reset,
    } = useMatchingGame(pairs, 60);

    const startedAt = React.useRef(Date.now());

    React.useEffect(() => {
        if (gameOver && matched.size > 0) {
            matched.forEach(pairId => {
                flashcardService.recordStudy(pairId, 'KNOWN').catch(e => console.error('Error recording study:', e));
            });
        }
    }, [gameOver, matched]);

    if (isLoading) return <div className={styles.centered}><Spin /></div>;
    if (!pairs.length) return (
        <div className={styles.centered}>
            <p style={{ color: '#8A8A8E' }}>
                {t('notEnoughCardsNotice')}{' '}
                <span style={{ color: '#E8FF57', cursor: 'pointer' }} onClick={() => navigate('/flashcards/create')}>
                    {t('gamesCreateSetLink')}
                </span>
            </p>
        </div>
    );

    if (gameOver) {
        return (
            <div className={styles.pg}>
                <GameResult
                    result={{
                        score,
                        total: pairs.length,
                        pct: Math.round((score / pairs.length) * 100),
                        errors,
                        timeTaken: Math.round((Date.now() - startedAt.current) / 1000),
                    }}
                    onReplay={() => { reset(); startedAt.current = Date.now(); }}
                    onBack={() => navigate('/games')}
                />
            </div>
        );
    }

    const timePct = (timeLeft / 60) * 100;

    return (
        <div className={styles.pg}>
            {/* Top bar */}
            <div className={styles.topBar}>
                <button className={styles.exitBtn} onClick={() => navigate('/games')}>← {t('exitBtnText')}</button>
                <div className={styles.stats}>
                    <div className={styles.statPill}>
                        ⏱ <span className={`${styles.statVal} ${timeLeft <= 10 ? styles.warn : ''}`}>{timeLeft}s</span>
                    </div>
                    <div className={styles.statPill}>✓ <span className={styles.statVal}>{score}</span></div>
                    <div className={styles.statPill}>✗ <span className={styles.statVal}>{errors}</span></div>
                </div>
                <button className={styles.restartBtn} onClick={() => { reset(); startedAt.current = Date.now(); }}>{t('restartBtnText')}</button>
            </div>

            {/* Progress bar */}
            <div className={styles.progWrap}>
                <div
                    className={`${styles.progFill} ${timeLeft <= 10 ? styles.progWarn : ''}`}
                    style={{ width: `${timePct}%` }}
                />
            </div>

            {/* Game grid */}
            <div className={styles.grid}>
                {/* Words column */}
                <div className={styles.col}>
                    <div className={styles.colLabel}>{t('wordColLabel')}</div>
                    {wordOrder.map(pair => {
                        const isMatch = matched.has(pair.id);
                        const isSel = isSelected(pair.id, 'word');
                        const isWr = isWrong(pair.id, 'word');

                        return (
                            <button
                                key={pair.id + '-word'}
                                className={`${styles.card}
                   ${isMatch ? styles.cardMatched : ''}
                   ${isSel ? styles.cardSelected : ''}
                   ${isWr ? styles.cardWrong : ''}
                 `}
                                onClick={() => selectCard(pair.id + '-word', 'word', pair.id)}
                                disabled={isMatch}
                            >
                                {pair.word}
                            </button>
                        );
                    })}
                </div>

                {/* Defs column */}
                <div className={styles.col}>
                    <div className={styles.colLabel}>{t('meaningColLabel')}</div>
                    {defOrder.map(pair => {
                        const isMatch = matched.has(pair.id);
                        const isSel = isSelected(pair.id, 'def');
                        const isWr = isWrong(pair.id, 'def');

                        return (
                            <button
                                key={pair.id + '-def'}
                                className={`${styles.card}
                   ${isMatch ? styles.cardMatched : ''}
                   ${isSel ? styles.cardSelected : ''}
                   ${isWr ? styles.cardWrong : ''}
                 `}
                                onClick={() => selectCard(pair.id + '-def', 'def', pair.id)}
                                disabled={isMatch}
                            >
                                {pair.definition}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MatchingGamePage;