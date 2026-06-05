import { useState, useCallback, useRef, useEffect } from 'react';
import type { MatchingPair } from '@/types/game.types';

interface MatchState {
    selected: string | null;  // uid of selected card (word or def)
    matched: Set<string>;     // pairIds that are matched
    errors: number;
    score: number;
}

export function useMatchingGame(pairs: MatchingPair[], timeLimit = 60) {
    const [state, setState] = useState<MatchState>({
        selected: null,
        matched: new Set(),
        errors: 0,
        score: 0,
    });
    const [timeLeft, setTimeLeft] = useState(timeLimit);
    const [gameOver, setGameOver] = useState(false);
    const [wrongPair, setWrongPair] = useState<string | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval>>();

    useEffect(() => {
        timerRef.current = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    clearInterval(timerRef.current);
                    setGameOver(true);
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, []);

    // Check win
    useEffect(() => {
        if (state.matched.size >= pairs.length) {
            clearInterval(timerRef.current);
            setGameOver(true);
        }
    }, [state.matched.size, pairs.length]);

    const selectCard = useCallback((uid: string, type: 'word' | 'def', pairId: string) => {
        if (gameOver) return;
        if (state.matched.has(pairId)) return;

        setState(s => {
            if (!s.selected) {
                return { ...s, selected: uid };
            }

            // Deselect if clicking same card
            if (s.selected === uid) {
                return { ...s, selected: null };
            }

            // Parse selected uid to get its pairId and type
            const [selPairId, selType] = s.selected.split('::');

            // Both same type — swap selection
            if (selType === type) {
                return { ...s, selected: uid };
            }

            // Different type — check if match
            if (selPairId === pairId) {
                // Correct match!
                const newMatched = new Set(s.matched);
                newMatched.add(pairId);
                return {
                    ...s,
                    selected: null,
                    matched: newMatched,
                    score: s.score + 1,
                };
            } else {
                // Wrong match
                setWrongPair(uid + '::' + s.selected);
                setTimeout(() => setWrongPair(null), 600);
                return { ...s, selected: null, errors: s.errors + 1 };
            }
        });
    }, [gameOver, state.matched]);

    const reset = useCallback(() => {
        setState({ selected: null, matched: new Set(), errors: 0, score: 0 });
        setTimeLeft(timeLimit);
        setGameOver(false);
        setWrongPair(null);
        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) { clearInterval(timerRef.current); setGameOver(true); return 0; }
                return t - 1;
            });
        }, 1000);
    }, [timeLimit]);

    return {
        selected: state.selected,
        matched: state.matched,
        score: state.score,
        errors: state.errors,
        timeLeft,
        gameOver,
        wrongPair,
        selectCard: (uid: string, type: 'word' | 'def', pairId: string) => {
            const compositeUid = `${pairId}::${type}`;
            selectCard(compositeUid, type, pairId);
        },
        isSelected: (pairId: string, type: 'word' | 'def') =>
            state.selected === `${pairId}::${type}`,
        isWrong: (pairId: string, type: 'word' | 'def') =>
            wrongPair?.includes(`${pairId}::${type}`) ?? false,
        reset,
    };
}