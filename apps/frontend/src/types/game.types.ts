export type GameType = 'MATCHING' | 'MEMORY' | 'DRAG_DROP';

export interface GameCard {
    id: string;
    front: string;  // word
    back: string;   // definition/meaning
}

export interface MatchingPair {
    id: string;
    word: string;
    definition: string;
}

export interface MemoryCard {
    uid: string;        // unique per card face
    pairId: string;     // shared between word & def card
    text: string;
    type: 'word' | 'def';
    isFlipped: boolean;
    isMatched: boolean;
}

export interface DragQuestion {
    id: string;
    sentence: string;   // "She ___ to the store"
    answer: string;     // correct word
    options: string[];  // shuffled choices including answer
    hint?: string;
}

export interface GameSession {
    gameType: GameType;
    flashcardSetId: string;
    score: number;
    total: number;
    startedAt: Date;
    completedAt?: Date;
    errors: number;
}

export interface GameResult {
    score: number;
    total: number;
    pct: number;
    errors: number;
    timeTaken: number;
}