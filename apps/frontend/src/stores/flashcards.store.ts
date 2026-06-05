import { create } from 'zustand';
import type { FlashcardItem, StudyStatus } from '@/types/flashcards.type';

interface StudySessionState {
  cards: FlashcardItem[];
  currentIndex: number;
  results: Record<string, StudyStatus>;
  startedAt: Date | null;
  isFlipped: boolean;

  // Actions
  startSession: (cards: FlashcardItem[]) => void;
  flip: () => void;
  markCard: (flashcardId: string, status: StudyStatus) => void;
  nextCard: () => void;
  resetSession: () => void;
}

export const useFlashcardStore = create<StudySessionState>((set, get) => ({
  cards: [],
  currentIndex: 0,
  results: {},
  startedAt: null,
  isFlipped: false,

  startSession: (cards) =>
    set({ cards, currentIndex: 0, results: {}, startedAt: new Date(), isFlipped: false }),

  flip: () => set((s) => ({ isFlipped: !s.isFlipped })),

  markCard: (flashcardId, status) =>
    set((s) => ({
      results: { ...s.results, [flashcardId]: status },
    })),

  nextCard: () =>
    set((s) => ({
      currentIndex: s.currentIndex + 1,
      isFlipped: false,
    })),

  resetSession: () =>
    set({ cards: [], currentIndex: 0, results: {}, startedAt: null, isFlipped: false }),
}));

// Selectors
export const selectCurrentCard = (s: StudySessionState) =>
  s.cards[s.currentIndex] ?? null;

export const selectIsSessionDone = (s: StudySessionState) =>
  s.cards.length > 0 && s.currentIndex >= s.cards.length;

export const selectProgress = (s: StudySessionState) => ({
  current: s.currentIndex + 1,
  total: s.cards.length,
  known: Object.values(s.results).filter((v) => v === 'KNOWN').length,
  needReview: Object.values(s.results).filter((v) => v === 'NEED_REVIEW').length,
});