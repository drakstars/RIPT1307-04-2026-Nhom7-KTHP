import React, { useState, useRef, useEffect, useCallback } from 'react';
import { history } from 'umi';
import { dictionaryService } from '@/services/dictionary.service';
import { useDictionaryAudio } from '@/hooks/useDictionaryAudio';
import type { NormalizedEntry } from '@/types/dictionary.types';
import styles from './index.less';

const DictionaryWidget: React.FC = () => {
  const [open, setOpen]       = useState(false);
  const [query, setQuery]     = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<NormalizedEntry | null>(null);
  const [notFound, setNotFound] = useState(false);

  const wrapRef  = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const { playing, play, stop } = useDictionaryAudio();

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Keyboard shortcut Alt+D
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'd') {
        e.preventDefault();
        setOpen(o => !o);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const lookup = useCallback(async (word: string) => {
    const clean = word.trim();
    if (!clean) return;

    setLoading(true);
    setResult(null);
    setNotFound(false);

    const res = await dictionaryService.lookup(clean);

    if (res.type === 'success') {
      setResult(dictionaryService.normalize(res.entries));
    } else if (res.type === 'not_found') {
      setNotFound(true);
    }

    setLoading(false);
  }, []);

  // Debounce live search
  const handleInput = (value: string) => {
    setQuery(value);
    clearTimeout(timerRef.current);
    if (value.length >= 3) {
      timerRef.current = setTimeout(() => lookup(value), 500);
    } else {
      setResult(null);
      setNotFound(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      clearTimeout(timerRef.current);
      lookup(query);
    }
    if (e.key === 'Escape') setOpen(false);
  };

  const openFullPage = () => {
    if (query.trim()) {
      history.push(`/dictionary?q=${encodeURIComponent(query.trim())}`);
    } else {
      history.push('/dictionary');
    }
    setOpen(false);
  };

  return (
    <div className={styles.wrap} ref={wrapRef}>
      {/* Trigger button */}
      <button
        className={styles.trigger}
        onClick={() => { setOpen(o => !o); setTimeout(() => inputRef.current?.focus(), 50); }}
        title="Dictionary (Alt+D)"
      >
        <span className={styles.triggerIcon}>⌕</span>
        <span className={styles.triggerText}>
          {result ? result.word : 'Dictionary…'}
        </span>
        <span className={styles.kbd}>Alt+D</span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className={styles.panel}>
          {/* Search input */}
          <div className={styles.panelSearch}>
            <input
              ref={inputRef}
              className={styles.panelInp}
              placeholder="Type a word…"
              value={query}
              onChange={e => handleInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className={styles.panelGo}
              onClick={() => { clearTimeout(timerRef.current); lookup(query); }}
            >
              →
            </button>
          </div>

          {/* Content */}
          <div className={styles.panelBody}>
            {loading && (
              <div className={styles.loadingWrap}>
                <div className={styles.skelWord} />
                <div className={styles.skelLine} style={{ width: '70%' }} />
                <div className={styles.skelLine} style={{ width: '85%' }} />
              </div>
            )}

            {!loading && notFound && (
              <div className={styles.noResult}>
                No results for "{query}"
              </div>
            )}

            {!loading && !query && !result && (
              <div className={styles.hint}>
                Type a word and press Enter
              </div>
            )}

            {!loading && result && (
              <div className={styles.resultWrap}>
                <div className={styles.widgetWord}>{result.word}</div>

                <div className={styles.widgetPhRow}>
                  {result.phonetic && (
                    <span className={styles.widgetPh}>{result.phonetic}</span>
                  )}
                  {result.audioUrl && (
                    <button
                      className={`${styles.widgetPlay} ${playing ? styles.widgetPlayOn : ''}`}
                      onClick={() => playing ? stop() : play(result.audioUrl!)}
                    >
                      {playing ? '■' : '▶'}
                    </button>
                  )}
                </div>

                {result.meanings.slice(0, 2).map((m, i) => (
                  <div key={i} className={styles.widgetMeaning}>
                    <span className={styles.widgetPos}>{m.pos}</span>
                    <p className={styles.widgetDef}>{m.definitions[0]?.definition}</p>
                    {m.definitions[0]?.example && (
                      <p className={styles.widgetEx}>"{m.definitions[0].example}"</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={styles.panelFoot}>
            <button className={styles.fullPageBtn} onClick={openFullPage}>
              Open full dictionary →
            </button>
            {result && (
              <button
                className={styles.addBtn}
                onClick={() => {
                  const def = result.meanings[0]?.definitions[0]?.definition ?? '';
                  alert(`Add "${result.word}" to flashcard?\n${def}`);
                }}
              >
                + Flashcard
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DictionaryWidget;
