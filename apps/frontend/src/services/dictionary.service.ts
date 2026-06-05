import type { DictionaryEntry, NormalizedEntry, DictionaryResult } from '@/types/dictionary.types';

const BASE = 'https://api.dictionaryapi.dev/api/v2/entries/en';

export const dictionaryService = {
  // ─── Lookup từ qua Free Dictionary API ───────────────────
  lookup: async (word: string): Promise<DictionaryResult> => {
    const clean = word.trim().toLowerCase();
    if (!clean) return { type: 'error', message: 'Empty query' };

    try {
      const res = await fetch(`${BASE}/${encodeURIComponent(clean)}`);

      if (res.status === 404) {
        return { type: 'not_found', word: clean };
      }

      if (!res.ok) {
        return { type: 'error', message: `API error: ${res.status}` };
      }

      const data: DictionaryEntry[] = await res.json();
      return { type: 'success', entries: data };
    } catch {
      return { type: 'error', message: 'Network error. Please try again.' };
    }
  },

  // ─── Normalize data để dễ render ─────────────────────────
  normalize: (entries: DictionaryEntry[]): NormalizedEntry => {
    const first = entries[0];

    // Tìm phonetic text tốt nhất
    const phonetic =
      first.phonetic ??
      first.phonetics.find(p => p.text)?.text ??
      '';

    // Tìm audio URL
    const audioUrl =
      first.phonetics.find(p => p.audio && p.audio.length > 0)?.audio ?? null;

    // Origin từ entry đầu tiên hoặc null
    const origin = first.origin ?? null;

    // Merge meanings từ tất cả entries
    const meaningsMap = new Map<string, {
      definitions: { definition: string; example: string | null }[];
      synonyms: string[];
      antonyms: string[];
    }>();

    entries.forEach(entry => {
      entry.meanings.forEach(m => {
        const pos = m.partOfSpeech;
        if (!meaningsMap.has(pos)) {
          meaningsMap.set(pos, { definitions: [], synonyms: [], antonyms: [] });
        }
        const existing = meaningsMap.get(pos)!;

        m.definitions.slice(0, 4).forEach(d => {
          existing.definitions.push({
            definition: d.definition,
            example: d.example ?? null,
          });
        });

        // Merge synonyms, deduplicate, max 8
        const allSyns = [
          ...(m.synonyms ?? []),
          ...m.definitions.flatMap(d => d.synonyms ?? []),
        ];
        const newSyns = allSyns.filter(s => !existing.synonyms.includes(s));
        existing.synonyms = [...existing.synonyms, ...newSyns].slice(0, 8);

        const allAnts = [
          ...(m.antonyms ?? []),
          ...m.definitions.flatMap(d => d.antonyms ?? []),
        ];
        const newAnts = allAnts.filter(a => !existing.antonyms.includes(a));
        existing.antonyms = [...existing.antonyms, ...newAnts].slice(0, 6);
      });
    });

    return {
      word: first.word,
      phonetic,
      audioUrl,
      origin,
      meanings: Array.from(meaningsMap.entries()).map(([pos, data]) => ({
        pos,
        ...data,
      })),
    };
  },
};
