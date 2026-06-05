import { api } from '@/services/api';
import type { Course, Lesson, CompleteLessonResult } from '@/types/course.types';

const BASE = '/courses';

export const courseService = {
    getAll: (): Promise<Course[]> =>
        api.get(BASE).then(r => r.data),

    getOne: (id: string): Promise<Course> =>
        api.get(`${BASE}/${id}`).then(r => r.data),

    enroll: (id: string): Promise<void> =>
        api.post(`${BASE}/${id}/enroll`).then(r => r.data),

    unenroll: (id: string): Promise<void> =>
        api.delete(`${BASE}/${id}/enroll`).then(r => r.data),

    getLesson: (lessonId: string): Promise<Lesson> =>
        api.get(`${BASE}/lessons/${lessonId}`).then(r => r.data),

    completeLesson: (lessonId: string): Promise<CompleteLessonResult> =>
        api.post(`${BASE}/lessons/complete`, { lessonId }).then(r => r.data),
};