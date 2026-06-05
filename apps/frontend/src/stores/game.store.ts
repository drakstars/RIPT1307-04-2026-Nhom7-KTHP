import { create } from 'zustand';
import type { GameSession, GameResult } from '@/types/game.types';

interface GameState {
    session: GameSession | null;
    result: GameResult | null;

    startSession: (session: Omit<GameSession, 'score' | 'errors' | 'startedAt'>) => void;
    updateScore: (score: number, errors: number) => void;
    endSession: (result: GameResult) => void;
    resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
    session: null,
    result: null,

    startSession: (partial) =>
        set({
            session: { ...partial, score: 0, errors: 0, startedAt: new Date() },
            result: null,
        }),

    updateScore: (score, errors) =>
        set(s => ({
            session: s.session ? { ...s.session, score, errors } : null,
        })),

    endSession: (result) =>
        set(s => ({
            session: s.session ? { ...s.session, completedAt: new Date() } : null,
            result,
        })),

    resetGame: () => set({ session: null, result: null }),
}));