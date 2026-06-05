export type StudyStatus = 'KNOWN' | 'NEED_REVIEW';

export interface FlashcardItem {
  id: string;
  front: string;
  back: string;
  hint?: string;
  vocabularyId?: string;
  flashcardSetId: string;
  createdAt: string;
}

export interface FlashcardSet {
  id: string;
  title: string;
  description?: string;
  userId: string;
  flashcards?: FlashcardItem[];
  _count?: { flashcards: number };
  createdAt: string;
  updatedAt: string;
}

export interface StudySession {
  setId: string;
  cards: FlashcardItem[];
  currentIndex: number;
  results: Record<string, StudyStatus>; // flashcardId -> status
  startedAt: Date;
}

export interface SessionStats {
  total: number;
  reviewed: number;
  known: number;
  needReview: number;
}

export interface CreateFlashcardSetPayload {
  title: string;
  description?: string;
  flashcards?: {
    front: string;
    back: string;
    hint?: string;
    vocabularyId?: string;
  }[];
}