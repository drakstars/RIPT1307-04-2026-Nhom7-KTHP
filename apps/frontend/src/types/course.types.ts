export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type LessonType = 'READING' | 'VOCABULARY' | 'QUIZ';

export interface Lesson {
    id: string;
    courseId: string;
    title: string;
    type: LessonType;
    content?: string;
    durationMins?: number;
    order: number;
    flashcardSetId?: string;
    quizId?: string;
    isCompleted?: boolean;
    isLocked?: boolean;
    isCurrent?: boolean;
    nextLessonId?: string | null;
}

export interface Course {
    id: string;
    title: string;
    description: string;
    level: CourseLevel;
    emoji: string;
    published: boolean;
    lessons?: Lesson[];
    enrolled: boolean;
    completedLessons: number;
    progressPct: number;
    _count?: { lessons: number };
}

export interface CompleteLessonResult {
    lessonId: string;
    courseComplete: boolean;
    progressPct: number;
}