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
  getAll() {
    return api.get('/vocabularies');
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
