import {api} from './api';
import type {
  FlashcardSet,
  CreateFlashcardSetPayload,
  StudyStatus,
} from '@/types/flashcards.type';

const BASE = '/flashcards';

export const flashcardService = {
  // Sets
  getSets: (): Promise<FlashcardSet[]> =>
    api.get(`${BASE}/sets`).then((r) => r.data),

  getSet: (id: string): Promise<FlashcardSet> =>
    api.get(`${BASE}/sets/${id}`).then((r) => r.data),

  createSet: (payload: CreateFlashcardSetPayload): Promise<FlashcardSet> =>
    api.post(`${BASE}/sets`, payload).then((r) => r.data),

  updateSet: (
    id: string,
    payload: Partial<CreateFlashcardSetPayload>,
  ): Promise<FlashcardSet> =>
    api.put(`${BASE}/sets/${id}`, payload).then((r) => r.data),

  deleteSet: (id: string): Promise<void> =>
    api.delete(`${BASE}/sets/${id}`).then((r) => r.data),

  // Study
  recordStudy: (flashcardId: string, status: StudyStatus) =>
    api
      .post(`${BASE}/study/record`, { flashcardId, status })
      .then((r) => r.data),
};