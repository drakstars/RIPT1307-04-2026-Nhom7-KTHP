export interface OverviewStats {
    totalStudied: number;
    knownCount: number;
    reviewCount: number;
    knownRate: number;
    quizAttemptCount: number;
    quizAvg: number;
    setCount: number;
    thisWeek: number;
    weekDelta: number;
}

export interface ActivityDay {
    date: string;
    count: number;
    level: 0 | 1 | 2 | 3 | 4;
}

export interface WeeklyDay {
    label: string;
    date: string;
    count: number;
}

export interface SetProgress {
    id: string;
    title: string;
    total: number;
    known: number;
    needReview: number;
    unstudied: number;
    knownPct: number;
    reviewPct: number;
}

export interface StreakData {
    current: number;
    best: number;
    lastThirtyDays: { date: string; studied: boolean }[];
}