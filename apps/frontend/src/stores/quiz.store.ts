import { create } from 'zustand';
import type { Question, SubmitResult } from '@/types/quiz.types';

interface QuizSessionState {
    quizId: string | null;
    questions: Question[];
    currentIndex: number;
    answers: Record<string, string>;       // questionId → answer
    timeLeft: number | null;               // seconds
    submitted: boolean;
    result: SubmitResult | null;
    startedAt: Date | null;

    // Actions
    startSession: (quizId: string, questions: Question[], timeLimitSecs?: number) => void;
    answer: (questionId: string, value: string) => void;
    nextQuestion: () => void;
    prevQuestion: () => void;
    tickTimer: () => void;
    setResult: (result: SubmitResult) => void;
    resetSession: () => void;
}

export const useQuizStore = create<QuizSessionState>((set, get) => ({
    quizId: null,
    questions: [],
    currentIndex: 0,
    answers: {},
    timeLeft: null,
    submitted: false,
    result: null,
    startedAt: null,

    startSession: (quizId, questions, timeLimitSecs) =>
        set({
            quizId,
            questions,
            currentIndex: 0,
            answers: {},
            timeLeft: timeLimitSecs ?? null,
            submitted: false,
            result: null,
            startedAt: new Date(),
        }),

    answer: (questionId, value) =>
        set(s => ({ answers: { ...s.answers, [questionId]: value } })),

    nextQuestion: () =>
        set(s => ({
            currentIndex: Math.min(s.currentIndex + 1, s.questions.length - 1),
            // Reset per-question timer
            timeLeft: s.timeLeft !== null ? s.timeLeft : null,
        })),

    prevQuestion: () =>
        set(s => ({ currentIndex: Math.max(s.currentIndex - 1, 0) })),

    tickTimer: () =>
        set(s => ({
            timeLeft: s.timeLeft !== null ? Math.max(0, s.timeLeft - 1) : null,
        })),

    setResult: (result) => set({ result, submitted: true }),

    resetSession: () =>
        set({
            quizId: null, questions: [], currentIndex: 0,
            answers: {}, timeLeft: null, submitted: false,
            result: null, startedAt: null,
        }),
}));

// Selectors
export const selectCurrentQuestion = (s: QuizSessionState) =>
    s.questions[s.currentIndex] ?? null;

export const selectProgress = (s: QuizSessionState) => ({
    current: s.currentIndex + 1,
    total: s.questions.length,
    answered: Object.keys(s.answers).length,
    pct: s.questions.length
        ? Math.round(((s.currentIndex + 1) / s.questions.length) * 100)
        : 0,
});

export const selectElapsedSeconds = (s: QuizSessionState) =>
    s.startedAt
        ? Math.round((Date.now() - s.startedAt.getTime()) / 1000)
        : 0;