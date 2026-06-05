import { api } from './api';
import type { Quiz, SubmitResult, CreateQuizPayload } from '@/types/quiz.types';

const BASE = '/quiz';

export const quizService = {
    getAll: (): Promise<Quiz[]> =>
        api.get(BASE).then(r => r.data),

    getOne: (id: string): Promise<Quiz> =>
        api.get(`${BASE}/${id}`).then(r => {
            const quiz = r.data;
            // options field from Prisma Json type may already be a parsed array
            quiz.questions = quiz.questions?.map((q: any) => ({
                ...q,
                options: q.options
                    ? (typeof q.options === 'string' ? JSON.parse(q.options) : q.options)
                    : null,
            }));
            return quiz;
        }),

    create: (payload: CreateQuizPayload): Promise<Quiz> =>
        api.post(BASE, payload).then(r => r.data),

    delete: (id: string): Promise<void> =>
        api.delete(`${BASE}/${id}`).then(r => r.data),

    submit: (payload: {
        quizId: string;
        answers: Record<string, string>;
        timeTaken?: number;
    }): Promise<SubmitResult> =>
        api.post(`${BASE}/submit`, payload).then(r => r.data),
};