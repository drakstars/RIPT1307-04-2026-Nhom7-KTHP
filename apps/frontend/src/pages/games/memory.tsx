import React, { useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'umi';
import { useQuery } from '@tanstack/react-query';
import { Spin } from 'antd';
import { flashcardService } from '@/services/flashcards.service';
import { buildMemoryCards, shuffle } from '@/utils/game.utils';
import { useMemoryGame } from '@/hooks/useMemoryGame';
import GameResult from '@/components/common/GameResult';
import styles from './memory.less';
const MemoryGamePage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const setId = params.get('set');
    const startedAt = useRef(Date.now());
    const { data: set, isLoading } = useQuery({
        queryKey: ['game-set', setId],
        queryFn: async () => {
            const all = await flashcardService.getSets();
            const target = setId ? all.find(s => s.id === setId) : all[0];
            if (!target) return null;
            return flashcardService.getSet(target.id);
        },
    });
    const initialCards = useMemo(() => {
        if (!set?.flashcards) return [];
        return buildMemoryCards(
            set.flashcards.map(c => ({ id: c.id, front: c.front, back: c.back })),
            8,
        );
    }, [set]);
    const { cards, flips, pairs, totalPairs, gameOver, flip, reset } = useMemoryGame(initialCards);
    if (isLoading) return <div className={styles.centered}><Spin /></div>;
    if (gameOver && pairs >= totalPairs) {
        return (
            <div className={styles.pg}>
                <GameResult
                    result={{
                        score: pairs,
                        total: totalPairs,
                        pct: 100,
                        errors: Math.max(0, flips - totalPairs * 2),
                        timeTaken: Math.round((Date.now() - startedAt.current) / 1000),
                    }}
                    onReplay={() => { reset(shuffle(initialCards)); startedAt.current = Date.now(); }}
                    onBack={() => navigate('/games')}
                />
            </div>
        );
    }
    return (
        <div className={styles.pg}>
            <div className={styles.topBar}>
                <button className={styles.exitBtn} onClick={() => navigate('/games')}>← Exit</button>
                <div className={styles.stats}>
                    <div className={styles.statPill}>Pairs <span className={styles.statVal}>{pairs}/{totalPairs}</span></div>
                    <div className={styles.statPill}>Flips <span className={styles.statVal}>{flips}</span></div>
                </div>
                <button className={styles.restartBtn} onClick={() => { reset(shuffle(initialCards)); startedAt.current = Date.now(); }}>Restart</button>
            </div>
            <div className={styles.grid}>
                {cards.map(card => (
                    <div
                        key={card.uid}
                        className={`${styles.cardWrap} ${card.isMatched ? styles.cardWrapMatched : ''}`}
                        onClick={() => flip(card.uid)}
                    >
                        <div className={`${styles.inner} ${(card.isFlipped || card.isMatched) ? styles.innerFlipped : ''}`}>
                            <div className={`${styles.face} ${styles.back}`}>◻</div>
                            <div className={`${styles.face} ${styles.front} ${card.isMatched ? styles.frontMatched : ''}`}>
                                {card.text}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default MemoryGamePage;
