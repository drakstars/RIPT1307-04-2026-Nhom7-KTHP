import { useState, useCallback } from 'react';
import type { MemoryCard } from '@/types/game.types';

export function useMemoryGame(initialCards: MemoryCard[]) {
    const [cards, setCards] = useState<MemoryCard[]>(initialCards);
    const [flippedUids, setFlippedUids] = useState<string[]>([]);
    const [locked, setLocked] = useState(false);
    const [flips, setFlips] = useState(0);
    const [pairs, setPairs] = useState(0);

    const totalPairs = initialCards.length / 2;
    const gameOver = pairs >= totalPairs;

    const flip = useCallback((uid: string) => {
        if (locked) return;
        const card = cards.find(c => c.uid === uid);
        if (!card || card.isFlipped || card.isMatched) return;
        if (flippedUids.includes(uid)) return;

        setFlips(f => f + 1);
        setCards(prev => prev.map(c => c.uid === uid ? { ...c, isFlipped: true } : c));

        const newFlipped = [...flippedUids, uid];
        setFlippedUids(newFlipped);

        if (newFlipped.length === 2) {
            setLocked(true);
            const [uid1, uid2] = newFlipped;
            const card1 = cards.find(c => c.uid === uid1)!;
            const card2 = cards.find(c => c.uid === uid2)!;

            if (card1.pairId === card2.pairId) {
                // Match!
                setTimeout(() => {
                    setCards(prev =>
                        prev.map(c =>
                            c.pairId === card1.pairId ? { ...c, isMatched: true } : c,
                        ),
                    );
                    setPairs(p => p + 1);
                    setFlippedUids([]);
                    setLocked(false);
                }, 400);
            } else {
                // No match — flip back
                setTimeout(() => {
                    setCards(prev =>
                        prev.map(c =>
                            newFlipped.includes(c.uid) ? { ...c, isFlipped: false } : c,
                        ),
                    );
                    setFlippedUids([]);
                    setLocked(false);
                }, 900);
            }
        }
    }, [cards, flippedUids, locked]);

    const reset = useCallback((newCards: MemoryCard[]) => {
        setCards(newCards);
        setFlippedUids([]);
        setLocked(false);
        setFlips(0);
        setPairs(0);
    }, []);

    return { cards, flips, pairs, totalPairs, gameOver, flip, reset };
}