import { useState } from 'react';

const STORAGE_KEY = 'elp-dict-history';
const MAX_ITEMS = 10;

export function useDictionaryHistory() {
  const [history, setHistory] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const add = (word: string) => {
    setHistory(prev => {
      const clean = word.toLowerCase().trim();
      if (!clean) return prev;
      const next = [clean, ...prev.filter(w => w !== clean)].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const clear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
  };

  return { history, add, clear };
}
