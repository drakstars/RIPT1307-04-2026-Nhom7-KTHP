export interface Phonetic {
  text?: string;
  audio?: string;
  sourceUrl?: string;
}

export interface Definition {
  definition: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
}

export interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
  synonyms?: string[];
  antonyms?: string[];
}

export interface DictionaryEntry {
  word: string;
  phonetic?: string;
  phonetics: Phonetic[];
  origin?: string;
  meanings: Meaning[];
  sourceUrls?: string[];
}

export type DictionaryResult =
  | { type: 'success'; entries: DictionaryEntry[] }
  | { type: 'not_found'; word: string }
  | { type: 'error'; message: string };

// Kết quả đã normalize để render
export interface NormalizedEntry {
  word: string;
  phonetic: string;
  audioUrl: string | null;
  origin: string | null;
  meanings: {
    pos: string;
    definitions: {
      definition: string;
      example: string | null;
    }[];
    synonyms: string[];
    antonyms: string[];
  }[];
}
