import { api } from './api';

export type VocabularyPayload = {
  word: string;
  meaning: string;
  ipa?: string;
  audioUrl?: string;
  slowAudioUrl?: string;
  example?: string;
  partOfSpeech?: string;
  imageUrl?: string;
  level?: string;
  topic?: string;
  isPublic?: boolean;
};

export const vocabularyService = {
  getAll(params?: { search?: string; topic?: string; level?: string }) {
    return api.get('/vocabularies', { params });
  },

  getRandom() {
    return api.get('/vocabularies/random');
  },

  getRecent(limit?: number) {
    return api.get('/vocabularies/recent', { params: { limit } });
  },

  getStats() {
    return api.get('/vocabularies/stats');
  },

  create(payload: VocabularyPayload) {
    return api.post('/vocabularies', payload);
  },

  update(id: number, payload: VocabularyPayload) {
    return api.patch(`/vocabularies/${id}`, payload);
  },

  remove(id: number) {
    return api.delete(`/vocabularies/${id}`);
  },
};
