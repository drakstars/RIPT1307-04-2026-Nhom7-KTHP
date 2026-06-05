export type QuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'FILL_IN_BLANK';

export interface Question {
    id: string;
    quizId: string;
    type: QuestionType;
    prompt: string;
    options: string[] | null;  // parsed from JSON
    answer: string;
    explanation: string | null;
    order: number;
}

export interface Quiz {
    id: string;
    title: string;
    flashcardSetId: string;
    userId: string;
    questionCount: number;
    shuffle: boolean;
    timeLimitSecs: number | null;
    questions?: Question[];
    attempts?: QuizAttemptSummary[];
    _count?: { questions: number; attempts: number };
    createdAt: string;
}

export interface QuizAttemptSummary {
    score: number;
    totalQ: number;
    completedAt: string;
}

export interface GradedAnswer {
    given: string;
    correct: string;
    isCorrect: boolean;
    explanation: string;
}

export interface SubmitResult {
    attemptId: string;
    score: number;
    totalQ: number;
    percentage: number;
    timeTaken?: number;
    gradedAnswers: Record<string, GradedAnswer>;
    questions: Question[];
}

export interface CreateQuizPayload {
    title: string;
    flashcardSetId: string;
    questionCount: number;
    shuffle: boolean;
    timeLimitSecs?: number;
    includeMultipleChoice: boolean;
    includeTrueFalse: boolean;
    includeFillInBlank: boolean;
}