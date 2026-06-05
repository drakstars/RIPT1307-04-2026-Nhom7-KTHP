import React, { useState, useEffect } from 'react';
import { useNavigate } from 'umi';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { statsService } from '@/services/stats.service';
import { quizService } from '@/services/quiz.service';
import { vocabularyService } from '@/services/vocabulary.service';
import { Modal, Spin, message } from 'antd';
import Heatmap from '@/components/common/Heatmap';
import WeeklyChart from '@/components/common/WeeklyChart';
import StreakCalendar from '@/components/common/StreakCalendar';
import type { SetProgress } from '@/types/stats.types';
import { useTranslation } from '@/hooks/useTranslation';
import styles from './index.less';

const STALE = 60 * 1000; // 60s

// Shuffle utility
const shuffleArray = <T,>(arr: T[]): T[] => {
  const newArr = [...arr];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

const DEFAULT_DOCUMENTS = [
  {
    id: 'IELTS',
    title: 'IELTS Core Vocabulary',
    topic: 'IELTS',
    description: 'A collection of 30 core vocabulary words crucial for the IELTS Academic exam.',
  },
  {
    id: 'TOEIC',
    title: 'TOEIC Common Vocabulary',
    topic: 'TOEIC',
    description: 'A compilation of the 30 most common vocabulary words in corporate & TOEIC communication environments.',
  },
  {
    id: 'TOEFL',
    title: 'TOEFL Academic Vocabulary',
    topic: 'TOEFL',
    description: 'A summary of 30 advanced academic vocabulary words for the TOEFL exam.',
  }
];

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const firstName = user?.email?.split('@')[0] ?? 'there';
  const { t, language } = useTranslation();

  const [documents, setDocuments] = useState<any[]>([]);

  const translateDocTitle = (title: string) => {
    if (language === 'vi') {
      if (title === 'IELTS Core Vocabulary') return 'Từ vựng IELTS cốt lõi';
      if (title === 'TOEIC Common Vocabulary') return 'Từ vựng TOEIC thông dụng';
      if (title === 'TOEFL Academic Vocabulary') return 'Từ vựng TOEFL học thuật';
    }
    return title;
  };

  const translateDocDesc = (desc: string) => {
    if (language === 'vi') {
      if (desc.includes('IELTS')) return 'Bộ sưu tập 30 từ vựng cốt lõi cực kỳ quan trọng cho kỳ thi IELTS Academic.';
      if (desc.includes('TOEIC')) return 'Tổng hợp 30 từ vựng phổ biến nhất trong môi trường giao tiếp doanh nghiệp & TOEIC.';
      if (desc.includes('TOEFL')) return 'Tóm tắt 30 từ vựng học thuật nâng cao cho kỳ thi TOEFL.';
    }
    return desc;
  };

  useEffect(() => {
    const saved = localStorage.getItem('elp_admin_vocab_documents');
    if (saved) {
      try {
        setDocuments(JSON.parse(saved));
      } catch (e) {
        setDocuments(DEFAULT_DOCUMENTS);
      }
    } else {
      setDocuments(DEFAULT_DOCUMENTS);
    }
  }, []);

  // Auto-refresh all dashboard data when navigating back to this page
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['stats-overview'] });
    queryClient.invalidateQueries({ queryKey: ['stats-activity'] });
    queryClient.invalidateQueries({ queryKey: ['stats-weekly'] });
    queryClient.invalidateQueries({ queryKey: ['stats-progress'] });
    queryClient.invalidateQueries({ queryKey: ['stats-streak'] });
    queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    queryClient.invalidateQueries({ queryKey: ['vocab-stats'] });
    queryClient.invalidateQueries({ queryKey: ['vocab-daily'] });
  }, []);

  const { data: overview, isLoading: loadingOverview } = useQuery({
    queryKey: ['stats-overview'],
    queryFn: statsService.getOverview,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const { data: activity } = useQuery({
    queryKey: ['stats-activity'],
    queryFn: statsService.getActivity,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const { data: weekly } = useQuery({
    queryKey: ['stats-weekly'],
    queryFn: statsService.getWeekly,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const { data: progress } = useQuery({
    queryKey: ['stats-progress'],
    queryFn: statsService.getSetProgress,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const { data: streak } = useQuery({
    queryKey: ['stats-streak'],
    queryFn: statsService.getStreak,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const { data: quizzes } = useQuery({
    queryKey: ['quizzes'],
    queryFn: quizService.getAll,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // ─── Vocabulary Hub States & Queries ────────────────────
  const { data: vocabStats } = useQuery({
    queryKey: ['vocab-stats'],
    queryFn: () => vocabularyService.getStats().then(res => res.data),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const { data: dailyWord, refetch: refetchDailyWord } = useQuery({
    queryKey: ['vocab-daily'],
    queryFn: () => vocabularyService.getRandom().then(res => res.data),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Search function for quick lookup
  const handleSearchChange = async (val: string) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const response = await vocabularyService.getAll({ search: val.trim() });
      setSearchResults(response.data || []);
    } catch (err) {
      console.error(err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Text to Speech
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    } else {
      message.warning('Your browser does not support speech synthesis.');
    }
  };

  // Modal Study state
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedTopicName, setSelectedTopicName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [topicWords, setTopicWords] = useState<any[]>([]);
  const [loadingWords, setLoadingWords] = useState(false);
  const [modalTab, setModalTab] = useState<'list' | 'flashcards' | 'quiz'>('list');
  const [listSearch, setListSearch] = useState('');

  // Flashcards state
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Quiz state
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);

  // Open modal and fetch topic words
  const openStudyModal = async (topic: string, name: string) => {
    setSelectedTopic(topic);
    setSelectedTopicName(name);
    setIsModalOpen(true);
    setLoadingWords(true);
    setModalTab('list');
    setListSearch('');
    try {
      const response = await vocabularyService.getAll({ topic });
      const words = response.data || [];
      setTopicWords(words);
      
      // Initialize Flashcard
      setCardIndex(0);
      setIsFlipped(false);

      // Initialize Quiz questions
      if (words.length >= 4) {
        const questions = generateQuizQuestions(words);
        setQuizQuestions(questions);
        setQuizIndex(0);
        setQuizScore(0);
        setQuizFinished(false);
      }
    } catch (err) {
      console.error(err);
      message.error('Could not load vocabulary list.');
    } finally {
      setLoadingWords(false);
    }
  };

  // Generate Quiz Questions
  const generateQuizQuestions = (words: any[]) => {
    const shuffled = shuffleArray(words);
    const selected = shuffled.slice(0, 5); // 5 questions

    return selected.map((qWord) => {
      const correct = qWord.meaning;
      const distractors = words
        .filter((w) => w.word !== qWord.word)
        .map((w) => w.meaning);
      const shuffledDistractors = shuffleArray(distractors);
      const chosenDistractors = shuffledDistractors.slice(0, 3);
      const options = shuffleArray([correct, ...chosenDistractors]);

      return {
        word: qWord.word,
        ipa: qWord.ipa,
        partOfSpeech: qWord.partOfSpeech,
        correctAnswer: correct,
        options,
        selectedOption: null,
        isSubmitted: false,
      };
    });
  };

  const handleQuizAnswer = (option: string) => {
    if (quizQuestions[quizIndex].isSubmitted) return;

    const updated = [...quizQuestions];
    updated[quizIndex].selectedOption = option;
    updated[quizIndex].isSubmitted = true;
    setQuizQuestions(updated);

    if (option === updated[quizIndex].correctAnswer) {
      setQuizScore(prev => prev + 1);
    }
  };

  const nextQuizQuestion = () => {
    if (quizIndex < quizQuestions.length - 1) {
      setQuizIndex(prev => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const resetQuiz = () => {
    if (topicWords.length >= 4) {
      const questions = generateQuizQuestions(topicWords);
      setQuizQuestions(questions);
      setQuizIndex(0);
      setQuizScore(0);
      setQuizFinished(false);
    }
  };

  const getHour = () => {
    const h = new Date().getHours();
    if (h < 12) return t('goodMorning');
    if (h < 18) return t('goodAfternoon');
    return t('goodEvening');
  };

  if (loadingOverview) {
    return (
      <div className={styles.centered}>
        <div style={{ width: 24, height: 24, border: '2px solid #242428', borderTopColor: '#E8FF57', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
      </div>
    );
  }

  // Filter word list locally
  const filteredWords = topicWords.filter(w => 
    w.word.toLowerCase().includes(listSearch.toLowerCase()) || 
    w.meaning.toLowerCase().includes(listSearch.toLowerCase())
  );

  return (
    <div className={styles.pg}>
      {/* Header */}
      <div className={styles.top}>
        <div>
          <h1 className={styles.greeting}>{getHour()}, {firstName}.</h1>
          <p className={styles.greetingSub}>
            {streak?.current
              ? `${streak.current} ${t('dayStreakKeepItUp')}`
              : t('startLearningBuildStreak')}
          </p>
        </div>
        <div className={styles.topActions}>
          <button className={styles.btnSecondary} onClick={() => navigate('/quiz/create')}>
            {t('createQuiz')}
          </button>
          <button className={styles.btnPrimary} onClick={() => navigate('/flashcards/create')}>
            {t('newDeck')}
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className={styles.kpis}>
        <div className={styles.kpi}>
          <div className={styles.kpiLabel}>{t('cardsStudied')}</div>
          <div className={styles.kpiVal}>{overview?.totalStudied ?? 0}</div>
          <div className={`${styles.kpiDelta} ${(overview?.weekDelta ?? 0) > 0 ? styles.up : ''}`}>
            {(overview?.weekDelta ?? 0) > 0 ? '↑' : '→'} {overview?.thisWeek ?? 0} {language === 'vi' ? 'tuần này' : 'this week'}
          </div>
        </div>
        <div className={styles.kpi}>
          <div className={styles.kpiLabel}>{t('retentionRate')}</div>
          <div className={`${styles.kpiVal} ${styles.green}`}>{overview?.knownRate ?? 0}%</div>
          <div className={styles.kpiDelta}>{overview?.knownCount ?? 0} {language === 'vi' ? 'thẻ thành thạo' : 'cards mastered'}</div>
        </div>
        <div className={styles.kpi}>
          <div className={styles.kpiLabel}>{t('currentStreak')}</div>
          <div className={`${styles.kpiVal} ${styles.accent}`}>{streak?.current ?? 0} {language === 'vi' ? 'ngày' : 'days'}</div>
          <div className={styles.kpiDelta}>{language === 'vi' ? 'Tốt nhất' : 'Best'}: {streak?.best ?? 0} {language === 'vi' ? 'ngày' : 'days'}</div>
        </div>
        <div className={styles.kpi}>
          <div className={styles.kpiLabel}>{t('avgQuizScore')}</div>
          <div className={`${styles.kpiVal} ${styles.warn}`}>{overview?.quizAvg ?? 0}%</div>
          <div className={styles.kpiDelta}>{overview?.quizAttemptCount ?? 0} {t('attempts')}</div>
        </div>

      </div>

      {/* Heatmap + Weekly */}
      <div className={styles.twoCol}>
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>{t('activityLast30Days')}</span>
            <span className={styles.badge}>{overview?.totalStudied ?? 0} {t('cardsTotal')}</span>
          </div>
          {activity ? <Heatmap data={activity} /> : <div className={styles.skelSmall} />}
        </div>

        <div className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>{t('thisWeek')}</span>
            <span className={styles.muted}>{t('cardsDay')}</span>
          </div>
          {weekly ? <WeeklyChart data={weekly} /> : <div className={styles.skelSmall} />}
        </div>
      </div>

      {/* Progress + Streak */}
      <div className={styles.twoCol}>
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>{t('deckProgress')}</span>
            <span
              className={styles.link}
              onClick={() => navigate('/flashcards')}
            >
              {t('viewAll')}
            </span>
          </div>
          <div className={styles.progressList}>
            {(progress ?? []).slice(0, 4).map((set: SetProgress) => (
              <div
                key={set.id}
                className={styles.progressRow}
                onClick={() => navigate(`/flashcards/${set.id}/study`)}
              >
                <div className={styles.progressTop}>
                  <span className={styles.progressName}>{set.title}</span>
                  <span className={styles.progressPct}>{set.knownPct}% {t('mastered')}</span>
                </div>
                <div className={styles.barWrap}>
                  <div className={styles.barKnown} style={{ width: `${set.knownPct}%` }} />
                  <div
                    className={styles.barReview}
                    style={{ width: `${set.reviewPct}%`, left: `${set.knownPct}%` }}
                  />
                </div>
                <div className={styles.progressFoot}>
                  <span className={styles.progressStat}>
                    <span className={styles.dotGreen} />{set.known} {t('mastered')}
                  </span>
                  <span className={styles.progressStat}>
                    <span className={styles.dotWarn} />{set.needReview} {t('review')}
                  </span>
                  <span className={styles.progressStat}>
                    <span className={styles.dotMuted} />{set.unstudied} {t('new')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          {streak ? (
            <StreakCalendar
              days={streak.lastThirtyDays}
              current={streak.current}
              best={streak.best}
            />
          ) : (
            <div className={styles.skelSmall} />
          )}
        </div>
      </div>

      {/* ─── VOCABULARY LEARNING HUB ───────────────────────────── */}
      <div className={styles.vocabSection}>
        <div className={styles.vocabSectionHeader}>
          <h2 className={styles.vocabSectionTitle}>{t('vocabHub')}</h2>
          <p className={styles.vocabSectionSub}>{t('vocabHubSub')}</p>
        </div>

        <div className={styles.vocabGrid}>
          {/* Cột trái: Từ vựng ngẫu nhiên + Tra cứu nhanh */}
          <div className={styles.vocabColLeft}>
            {/* Daily Word */}
            <div className={styles.vocabSubCard}>
              <div className={styles.vocabSubCardHead}>
                <span className={styles.vocabSubCardTitle}>{t('dailyRandomWord')}</span>
                <button className={styles.refreshBtn} onClick={() => refetchDailyWord()} title="Load another word">
                  {t('newWord')}
                </button>
              </div>
              {dailyWord ? (
                <div className={styles.dailyWordContainer}>
                  <div className={styles.dailyWordHeader}>
                    <h3 className={styles.dailyWordText}>{dailyWord.word}</h3>
                    <span className={styles.dailyWordType}>{dailyWord.partOfSpeech}</span>
                    {dailyWord.ipa && <span className={styles.dailyWordIpa}>{dailyWord.ipa}</span>}
                    <button className={styles.audioBtn} onClick={() => speak(dailyWord.word)} title="Listen">
                      🔊 {language === 'vi' ? 'Nghe' : 'Listen'}
                    </button>
                  </div>
                  <div className={styles.dailyWordDetail}>
                    <p className={styles.dailyWordMeaning}>
                      <strong>{language === 'vi' ? 'Nghĩa' : 'Meaning'}:</strong> {dailyWord.meaning}
                    </p>
                    {dailyWord.example && (
                      <p className={styles.dailyWordExample}>
                        <strong>{language === 'vi' ? 'Ví dụ' : 'Example'}:</strong> <em>"{dailyWord.example}"</em>
                      </p>
                    )}
                  </div>
                  <span className={styles.dailyWordTopicBadge}>{language === 'vi' ? 'Bộ' : 'Set'}: {dailyWord.topic}</span>
                </div>
              ) : (
                <div className={styles.vocabSkeleton} />
              )}
            </div>

            {/* Quick Search */}
            <div className={styles.vocabSubCard}>
              <div className={styles.vocabSubCardHead}>
                <span className={styles.vocabSubCardTitle}>{t('quickSearch')}</span>
              </div>
              <div className={styles.searchBoxWrap}>
                <input
                  type="text"
                  className={styles.searchBoxInp}
                  placeholder={t('enterWordSearch')}
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
                {searchQuery && (
                  <button className={styles.searchBoxClear} onClick={() => handleSearchChange('')}>
                    ×
                  </button>
                )}
              </div>

              <div className={styles.searchResultsArea}>
                {isSearching ? (
                  <div className={styles.searchStateText}><Spin size="small" /> {t('searching')}</div>
                ) : searchQuery && searchResults.length > 0 ? (
                  <div className={styles.searchResultsContainer}>
                    {searchResults.map((w: any) => (
                      <div key={w.id} className={styles.resultRow}>
                        <div className={styles.resultRowHeader}>
                          <span className={styles.resultWord}>{w.word}</span>
                          <span className={styles.resultPos}>({w.partOfSpeech})</span>
                          {w.ipa && <span className={styles.resultIpa}>{w.ipa}</span>}
                          <button className={styles.resultAudioBtn} onClick={() => speak(w.word)}>
                            🔊
                          </button>
                        </div>
                        <p className={styles.resultMeaning}>{w.meaning}</p>
                        {w.example && (
                          <p className={styles.resultExample}><em>Ex: "{w.example}"</em></p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : searchQuery ? (
                  <div className={styles.searchStateText}>
                    {language === 'vi' ? `Không tìm thấy "${searchQuery}" trong 3 bộ từ vựng.` : `Could not find "${searchQuery}" in the 3 vocabulary sets.`}
                    <button
                      className={styles.dictionaryLink}
                      onClick={() => navigate(`/dictionary?q=${encodeURIComponent(searchQuery)}`)}
                    >
                      {language === 'vi' ? 'Tra từ điển đầy đủ ↗' : 'Search full dictionary ↗'}
                    </button>
                  </div>
                ) : (
                  <div className={styles.searchStateText}>{t('searchStateTextDefault')}</div>
                )}
              </div>
            </div>
          </div>

          {/* Cột phải: bộ tài liệu từ vựng */}
          <div className={styles.vocabColRight}>
            <div className={styles.vocabSubCard} style={{ height: '100%' }}>
              <div className={styles.vocabSubCardHead}>
                <span className={styles.vocabSubCardTitle}>
                  {documents.length} {language === 'vi' ? 'Bộ từ vựng chuẩn hóa' : 'Integrated Vocabulary Sets'}
                </span>
              </div>
              <div className={styles.topicsGrid}>
                {documents.map((doc) => {
                  const badgeClass =
                    doc.topic.toLowerCase() === 'ielts' ? styles.ieltsTheme :
                    doc.topic.toLowerCase() === 'toeic' ? styles.toeicTheme :
                    doc.topic.toLowerCase() === 'toefl' ? styles.toeflTheme :
                    styles.customTheme;

                  const count = vocabStats?.topics?.find((t: any) => t.topic === doc.topic)?.count ?? 0;

                  return (
                    <div
                      key={doc.id}
                      className={`${styles.topicCard} ${badgeClass}`}
                      onClick={() => openStudyModal(doc.topic, doc.title)}
                    >
                      <div className={styles.topicCardHeader}>
                        <span className={styles.topicBadge}>{doc.topic}</span>
                        <span className={styles.topicCount}>{count} {language === 'vi' ? 'từ' : 'words'}</span>
                      </div>
                      <h4 className={styles.topicTitle}>{translateDocTitle(doc.title)}</h4>
                      <p className={styles.topicDesc}>{translateDocDesc(doc.description)}</p>
                      <div className={styles.topicActionFooter}>
                        {language === 'vi' ? 'Bắt đầu ôn tập & luyện tập →' : 'Open review & practice →'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz history */}
      <div>
        <div className={styles.cardHead} style={{ marginBottom: 10 }}>
          <span className={styles.cardTitle}>{t('quizHistory')}</span>
          <span className={styles.link} onClick={() => navigate('/quiz')}>{t('viewAll')}</span>
        </div>
        <div className={styles.histCard}>
          {(quizzes ?? [])
            .filter(q => (q._count?.attempts ?? 0) > 0)
            .slice(0, 5)
            .map(quiz => {
              const last = quiz.attempts?.[0];
              if (!last) return null;
              const pct = Math.round((last.score / last.totalQ) * 100);
              const cls = pct >= 80 ? styles.histGreen : pct >= 60 ? styles.histWarn : styles.histRed;

              return (
                <div
                  key={quiz.id}
                  className={styles.histRow}
                  onClick={() => navigate(`/quiz/${quiz.id}/result`)}
                >
                  <div className={`${styles.histScore} ${cls}`}>{pct}%</div>
                  <div className={styles.histInfo}>
                    <div className={styles.histName}>{quiz.title}</div>
                    <div className={styles.histMeta}>{last.score}/{last.totalQ} {language === 'vi' ? 'đúng' : 'correct'}</div>
                  </div>
                  <div className={styles.histTime}>
                    {new Date(last.completedAt).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
                      day: 'numeric', month: 'numeric',
                    })}
                  </div>
                </div>
              );
            })}
          {!(quizzes ?? []).some(q => (q._count?.attempts ?? 0) > 0) && (
            <div className={styles.emptyHist}>
              {t('noQuizAttemptsYet')}
              <span onClick={() => navigate('/quiz/create')}>{t('takeYourFirstQuiz')}</span>
            </div>
          )}
        </div>
      </div>

      {/* ─── INTERACTIVE VOCABULARY STUDY MODAL ───────────────── */}
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        title={null}
        footer={null}
        width={720}
        centered
        styles={{
          content: { background: '#141416', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', padding: 0 },
        }}
      >
        <div className={styles.modalContainer}>
          {/* Header */}
          <div className={styles.modalHeader}>
            <div className={styles.modalTitleBlock}>
              <h3 className={styles.modalMainTitle}>{selectedTopicName}</h3>
              <span className={styles.modalSubTitle}>Standardized Vocabulary Program</span>
            </div>
            
            {/* Tabs selector */}
            <div className={styles.modalTabs}>
              <button
                className={`${styles.modalTabBtn} ${modalTab === 'list' ? styles.activeTab : ''}`}
                onClick={() => setModalTab('list')}
              >
                Word List
              </button>
              <button
                className={`${styles.modalTabBtn} ${modalTab === 'flashcards' ? styles.activeTab : ''}`}
                onClick={() => {
                  setModalTab('flashcards');
                  setCardIndex(0);
                  setIsFlipped(false);
                }}
              >
                Flashcards
              </button>
              <button
                className={`${styles.modalTabBtn} ${modalTab === 'quiz' ? styles.activeTab : ''}`}
                onClick={() => {
                  setModalTab('quiz');
                  resetQuiz();
                }}
              >
                Quick Quiz
              </button>
            </div>
          </div>

          {/* Body */}
          <div className={styles.modalBodyContent}>
            {loadingWords ? (
              <div className={styles.modalSpinner}>
                <Spin tip="Loading data..." />
              </div>
            ) : (
              <>
                {/* TAB 1: WORD LIST */}
                {modalTab === 'list' && (
                  <div className={styles.tabContentList}>
                    <div className={styles.listToolbar}>
                      <input
                        type="text"
                        placeholder="Search word or meaning in list..."
                        className={styles.listSearchInp}
                        value={listSearch}
                        onChange={(e) => setListSearch(e.target.value)}
                      />
                      {listSearch && (
                        <button className={styles.listSearchClear} onClick={() => setListSearch('')}>
                          ×
                        </button>
                      )}
                    </div>

                    <div className={styles.wordRowsList}>
                      {filteredWords.length > 0 ? (
                        filteredWords.map((w: any, index: number) => (
                          <div key={w.id} className={styles.wordItemRow}>
                            <div className={styles.wordItemMain}>
                              <div className={styles.wordItemLeft}>
                                <span className={styles.wordIndex}>#{index + 1}</span>
                                <strong className={styles.wordText}>{w.word}</strong>
                                <span className={styles.wordPos}>({w.partOfSpeech})</span>
                                {w.ipa && <span className={styles.wordIpa}>{w.ipa}</span>}
                                <button className={styles.speakerBtnSmall} onClick={() => speak(w.word)}>
                                  🔊
                                </button>
                              </div>
                              <span className={styles.wordMeaning}>{w.meaning}</span>
                            </div>
                            {w.example && (
                              <p className={styles.wordExample}>
                                <strong>Example:</strong> <em>"{w.example}"</em>
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className={styles.emptyListText}>No vocabulary matches your search.</div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 2: FLASHCARDS */}
                {modalTab === 'flashcards' && topicWords.length > 0 && (
                  <div className={styles.tabContentFlashcard}>
                    <div className={styles.flashcardContainer}>
                      <div 
                        className={styles.flashcardWrap} 
                        onClick={() => setIsFlipped(prev => !prev)}
                      >
                        <div className={`${styles.flashcardInner} ${isFlipped ? styles.flipped : ''}`}>
                          {/* Front (English) */}
                          <div className={styles.flashcardFront}>
                            <span className={styles.fcTypeBadge}>{topicWords[cardIndex]?.partOfSpeech}</span>
                            <h2 className={styles.fcWord}>{topicWords[cardIndex]?.word}</h2>
                            {topicWords[cardIndex]?.ipa && (
                              <span className={styles.fcIpa}>{topicWords[cardIndex]?.ipa}</span>
                            )}
                            <button 
                              className={styles.fcAudioBtn} 
                              onClick={(e) => {
                                  e.stopPropagation(); // Prevent flip
                                  speak(topicWords[cardIndex]?.word);
                                }}
                            >
                              🔊 Listen
                            </button>
                            <span className={styles.fcHint}>Click to flip and view meaning</span>
                          </div>

                          {/* Back (Meaning & Example) */}
                          <div className={styles.flashcardBack}>
                            <span className={styles.fcBackTitle}>Meaning</span>
                            <h3 className={styles.fcMeaning}>{topicWords[cardIndex]?.meaning}</h3>
                            {topicWords[cardIndex]?.example && (
                              <p className={styles.fcExample}>
                                <strong>Example:</strong> <em>"{topicWords[cardIndex]?.example}"</em>
                              </p>
                            )}
                            <span className={styles.fcHint}>Click to flip back</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Navigation */}
                    <div className={styles.flashcardNav}>
                      <button 
                        className={styles.navBtn}
                        onClick={() => {
                          setIsFlipped(false);
                          setCardIndex(prev => (prev === 0 ? topicWords.length - 1 : prev - 1));
                        }}
                      >
                        &larr; Previous
                      </button>
                      <span className={styles.navProgress}>
                        Word {cardIndex + 1} of {topicWords.length}
                      </span>
                      <button 
                        className={styles.navBtn}
                        onClick={() => {
                          setIsFlipped(false);
                          setCardIndex(prev => (prev === topicWords.length - 1 ? 0 : prev + 1));
                        }}
                      >
                        Next Word &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 3: QUIZ PRACTICE */}
                {modalTab === 'quiz' && (
                  <div className={styles.tabContentQuiz}>
                    {quizQuestions.length === 0 ? (
                      <div className={styles.quizError}>At least 4 words in this set are required to generate a quiz.</div>
                    ) : quizFinished ? (
                      <div className={styles.quizFinishCard}>
                        <div className={styles.quizScoreCircle}>
                          <span className={styles.scoreNum}>{quizScore}</span>
                          <span className={styles.scoreDenom}>/5</span>
                        </div>
                        <h3 className={styles.quizFinishTitle}>Practice Completed!</h3>
                        <p className={styles.quizFinishText}>
                          You answered <strong>{quizScore}/5</strong> questions correctly in {selectedTopicName}.
                        </p>
                        <button className={styles.retryBtn} onClick={resetQuiz}>
                          Practice again ↻
                        </button>
                      </div>
                    ) : (
                      <div className={styles.quizPlayCard}>
                        <div className={styles.quizPlayHeader}>
                          <span className={styles.quizProgressText}>Question {quizIndex + 1}/5</span>
                          <span className={styles.quizCorrectCounter}>Correct: {quizScore}</span>
                        </div>
                        
                        <div className={styles.quizQuestionBox}>
                          <span className={styles.quizQuestionLabel}>Select the correct meaning of:</span>
                          <h2 className={styles.quizQuestionWord}>{quizQuestions[quizIndex]?.word}</h2>
                          <div className={styles.quizWordMeta}>
                            <span className={styles.quizWordPos}>({quizQuestions[quizIndex]?.partOfSpeech})</span>
                            {quizQuestions[quizIndex]?.ipa && <span className={styles.quizWordIpa}>{quizQuestions[quizIndex]?.ipa}</span>}
                            <button className={styles.speakerBtnSmall} onClick={() => speak(quizQuestions[quizIndex]?.word)}>
                              🔊
                            </button>
                          </div>
                        </div>

                        <div className={styles.quizOptionsGrid}>
                          {quizQuestions[quizIndex]?.options.map((opt: string) => {
                            const isSubmitted = quizQuestions[quizIndex].isSubmitted;
                            const isSelected = quizQuestions[quizIndex].selectedOption === opt;
                            const isCorrect = quizQuestions[quizIndex].correctAnswer === opt;
                            
                            let btnStyle = '';
                            if (isSubmitted) {
                              if (isCorrect) btnStyle = styles.optCorrect;
                              else if (isSelected) btnStyle = styles.optWrong;
                              else btnStyle = styles.optDisabled;
                            } else {
                              btnStyle = styles.optActive;
                            }

                            return (
                              <button
                                key={opt}
                                className={`${styles.quizOptionBtn} ${btnStyle}`}
                                onClick={() => handleQuizAnswer(opt)}
                                disabled={isSubmitted}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>

                        {quizQuestions[quizIndex]?.isSubmitted && (
                          <div className={styles.quizFeedbackArea}>
                            <p className={styles.quizAnswerFeedback}>
                              {quizQuestions[quizIndex].selectedOption === quizQuestions[quizIndex].correctAnswer ? (
                                <span className={styles.fbCorrect}>✓ Perfect! Correct answer.</span>
                              ) : (
                                <span className={styles.fbWrong}>
                                  ✗ Incorrect! The correct meaning is: <strong>{quizQuestions[quizIndex].correctAnswer}</strong>.
                                </span>
                              )}
                            </p>
                            <button className={styles.quizNextBtn} onClick={nextQuizQuestion}>
                              {quizIndex === quizQuestions.length - 1 ? 'Finish Quiz' : 'Next Question →'}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DashboardPage;