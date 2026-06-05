import React, { useState, useCallback, useEffect } from 'react';
import { useLocation, history } from 'umi';
import { Spin } from 'antd';
import { dictionaryService } from '@/services/dictionary.service';
import { useDictionaryHistory } from '@/hooks/useDictionaryHistory';
import { useDictionaryAudio } from '@/hooks/useDictionaryAudio';
import type { NormalizedEntry } from '@/types/dictionary.types';
import { useTranslation } from '@/hooks/useTranslation';
import styles from './index.less';

const DictionaryPage: React.FC = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const [query, setQuery]   = useState(params.get('q') ?? '');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<NormalizedEntry | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const { history: searchHistory, add: addHistory } = useDictionaryHistory();
  const { playing, play, stop } = useDictionaryAudio();
  const { t } = useTranslation();

  const lookup = useCallback(async (word: string) => {
    const clean = word.trim();
    if (!clean) return;

    // Update URL
    history.replace(`/dictionary?q=${encodeURIComponent(clean)}`);

    setLoading(true);
    setResult(null);
    setNotFound(false);
    setError(null);

    const res = await dictionaryService.lookup(clean);

    if (res.type === 'success') {
      const normalized = dictionaryService.normalize(res.entries);
      setResult(normalized);
      addHistory(clean);
    } else if (res.type === 'not_found') {
      setNotFound(true);
    } else {
      setError(res.message);
    }

    setLoading(false);
  }, [addHistory]);

  // Auto-search từ URL param
  useEffect(() => {
    const q = params.get('q');
    if (q) lookup(q);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') lookup(query);
  };

  return (
    <div className={styles.pg}>
      <div className={styles.head}>
        <h1 className={styles.title}>{t('dictTitle')}</h1>
        <p className={styles.sub}>{t('dictSub')}</p>
      </div>

      {/* Search bar */}
      <div className={styles.searchBar}>
        <div className={styles.searchWrap}>
          <input
            className={styles.searchInp}
            placeholder={t('searchWordPlaceholder')}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          {query && (
            <button
              className={styles.clearBtn}
              onClick={() => { setQuery(''); setResult(null); setNotFound(false); }}
            >
              ×
            </button>
          )}
        </div>
        <button className={styles.searchBtn} onClick={() => lookup(query)}>
          {t('lookUpBtn')}
        </button>
      </div>

      {/* Search history */}
      {searchHistory.length > 0 && (
        <div className={styles.historySection}>
          <div className={styles.historyLabel}>{t('recentSearchesLabel')}</div>
          <div className={styles.historyChips}>
            {searchHistory.map(w => (
              <button
                key={w}
                className={styles.historyChip}
                onClick={() => { setQuery(w); lookup(w); }}
              >
                {w}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className={styles.loadingCard}>
          <div className={styles.skeletonWord} />
          <div className={styles.skeletonPhone} />
          <div style={{ height: 1, background: 'rgba(255,255,255,.06)', margin: '16px 0' }} />
          <div className={styles.skeletonLine} style={{ width: '70%' }} />
          <div className={styles.skeletonLine} style={{ width: '85%' }} />
          <div className={styles.skeletonLine} style={{ width: '50%' }} />
        </div>
      )}

      {/* Not found */}
      {!loading && notFound && (
        <div className={styles.notFound}>
          <div className={styles.nfIcon}>⌕</div>
          <div className={styles.nfTitle}>{t('noResultsFor').replace('{query}', query)}</div>
          <div className={styles.nfSub}>{t('checkSpellingSub')}</div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className={styles.errorCard}>{error}</div>
      )}

      {/* Result */}
      {!loading && result && (
        <div className={styles.resultCard}>
          {/* Header */}
          <div className={styles.resultHead}>
            <h2 className={styles.resultWord}>{result.word}</h2>

            <div className={styles.phoneticRow}>
              {result.phonetic && (
                <span className={styles.phonetic}>{result.phonetic}</span>
              )}
              {result.audioUrl && (
                <button
                  className={`${styles.playBtn} ${playing ? styles.playBtnPlaying : ''}`}
                  onClick={() => playing ? stop() : play(result.audioUrl!)}
                  title={playing ? 'Stop' : 'Listen to pronunciation'}
                >
                  {playing ? '■' : '▶'}
                </button>
              )}
            </div>

            {result.origin && (
              <p className={styles.origin}>{t('originLabel')}: {result.origin}</p>
            )}
          </div>

          {/* Meanings */}
          <div className={styles.meanings}>
            {result.meanings.map((m, mi) => (
              <div key={mi} className={styles.meaningBlock}>
                <span className={styles.posBadge}>{m.pos}</span>

                <div className={styles.defList}>
                  {m.definitions.map((d, di) => (
                    <div key={di} className={styles.defItem}>
                      <span className={styles.defNum}>{di + 1}.</span>
                      <div className={styles.defBody}>
                        <p className={styles.defText}>{d.definition}</p>
                        {d.example && (
                          <p className={styles.defExample}>"{d.example}"</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {m.synonyms.length > 0 && (
                  <div className={styles.wordList}>
                    <span className={styles.wordListLabel}>{t('synonymsLabel')}</span>
                    {m.synonyms.map(s => (
                      <button
                        key={s}
                        className={styles.wordChip}
                        onClick={() => { setQuery(s); lookup(s); }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                {m.antonyms.length > 0 && (
                  <div className={styles.wordList}>
                    <span className={styles.wordListLabel}>{t('antonymsLabel')}</span>
                    {m.antonyms.map(a => (
                      <button
                        key={a}
                        className={styles.wordChip}
                        onClick={() => { setQuery(a); lookup(a); }}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className={styles.resultFoot}>
            <a
              href={`https://en.wiktionary.org/wiki/${result.word}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.sourceLink}
            >
              {t('viewOnWiktionary')}
            </a>
            <button
              className={styles.addFlashBtn}
              onClick={() => {
                // Tích hợp với FlashcardService — tạo flashcard từ kết quả tra
                const def = result.meanings[0]?.definitions[0]?.definition ?? '';
                alert(t('addWordConfirm').replace('{word}', result.word).replace('{def}', def));
              }}
            >
              {t('addToFlashcardBtn')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DictionaryPage;
