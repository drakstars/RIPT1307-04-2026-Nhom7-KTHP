import { useState, useCallback } from 'react';
import type { DragQuestion } from '@/types/game.types';

export function useDragGame(questions: DragQuestion[]) {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [filledAnswer, setFilledAnswer] = useState<string | null>(null);
    const [checked, setChecked] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [gameOver, setGameOver] = useState(false);

    const currentQ = questions[currentIdx];
    const isLast = currentIdx >= questions.length - 1;

    const fill = useCallback((word: string) => {
        if (checked) return;
        setFilledAnswer(word);
    }, [checked]);

    const clear = useCallback(() => {
        if (checked) return;
        setFilledAnswer(null);
    }, [checked]);

    const check = useCallback(() => {
        if (!filledAnswer || checked) return;
        const correct = filledAnswer === currentQ.answer;
        setIsCorrect(correct);
        setChecked(true);
        if (correct) setScore(s => s + 1);
    }, [filledAnswer, checked, currentQ]);

    const next = useCallback(() => {
        if (isLast) {
            setGameOver(true);
            return;
        }
        setCurrentIdx(i => i + 1);
        setFilledAnswer(null);
        setChecked(false);
        setIsCorrect(null);
    }, [isLast]);

    const reset = useCallback(() => {
        setCurrentIdx(0);
        setScore(0);
        setFilledAnswer(null);
        setChecked(false);
        setIsCorrect(null);
        setGameOver(false);
    }, []);

    return {
        currentQ,
        currentIdx,
        score,
        filledAnswer,
        checked,
        isCorrect,
        gameOver,
        isLast,
        total: questions.length,
        fill,
        clear,
        check,
        next,
        reset,
    };
}