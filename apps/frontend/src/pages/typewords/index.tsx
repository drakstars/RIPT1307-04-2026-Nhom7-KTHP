import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'umi';
import { Modal, Progress, message, Input } from 'antd';
import { statsService } from '@/services/stats.service';
import { useTranslation } from '@/hooks/useTranslation';
import styles from './index.less';

const { TextArea } = Input;

// Default books data
const DEFAULT_BOOKS = [
  {
    id: 'sample_essays',
    name: 'Sample English Essays',
    description: 'A collection of inspiring and useful sample English essays for you to practice typing and expand your vocabulary.',
    category: 'Writing Practice',
    tags: ['Sample Essay'],
    coverGradient: 'linear-gradient(135deg, #E8FF57 0%, #39A8FF 100%)',
    articles: [
      {
        id: 'se_1',
        title: 'The Art of Reading',
        titleTranslate: 'Nghệ thuật Đọc sách',
        text: 'Reading is not just a way to pass time. It is a journey into different worlds and minds. Through books, we can learn from the greatest thinkers. We can understand history and imagine the future.',
        textTranslate: 'Đọc sách không chỉ là một cách để giết thời gian. Nó là một chuyến hành trình đi vào những thế giới và tâm trí khác nhau. Thông qua những cuốn sách, chúng ta có thể học hỏi từ những nhà tư tưởng vĩ đại nhất. Chúng ta có thể hiểu được lịch sử và tưởng tượng ra tương lai.'
      },
      {
        id: 'se_2',
        title: 'The Power of Typing',
        titleTranslate: 'Sức mạnh của việc Luyện gõ phím',
        text: 'Typing is a critical skill in the digital age. It connects our thoughts directly to the screen. With practice, typing becomes a natural extension of our hands. Your muscle memory will guide your fingers without effort.',
        textTranslate: 'Gõ phím là một kỹ năng quan trọng trong thời đại kỹ thuật số. Nó kết nối suy nghĩ của chúng ta trực tiếp với màn hình máy tính. Nhờ luyện tập, việc gõ phím trở thành một phần mở rộng tự nhiên của đôi bàn tay. Trí nhớ cơ bắp của bạn sẽ tự động dẫn đường cho những ngón tay mà không cần nỗ lực.'
      },
      {
        id: 'se_3',
        title: 'Continuous Learning',
        titleTranslate: 'Học tập Không ngừng',
        text: 'Learning is a lifelong process that never ends. Every day is an opportunity to acquire new knowledge. Embrace mistakes as they are steps toward improvement. Consistency is the key to mastering any new skill.',
        textTranslate: 'Học tập là một quá trình suốt đời không bao giờ kết thúc. Mỗi ngày là một cơ hội để tích lũy thêm kiến thức mới. Hãy đón nhận những lỗi sai vì chúng là những bước tiến giúp bạn tiến bộ. Sự kiên trì đều đặn chính là chìa khóa để thành thạo bất kỳ kỹ năng mới nào.'
      }
    ]
  }
];

// Custom keyboard click sounds using Web Audio API
const playClickSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800 + Math.random() * 400, ctx.currentTime);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch (e) {
    console.error(e);
  }
};

const playErrorSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch (e) {
    console.error(e);
  }
};

// Map physical key codes (e.code) to English characters for Telex/IME fallback
const getCharFromCode = (e: KeyboardEvent): string => {
  if (e.code.startsWith('Key')) {
    const letter = e.code.slice(3);
    return e.shiftKey ? letter.toUpperCase() : letter.toLowerCase();
  }
  if (e.code.startsWith('Digit')) {
    const digit = e.code.slice(5);
    if (e.shiftKey) {
      const shiftDigits: Record<string, string> = {
        '1': '!', '2': '@', '3': '#', '4': '$', '5': '%',
        '6': '^', '7': '&', '8': '*', '9': '(', '0': ')'
      };
      return shiftDigits[digit] || digit;
    }
    return digit;
  }
  if (e.code === 'Space') return ' ';
  if (e.code === 'Period') return e.shiftKey ? '>' : '.';
  if (e.code === 'Comma') return e.shiftKey ? '<' : ',';
  if (e.code === 'Slash') return e.shiftKey ? '?' : '/';
  if (e.code === 'Minus') return e.shiftKey ? '_' : '-';
  if (e.code === 'Equal') return e.shiftKey ? '+' : '=';
  if (e.code === 'Semicolon') return e.shiftKey ? ':' : ';';
  if (e.code === 'Quote') return e.shiftKey ? '"' : "'";
  return e.key;
};

const TypeWordsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useTranslation();

  // Navigation states
  const [view, setView] = useState<'list' | 'detail' | 'practice'>('list');
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);

  // Books lists
  const [books, setBooks] = useState<any[]>([]);
  const [customBooks, setCustomBooks] = useState<any[]>([]);

  // Weekly stats
  const [studyTimeToday, setStudyTimeToday] = useState(0); // in seconds
  const [totalStudyTime, setTotalStudyTime] = useState(0); // in seconds
  const [totalDaysStudied, setTotalDaysStudied] = useState(1);
  const [weeklyActivity, setWeeklyActivity] = useState<boolean[]>([false, false, false, false, false, false, false]);

  // Modals
  const [createBookOpen, setCreateBookOpen] = useState(false);
  const [editBookOpen, setEditBookOpen] = useState(false);
  const [editingBookId, setEditingBookId] = useState<string>('');
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookDesc, setNewBookDesc] = useState('');

  const [addArticleOpen, setAddArticleOpen] = useState(false);
  const [editArticleOpen, setEditArticleOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [newArticleTitle, setNewArticleTitle] = useState('');
  const [newArticleTitleVi, setNewArticleTitleVi] = useState('');
  const [newArticleText, setNewArticleText] = useState('');
  const [newArticleTextVi, setNewArticleTextVi] = useState('');

  // ─── TYPING PRACTICE ENGINE STATE ───────────────────────────
  const [wordsList, setWordsList] = useState<string[]>([]);
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [activeCharIndex, setActiveCharIndex] = useState(0);
  const [typedWords, setTypedWords] = useState<string[]>([]); // stores typed string of each word
  const [currentWordInput, setCurrentWordInput] = useState('');
  const [errorsCount, setErrorsCount] = useState(0);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  
  // Timer for WPM
  const [isTypingStarted, setIsTypingStarted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerIntervalId, setTimerIntervalId] = useState<any>(null);

  // Practice Result Modal
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [finalWpm, setFinalWpm] = useState(0);
  const [finalAccuracy, setFinalAccuracy] = useState(100);

  // Active book states
  const [currentBookId, setCurrentBookId] = useState<string>('sample_essays');
  const [changeBookModalOpen, setChangeBookModalOpen] = useState(false);
  const [deleteArticleMode, setDeleteArticleMode] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    // Books progress initialization
    const storedCustom = localStorage.getItem('typewords_custom_books');
    const custom = storedCustom ? JSON.parse(storedCustom) : [];
    setCustomBooks(custom);
    const allBooks = [...DEFAULT_BOOKS, ...custom];
    setBooks(allBooks);

    const savedCurrentBookId = localStorage.getItem('typewords_current_book_id');
    const defaultId = allBooks[0]?.id || 'sample_essays';
    setCurrentBookId(savedCurrentBookId || defaultId);

    // Stats initialization
    const statsStr = localStorage.getItem('typewords_stats');
    if (statsStr) {
      const stats = JSON.parse(statsStr);
      setStudyTimeToday(stats.studyTimeToday || 0);
      setTotalStudyTime(stats.totalStudyTime || 420); // default to 7 mins
      setTotalDaysStudied(stats.totalDaysStudied || 1);
      setWeeklyActivity(stats.weeklyActivity || [true, false, false, false, false, false, false]);
    } else {
      // Set some nice default stats
      const defaultStats = {
        studyTimeToday: 0,
        totalStudyTime: 420,
        totalDaysStudied: 1,
        weeklyActivity: [true, false, false, false, false, false, false],
        lastUpdateDate: new Date().toDateString()
      };
      localStorage.setItem('typewords_stats', JSON.stringify(defaultStats));
      setStudyTimeToday(0);
      setTotalStudyTime(420);
      setTotalDaysStudied(1);
      setWeeklyActivity([true, false, false, false, false, false, false]);
    }

    // Reset daily stats if it's a new day
    const lastDate = localStorage.getItem('typewords_last_date');
    const today = new Date().toDateString();
    if (lastDate && lastDate !== today) {
      // Save stats first
      const stats = JSON.parse(localStorage.getItem('typewords_stats') || '{}');
      stats.studyTimeToday = 0;
      stats.lastUpdateDate = today;
      // Mark today active in weekly activity
      const dayOfWeek = (new Date().getDay() + 6) % 7; // 0 for Mon, 6 for Sun
      const activity = stats.weeklyActivity || [false, false, false, false, false, false, false];
      if (!activity[dayOfWeek]) {
        activity[dayOfWeek] = true;
        stats.totalDaysStudied = (stats.totalDaysStudied || 0) + 1;
      }
      stats.weeklyActivity = activity;
      localStorage.setItem('typewords_stats', JSON.stringify(stats));
      localStorage.setItem('typewords_last_date', today);

      setStudyTimeToday(0);
      setWeeklyActivity(activity);
      setTotalDaysStudied(stats.totalDaysStudied);
    } else {
      localStorage.setItem('typewords_last_date', today);
    }
  }, []);

  // Cancel speech on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Save stats helper
  const updateStats = (seconds: number) => {
    setStudyTimeToday(prev => prev + seconds);
    setTotalStudyTime(prev => prev + seconds);

    const statsStr = localStorage.getItem('typewords_stats');
    if (statsStr) {
      const stats = JSON.parse(statsStr);
      stats.studyTimeToday = (stats.studyTimeToday || 0) + seconds;
      stats.totalStudyTime = (stats.totalStudyTime || 0) + seconds;
      
      const dayOfWeek = (new Date().getDay() + 6) % 7;
      const activity = stats.weeklyActivity || [false, false, false, false, false, false, false];
      if (!activity[dayOfWeek]) {
        activity[dayOfWeek] = true;
        stats.totalDaysStudied = (stats.totalDaysStudied || 0) + 1;
        setTotalDaysStudied(stats.totalDaysStudied);
      }
      stats.weeklyActivity = activity;
      setWeeklyActivity(activity);

      localStorage.setItem('typewords_stats', JSON.stringify(stats));
    }
  };

  // ─── CUSTOM BOOKS ACTIONS ───────────────────────────────────
  const handleCreateBook = () => {
    if (!newBookTitle.trim()) {
      message.error(t('pleaseEnterBookTitle'));
      return;
    }
    const colorGradients = [
      'linear-gradient(135deg, #FF6B6B 0%, #556270 100%)',
      'linear-gradient(135deg, #4ECDC4 0%, #556270 100%)',
      'linear-gradient(135deg, #FFD194 0%, #D1913C 100%)',
      'linear-gradient(135deg, #7F00FF 0%, #E100FF 100%)'
    ];
    const newBook = {
      id: 'custom_' + Date.now(),
      name: newBookTitle.trim(),
      description: newBookDesc.trim() || 'My custom book.',
      category: 'Personal',
      tags: ['Personal'],
      coverGradient: colorGradients[Math.floor(Math.random() * colorGradients.length)],
      articles: []
    };

    const updatedCustom = [...customBooks, newBook];
    setCustomBooks(updatedCustom);
    setBooks([...DEFAULT_BOOKS, ...updatedCustom]);
    localStorage.setItem('typewords_custom_books', JSON.stringify(updatedCustom));

    setNewBookTitle('');
    setNewBookDesc('');
    setCreateBookOpen(false);
    message.success(language === 'vi' ? 'Đã tạo sách tự chọn mới thành công' : 'New book created successfully');
  };

  const handleOpenEditBook = (book: any) => {
    setEditingBookId(book.id);
    setNewBookTitle(book.name);
    setNewBookDesc(book.description);
    setEditBookOpen(true);
  };

  const handleEditBookSubmit = () => {
    if (!newBookTitle.trim()) {
      message.error(t('pleaseEnterBookTitle'));
      return;
    }
    const updatedCustom = customBooks.map(b => {
      if (b.id === editingBookId) {
        return {
          ...b,
          name: newBookTitle.trim(),
          description: newBookDesc.trim() || 'My custom book.'
        };
      }
      return b;
    });

    setCustomBooks(updatedCustom);
    setBooks([...DEFAULT_BOOKS, ...updatedCustom]);
    localStorage.setItem('typewords_custom_books', JSON.stringify(updatedCustom));

    if (selectedBook && selectedBook.id === editingBookId) {
      const updatedBook = updatedCustom.find(b => b.id === editingBookId);
      setSelectedBook(updatedBook);
    }

    setNewBookTitle('');
    setNewBookDesc('');
    setEditingBookId('');
    setEditBookOpen(false);
    message.success(language === 'vi' ? 'Đã cập nhật thông tin sách thành công' : 'Book updated successfully');
  };

  const handleAddArticle = () => {
    if (!newArticleTitle.trim() || !newArticleText.trim()) {
      message.error(t('pleaseEnterArticleTitleContent'));
      return;
    }
    const newArticle = {
      id: 'art_' + Date.now(),
      title: newArticleTitle.trim(),
      titleTranslate: newArticleTitleVi.trim() || newArticleTitle.trim(),
      text: newArticleText.trim().replace(/\s+/g, ' '), // sanitize whitespaces
      textTranslate: newArticleTextVi.trim() || 'No translation available for this article.'
    };

    const updatedCustom = customBooks.map(b => {
      if (b.id === selectedBook.id) {
        return {
          ...b,
          articles: [...b.articles, newArticle]
        };
      }
      return b;
    });

    setCustomBooks(updatedCustom);
    const updatedBook = updatedCustom.find(b => b.id === selectedBook.id);
    setSelectedBook(updatedBook);
    setBooks([...DEFAULT_BOOKS, ...updatedCustom]);
    localStorage.setItem('typewords_custom_books', JSON.stringify(updatedCustom));

    setNewArticleTitle('');
    setNewArticleTitleVi('');
    setNewArticleText('');
    setNewArticleTextVi('');
    setAddArticleOpen(false);
    message.success(language === 'vi' ? 'Đã thêm bài viết thành công' : 'Article added successfully');
  };

  const handleOpenEditArticle = (art: any) => {
    setEditingArticle(art);
    setNewArticleTitle(art.title);
    setNewArticleTitleVi(art.titleTranslate || '');
    setNewArticleText(art.text);
    setNewArticleTextVi(art.textTranslate || '');
    setEditArticleOpen(true);
  };

  const handleEditArticleSubmit = () => {
    if (!newArticleTitle.trim() || !newArticleText.trim()) {
      message.error(t('pleaseEnterArticleTitleContent'));
      return;
    }
    const updatedCustom = customBooks.map(b => {
      if (b.id === selectedBook.id) {
        return {
          ...b,
          articles: b.articles.map((a: any) => {
            if (a.id === editingArticle.id) {
              return {
                ...a,
                title: newArticleTitle.trim(),
                titleTranslate: newArticleTitleVi.trim() || newArticleTitle.trim(),
                text: newArticleText.trim().replace(/\s+/g, ' '),
                textTranslate: newArticleTextVi.trim()
              };
            }
            return a;
          })
        };
      }
      return b;
    });

    setCustomBooks(updatedCustom);
    const updatedBook = updatedCustom.find(b => b.id === selectedBook.id);
    setSelectedBook(updatedBook);
    setBooks([...DEFAULT_BOOKS, ...updatedCustom]);
    localStorage.setItem('typewords_custom_books', JSON.stringify(updatedCustom));

    setNewArticleTitle('');
    setNewArticleTitleVi('');
    setNewArticleText('');
    setNewArticleTextVi('');
    setEditingArticle(null);
    setEditArticleOpen(false);
    message.success(language === 'vi' ? 'Đã cập nhật bài viết thành công' : 'Article updated successfully');
  };

  const selectActiveBook = (bookId: string) => {
    setCurrentBookId(bookId);
    localStorage.setItem('typewords_current_book_id', bookId);
  };

  const handleDeleteBook = (bookId: string) => {
    Modal.confirm({
      title: t('deleteBookConfirmTitle'),
      content: t('deleteBookConfirmDesc'),
      okText: t('deleteBtn'),
      cancelText: t('cancelBtn'),
      okType: 'danger',
      onOk: () => {
        const updatedCustom = customBooks.filter(b => b.id !== bookId);
        setCustomBooks(updatedCustom);
        const newBooks = [...DEFAULT_BOOKS, ...updatedCustom];
        setBooks(newBooks);
        localStorage.setItem('typewords_custom_books', JSON.stringify(updatedCustom));
        
        // If the deleted book was selected, go back to list
        if (selectedBook && selectedBook.id === bookId) {
          setSelectedBook(null);
          setView('list');
        }

        // If the deleted book was the currently studying book, reset it
        const savedCurrentId = localStorage.getItem('typewords_current_book_id');
        if (savedCurrentId === bookId || currentBookId === bookId) {
          const defaultId = newBooks[0]?.id || '';
          setCurrentBookId(defaultId);
          localStorage.setItem('typewords_current_book_id', defaultId);
        }

        message.success(language === 'vi' ? 'Đã xóa sách thành công' : 'Book deleted successfully');
      }
    });
  };

  const handleDeleteArticle = (artId: string) => {
    if (!selectedBook) return;
    Modal.confirm({
      title: t('deleteArticleConfirmTitle'),
      content: t('deleteArticleConfirmDesc'),
      okText: t('deleteBtn'),
      cancelText: t('cancelBtn'),
      okType: 'danger',
      onOk: () => {
        const updatedCustom = customBooks.map(b => {
          if (b.id === selectedBook.id) {
            return {
              ...b,
              articles: b.articles.filter((a: any) => a.id !== artId)
            };
          }
          return b;
        });

        setCustomBooks(updatedCustom);
        const updatedSelectedBook = updatedCustom.find(b => b.id === selectedBook.id);
        setSelectedBook(updatedSelectedBook);
        
        setBooks([...DEFAULT_BOOKS, ...updatedCustom]);
        localStorage.setItem('typewords_custom_books', JSON.stringify(updatedCustom));

        message.success(language === 'vi' ? 'Đã xóa bài viết thành công' : 'Article deleted successfully');
      }
    });
  };

  // ─── TYPING GAME MECHANICS ──────────────────────────────────
  const startPractice = (article: any) => {
    setSelectedArticle(article);
    setView('practice');
    if (selectedBook) {
      selectActiveBook(selectedBook.id);
    }

    // Split text into words (removing extra spaces)
    const words = article.text.split(' ').filter((w: string) => w.length > 0);
    setWordsList(words);
    setActiveWordIndex(0);
    setActiveCharIndex(0);
    setTypedWords(Array(words.length).fill(''));
    setCurrentWordInput('');
    setErrorsCount(0);
    setCorrectKeystrokes(0);
    setIsTypingStarted(false);
    setElapsedSeconds(0);
    setStartTime(null);
    setResultModalOpen(false);

    if (timerIntervalId) clearInterval(timerIntervalId);
  };

  // Keypress listener
  useEffect(() => {
    if (view !== 'practice' || resultModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore functional keys (Ctrl, Alt, Meta, Shift, Tab, etc.)
      if (e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta' || e.key === 'Shift' || e.key === 'Tab' || e.key === 'CapsLock' || e.key === 'Escape') {
        return;
      }

      // Start timer on first keystroke
      if (!isTypingStarted) {
        setIsTypingStarted(true);
        setStartTime(Date.now());
        const interval = setInterval(() => {
          setElapsedSeconds(prev => prev + 1);
        }, 1000);
        setTimerIntervalId(interval);
      }

      const activeWord = wordsList[activeWordIndex];
      if (!activeWord) return;

      // Handle Backspace
      if (e.key === 'Backspace') {
        e.preventDefault();
        if (currentWordInput.length > 0) {
          playClickSound();
          const newInput = currentWordInput.slice(0, -1);
          setCurrentWordInput(newInput);
          setActiveCharIndex(newInput.length);
          
          // Update typedWords progress
          const updatedTyped = [...typedWords];
          updatedTyped[activeWordIndex] = newInput;
          setTypedWords(updatedTyped);
        }
        return;
      }

      // Handle Space (Advance word)
      if (e.key === ' ') {
        e.preventDefault();
        // If current word is fully typed (case-insensitive fallback check)
        if (currentWordInput.toLowerCase() === activeWord.toLowerCase()) {
          playClickSound();
          setCorrectKeystrokes(prev => prev + 1); // space key counts as correct keystroke

          // Check if article is completed
          if (activeWordIndex === wordsList.length - 1) {
            finishPractice();
          } else {
            setActiveWordIndex(prev => prev + 1);
            setActiveCharIndex(0);
            setCurrentWordInput('');
          }
        } else {
          // Extra characters or unfinished word
          playErrorSound();
          setErrorsCount(prev => prev + 1);
        }
        return;
      }

      // Ignore functional keys except Process (which represents Telex / VNI IME keystroke)
      if (e.key.length > 1 && e.key !== 'Process') {
        return;
      }

      e.preventDefault();
      const expectedChar = activeWord[activeCharIndex];

      // Decode physical key fallback if e.key is Process due to Telex/IME interception
      const typedChar = (e.key === 'Process' || e.keyCode === 229)
        ? getCharFromCode(e)
        : e.key;

      const isCorrect = !!expectedChar && !!typedChar && typedChar.toLowerCase() === expectedChar.toLowerCase();

      if (isCorrect) {
        // Correct character typed
        playClickSound();
        setCorrectKeystrokes(prev => prev + 1);
        
        // Use expectedChar case representation to make layout look clean
        const newInput = currentWordInput + expectedChar;
        setCurrentWordInput(newInput);
        setActiveCharIndex(prev => prev + 1);

        const updatedTyped = [...typedWords];
        updatedTyped[activeWordIndex] = newInput;
        setTypedWords(updatedTyped);

        // Auto-advance if it's the last word and the last character (no space needed for final char of final word)
        if (activeWordIndex === wordsList.length - 1 && newInput.toLowerCase() === activeWord.toLowerCase()) {
          finishPractice();
        }
      } else {
        // Wrong character typed
        playErrorSound();
        setErrorsCount(prev => prev + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [view, wordsList, activeWordIndex, activeCharIndex, currentWordInput, isTypingStarted, resultModalOpen]);

  const finishPractice = () => {
    if (timerIntervalId) clearInterval(timerIntervalId);

    const timeTaken = elapsedSeconds > 0 ? elapsedSeconds : 1;
    updateStats(timeTaken);

    // Calculate WPM and Accuracy
    // Formula WPM: (Correct Keystrokes / 5) / (Time Taken in Minutes)
    const minutes = timeTaken / 60;
    const wpm = Math.round((correctKeystrokes / 5) / minutes);
    
    // Formula Accuracy: Correct Keystrokes / (Correct Keystrokes + Errors)
    const accuracy = correctKeystrokes + errorsCount > 0 
      ? Math.round((correctKeystrokes / (correctKeystrokes + errorsCount)) * 100) 
      : 100;

    setFinalWpm(wpm);
    setFinalAccuracy(accuracy);
    setResultModalOpen(true);

    // Call backend API to record activity
    statsService.recordActivity('card', wordsList.length).catch(err => {
      console.error('Failed to record activity in backend:', err);
    });

    // Save article progress in localStorage
    const progressKey = `typewords_progress_${selectedBook.id}_${selectedArticle.id}`;
    localStorage.setItem(progressKey, JSON.stringify({ completed: true, wpm, accuracy, date: new Date().toLocaleDateString() }));
  };

  const getArticleProgress = (bookId: string, articleId: string) => {
    const progress = localStorage.getItem(`typewords_progress_${bookId}_${articleId}`);
    return progress ? JSON.parse(progress) : null;
  };

  const getCategoryLabel = (category: string) => {
    if (category?.toLowerCase() === 'personal' || category === 'Cá nhân') {
      return language === 'vi' ? 'Cá nhân' : 'Personal';
    }
    if (category?.toLowerCase() === 'writing practice' || category === 'Luyện viết') {
      return language === 'vi' ? 'Luyện viết' : 'Writing Practice';
    }
    return category;
  };

  const getBookProgressText = (book: any) => {
    if (!book.articles || book.articles.length === 0) {
      return t('completedArticlesCountUnit').replace('{completed}', '0').replace('{total}', '0');
    }
    const completedCount = book.articles.filter((art: any) => getArticleProgress(book.id, art.id)?.completed).length;
    return t('completedArticlesCountUnit')
      .replace('{completed}', completedCount.toString())
      .replace('{total}', book.articles.length.toString());
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  // Format seconds to hh:mm:ss or mm:ss
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hrs > 0) {
      return language === 'vi'
        ? `${hrs} giờ ${mins} phút`
        : `${hrs} hr${hrs > 1 ? 's' : ''} ${mins} min${mins > 1 ? 's' : ''}`;
    }
    if (mins > 0) {
      return language === 'vi'
        ? `${mins} phút ${secs} giây`
        : `${mins} min${mins > 1 ? 's' : ''} ${secs} sec${secs > 1 ? 's' : ''}`;
    }
    return language === 'vi'
      ? `${secs} giây`
      : `${secs} sec${secs > 1 ? 's' : ''}`;
  };

  return (
    <div className={styles.container}>
      {/* ─── CHẾ ĐỘ XEM 1: DANH SÁCH SÁCH (BOOKSHELF) ────────────────── */}
      {view === 'list' && (
        <div className={styles.viewWrapper}>
          {/* Header */}
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>{t('typewordsTitle')}</h1>
              <p className={styles.subTitle}>{t('typewordsSub')}</p>
            </div>
          </div>


          {/* 2. Sách của tôi (My Bookshelf) */}
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('myBooksLabel')}</h2>
          </div>

          <div className={styles.booksGrid}>
            {/* Sách mẫu + Sách tự tạo */}
            {books.map((book) => (
              <div 
                key={book.id} 
                className={styles.bookCard}
                onClick={() => {
                  setSelectedBook(book);
                  selectActiveBook(book.id);
                  setView('detail');
                }}
              >
                <div className={styles.bookCover} style={{ background: book.coverGradient }}>
                  <span className={styles.bookCoverIcon}>📖</span>
                  <span className={styles.bookCoverCount}>{book.articles?.length || 0} {t('articlesCountUnit')}</span>
                  {book.id.startsWith('custom_') && (
                    <>
                      <button 
                        className={styles.editBookBtn} 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditBook(book);
                        }}
                        title={language === 'vi' ? 'Sửa sách' : 'Edit book'}
                      >
                        ✏️
                      </button>
                      <button 
                        className={styles.deleteBookBtn} 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBook(book.id);
                        }}
                        title={language === 'vi' ? 'Xóa sách' : 'Delete book'}
                      >
                        🗑
                      </button>
                    </>
                  )}
                </div>
                <div className={styles.bookMeta}>
                  <span className={styles.bookProgress}>{getBookProgressText(book)}</span>
                  <h3 className={styles.bookName}>{book.name}</h3>
                  <p className={styles.bookDesc}>{book.description}</p>
                </div>
              </div>
            ))}

            {/* Tạo sách mới card */}
            <div className={styles.addBookCard} onClick={() => setCreateBookOpen(true)}>
              <span className={styles.addBookIcon}>+</span>
              <span className={styles.addBookText}>{t('createCustomBookBtn')}</span>
            </div>
          </div>

          {/* 3. Đề xuất sách (Recommendations) */}
          <div className={styles.sectionHeader} style={{ marginTop: '24px' }}>
            <h2 className={styles.sectionTitle}>{t('recommendedBooksLabel')}</h2>
          </div>
          <div className={styles.recommendGrid}>
            {DEFAULT_BOOKS.map((b) => (
              <div key={b.id} className={styles.recommendRow}>
                <div className={styles.recCover} style={{ background: b.coverGradient }}>📖</div>
                <div className={styles.recInfo}>
                  <strong className={styles.recTitle}>{b.name}</strong>
                  <p className={styles.recDesc}>{b.description}</p>
                </div>
                <button 
                  className={styles.recAddBtn}
                  onClick={() => {
                    setSelectedBook(b);
                    selectActiveBook(b.id);
                    setView('detail');
                  }}
                >
                  {t('practiceNowBtn')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── CHẾ ĐỘ XEM 2: CHI TIẾT SÁCH (BOOK DETAIL) ────────────────── */}
      {view === 'detail' && selectedBook && (
        <div className={styles.viewWrapper}>
          {/* Header */}
          <div className={styles.detailHeader}>
            <button className={styles.backBtn} onClick={() => {
              setDeleteArticleMode(false);
              setView('list');
            }}>
              {t('backToBookshelfBtn')}
            </button>
            <div className={styles.detailBookBlock}>
              <div className={styles.detailCover} style={{ background: selectedBook.coverGradient }}>📖</div>
              <div className={styles.detailBookMeta}>
                <span className={styles.detailCategory}>{getCategoryLabel(selectedBook.category)}</span>
                <h1 className={styles.detailBookName}>{selectedBook.name}</h1>
                <p className={styles.detailBookDesc}>{selectedBook.description}</p>
                <div className={styles.detailStatsRow}>
                  <span>{language === 'vi' ? 'Bài viết:' : 'Articles:'} <strong>{selectedBook.articles?.length || 0} {t('articlesCountUnit')}</strong></span>
                  <span>·</span>
                  <span>{language === 'vi' ? 'Đã hoàn thành:' : 'Completed:'} <strong>{getBookProgressText(selectedBook)}</strong></span>
                </div>
              </div>
            </div>

            {selectedBook.id.startsWith('custom_') && (
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  className={styles.btnSecondary} 
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    color: '#F2F2F2',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '6px 14px',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                  onClick={() => handleOpenEditBook(selectedBook)}
                >
                  ✏️ {language === 'vi' ? 'Sửa sách' : 'Edit Book'}
                </button>
                <button className={styles.btnSecondary} onClick={() => setAddArticleOpen(true)}>
                  {t('addNewArticleBtn')}
                </button>
                <button 
                  className={styles.btnDanger}
                  onClick={() => setDeleteArticleMode(!deleteArticleMode)}
                  style={{ 
                    background: deleteArticleMode ? '#8A8A8E' : '#ff4d4f', 
                    color: '#fff', 
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 14px',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  🗑 {deleteArticleMode ? t('cancelDeleteBtn') : t('deleteArticlesBtn')}
                </button>
              </div>
            )}
          </div>

          {/* List of articles */}
          <div className={styles.articlesListWrapper}>
            <h2 className={styles.listSectionTitle}>{t('articleListTitle')}</h2>
            <div className={styles.articlesGrid}>
              {selectedBook.articles && selectedBook.articles.length > 0 ? (
                selectedBook.articles.map((art: any, index: number) => {
                  const progress = getArticleProgress(selectedBook.id, art.id);
                  return (
                    <div key={art.id} className={styles.articleRow}>
                      <div className={styles.artIndex}>#{index + 1}</div>
                      <div className={styles.artTextInfo}>
                        <strong className={styles.artTitle}>{art.title}</strong>
                        <span className={styles.artTitleVi}>{art.titleTranslate}</span>
                      </div>
                      
                      {progress?.completed ? (
                        <div className={styles.artStatusBox}>
                          <span className={styles.statusBadgeDone}>{t('completedBadge')}</span>
                          <span className={styles.statusMeta}>Best: {progress.wpm} WPM · {progress.accuracy}%</span>
                        </div>
                      ) : (
                        <div className={styles.artStatusBox}>
                          <span className={styles.statusBadgeTodo}>{t('notAttempted')}</span>
                        </div>
                      )}

                      <div className={styles.artActions}>
                        {deleteArticleMode ? (
                          <button 
                            className={styles.btnDanger}
                            onClick={() => handleDeleteArticle(art.id)}
                            style={{
                              background: '#ff4d4f',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '6px 12px',
                              cursor: 'pointer',
                              fontWeight: 500
                            }}
                          >
                            🗑 {t('deleteBtn')}
                          </button>
                        ) : (
                          <>
                            <button className={styles.speakBtnSmall} onClick={() => speakText(art.text)} title="Listen to article">
                              🔊
                            </button>
                            {selectedBook.id.startsWith('custom_') && (
                              <button 
                                className={styles.btnSecondary} 
                                style={{
                                  background: 'rgba(255, 255, 255, 0.04)',
                                  color: '#F2F2F2',
                                  border: '1px solid rgba(255, 255, 255, 0.08)',
                                  borderRadius: '6px',
                                  padding: '6px 12px',
                                  cursor: 'pointer',
                                  fontWeight: 500,
                                  fontSize: '13px'
                                }}
                                onClick={() => handleOpenEditArticle(art)}
                              >
                                ✏️ {language === 'vi' ? 'Sửa' : 'Edit'}
                              </button>
                            )}
                            <button className={styles.btnStartArt} onClick={() => startPractice(art)}>
                              {t('practiceNowBtn')} &rarr;
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className={styles.emptyBookText}>
                  {t('emptyBookMessage')}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── CHẾ ĐỘ XEM 3: LUYỆN GÕ PHÍM (TYPING PRACTICE SCREEN) ─────── */}
      {view === 'practice' && selectedBook && selectedArticle && (
        <div className={styles.practiceWrapper}>
          {/* Header toolbar */}
          <div className={styles.practiceHeader}>
            <button 
              className={styles.backBtn} 
              onClick={() => {
                if (timerIntervalId) clearInterval(timerIntervalId);
                if ('speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                }
                setView('detail');
              }}
            >
              ✕ {t('exitPracticeBtn')}
            </button>
            <div className={styles.practiceTitleBlock}>
              <h2 className={styles.practiceBookName}>{selectedBook.name}</h2>
              <h1 className={styles.practiceArtTitle}>{selectedArticle.title}</h1>
            </div>
            <button className={styles.audioBtn} onClick={() => speakText(selectedArticle.text)}>
              {t('listenToArticleBtn')}
            </button>
          </div>

          {/* Real-time stats bar */}
          <div className={styles.gameStatsBar}>
            <div className={styles.gameStat}>
              <span className={styles.gameStatVal}>
                {elapsedSeconds > 0 
                  ? Math.round((correctKeystrokes / 5) / (elapsedSeconds / 60)) 
                  : 0}
              </span>
              <span className={styles.gameStatLabel}>{t('typingSpeedWpmLabel')}</span>
            </div>
            <div className={styles.gameStat}>
              <span className={styles.gameStatVal}>
                {correctKeystrokes + errorsCount > 0 
                  ? Math.round((correctKeystrokes / (correctKeystrokes + errorsCount)) * 100) 
                  : 100}%
              </span>
              <span className={styles.gameStatLabel}>{t('typingAccuracyLabel')}</span>
            </div>
            <div className={styles.gameStat}>
              <span className={styles.gameStatVal}>{formatTime(elapsedSeconds)}</span>
              <span className={styles.gameStatLabel}>{t('timeElapsedLabel')}</span>
            </div>
            <div className={styles.gameStat}>
              <span className={styles.gameStatVal}>{activeWordIndex + 1} / {wordsList.length}</span>
              <span className={styles.gameStatLabel}>{t('typingProgressLabel')}</span>
            </div>
          </div>

          {/* Typing Area */}
          <div className={styles.typingSandbox}>
            <div className={styles.typingWordsWrap}>
              {wordsList.map((word, wordIdx) => {
                const isActive = wordIdx === activeWordIndex;
                const isWrote = wordIdx < activeWordIndex;
                
                return (
                  <span 
                    key={wordIdx} 
                    className={`${styles.wordBox} ${isActive ? styles.wordActive : ''} ${isWrote ? styles.wordWrote : ''}`}
                  >
                    {word.split('').map((char, charIdx) => {
                      const isCharActive = isActive && charIdx === activeCharIndex;
                      const isCharTypedCorrect = isWrote || (isActive && charIdx < activeCharIndex);

                      let charClass = '';
                      if (isCharActive) charClass = styles.charCurrent;
                      else if (isCharTypedCorrect) charClass = styles.charWrote;
                      
                      return (
                        <span key={charIdx} className={`${styles.charSpan} ${charClass}`}>
                          {char}
                        </span>
                      );
                    })}
                    {/* Trailing space visualization */}
                    {wordIdx < wordsList.length - 1 && (
                      <span className={`${styles.charSpan} ${isActive && activeCharIndex === word.length ? styles.spaceWait : ''}`}>
                        &nbsp;
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Translation assistance */}
          <div className={styles.translateAssistCard}>
            <span className={styles.translateAssistLabel}>{t('vietnameseTranslationLabel')}</span>
            <p className={styles.translateAssistText}>{selectedArticle.textTranslate}</p>
          </div>

          {/* Instruction helper */}
          <div className={styles.practiceKeyboardHelper}>
            <span>{t('typingInstruction')}</span>
          </div>
        </div>
      )}

      {/* ─── MODAL 1: TẠO SÁCH CÁ NHÂN ────────────────────────────── */}
      <Modal
        title={t('createBookModalTitle')}
        open={createBookOpen}
        onCancel={() => setCreateBookOpen(false)}
        onOk={handleCreateBook}
        okText={t('createBookBtn')}
        cancelText={t('cancelBtn')}
        styles={{
          content: { background: '#141416', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px' },
          header: { background: '#141416', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: '#8A8A8E', fontSize: '12px' }}>{t('bookTitleLabel')}</label>
            <Input 
              placeholder={t('bookTitlePlaceholder')}
              value={newBookTitle}
              onChange={e => setNewBookTitle(e.target.value)}
              style={{ background: '#1C1C1F', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#F2F2F2' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: '#8A8A8E', fontSize: '12px' }}>{t('bookDescLabel')}</label>
            <TextArea 
              placeholder={t('bookDescPlaceholder')}
              value={newBookDesc}
              onChange={e => setNewBookDesc(e.target.value)}
              rows={3}
              style={{ background: '#1C1C1F', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#F2F2F2' }}
            />
          </div>
        </div>
      </Modal>

      {/* ─── MODAL 1.5: SỬA SÁCH ────────────────────────────────────── */}
      <Modal
        title={t('editBookModalTitle')}
        open={editBookOpen}
        onCancel={() => {
          setEditBookOpen(false);
          setEditingBookId('');
          setNewBookTitle('');
          setNewBookDesc('');
        }}
        onOk={handleEditBookSubmit}
        okText={t('editBookBtn')}
        cancelText={t('cancelBtn')}
        styles={{
          content: { background: '#141416', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px' },
          header: { background: '#141416', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: '#8A8A8E', fontSize: '12px' }}>{t('bookTitleLabel')}</label>
            <Input 
              placeholder={t('bookTitlePlaceholder')}
              value={newBookTitle}
              onChange={e => setNewBookTitle(e.target.value)}
              style={{ background: '#1C1C1F', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#F2F2F2' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: '#8A8A8E', fontSize: '12px' }}>{t('bookDescLabel')}</label>
            <TextArea 
              placeholder={t('bookDescPlaceholder')}
              value={newBookDesc}
              onChange={e => setNewBookDesc(e.target.value)}
              rows={3}
              style={{ background: '#1C1C1F', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#F2F2F2' }}
            />
          </div>
        </div>
      </Modal>

      {/* ─── MODAL 2: THÊM BÀI VIẾT VÀO SÁCH TỰ TẠO ─────────────────── */}
      <Modal
        title={t('addArticleModalTitle')}
        open={addArticleOpen}
        onCancel={() => setAddArticleOpen(false)}
        onOk={handleAddArticle}
        okText={t('addArticleBtn')}
        cancelText={t('cancelBtn')}
        width={600}
        styles={{
          content: { background: '#141416', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px' },
          header: { background: '#141416', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', color: '#8A8A8E', fontSize: '12px' }}>{t('englishTitleLabel')}</label>
              <Input 
                placeholder={t('englishTitlePlaceholder')}
                value={newArticleTitle}
                onChange={e => setNewArticleTitle(e.target.value)}
                style={{ background: '#1C1C1F', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#F2F2F2' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', color: '#8A8A8E', fontSize: '12px' }}>{t('vietnameseTitleLabel')}</label>
              <Input 
                placeholder={t('vietnameseTitlePlaceholder')}
                value={newArticleTitleVi}
                onChange={e => setNewArticleTitleVi(e.target.value)}
                style={{ background: '#1C1C1F', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#F2F2F2' }}
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: '#8A8A8E', fontSize: '12px' }}>{t('englishContentLabel')}</label>
            <TextArea 
              placeholder={t('englishContentPlaceholder')}
              value={newArticleText}
              onChange={e => setNewArticleText(e.target.value)}
              rows={4}
              style={{ background: '#1C1C1F', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#F2F2F2' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: '#8A8A8E', fontSize: '12px' }}>{t('vietnameseTranslationFieldLabel')}</label>
            <TextArea 
              placeholder={t('vietnameseTranslationFieldPlaceholder')}
              value={newArticleTextVi}
              onChange={e => setNewArticleTextVi(e.target.value)}
              rows={3}
              style={{ background: '#1C1C1F', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#F2F2F2' }}
            />
          </div>
        </div>
      </Modal>

      {/* ─── MODAL 2.5: SỬA BÀI VIẾT ────────────────────────────────── */}
      <Modal
        title={t('editArticleModalTitle')}
        open={editArticleOpen}
        onCancel={() => {
          setEditArticleOpen(false);
          setEditingArticle(null);
          setNewArticleTitle('');
          setNewArticleTitleVi('');
          setNewArticleText('');
          setNewArticleTextVi('');
        }}
        onOk={handleEditArticleSubmit}
        okText={t('editArticleBtn')}
        cancelText={t('cancelBtn')}
        width={600}
        styles={{
          content: { background: '#141416', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px' },
          header: { background: '#141416', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', color: '#8A8A8E', fontSize: '12px' }}>{t('englishTitleLabel')}</label>
              <Input 
                placeholder={t('englishTitlePlaceholder')}
                value={newArticleTitle}
                onChange={e => setNewArticleTitle(e.target.value)}
                style={{ background: '#1C1C1F', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#F2F2F2' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', color: '#8A8A8E', fontSize: '12px' }}>{t('vietnameseTitleLabel')}</label>
              <Input 
                placeholder={t('vietnameseTitlePlaceholder')}
                value={newArticleTitleVi}
                onChange={e => setNewArticleTitleVi(e.target.value)}
                style={{ background: '#1C1C1F', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#F2F2F2' }}
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: '#8A8A8E', fontSize: '12px' }}>{t('englishContentLabel')}</label>
            <TextArea 
              placeholder={t('englishContentPlaceholder')}
              value={newArticleText}
              onChange={e => setNewArticleText(e.target.value)}
              rows={4}
              style={{ background: '#1C1C1F', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#F2F2F2' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: '#8A8A8E', fontSize: '12px' }}>{t('vietnameseTranslationFieldLabel')}</label>
            <TextArea 
              placeholder={t('vietnameseTranslationFieldPlaceholder')}
              value={newArticleTextVi}
              onChange={e => setNewArticleTextVi(e.target.value)}
              rows={3}
              style={{ background: '#1C1C1F', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#F2F2F2' }}
            />
          </div>
        </div>
      </Modal>

      {/* ─── MODAL 3: KẾT QUẢ LUYỆN GÕ PHÍM ─────────────────────────── */}
      <Modal
        title={null}
        open={resultModalOpen}
        onCancel={() => {
          setResultModalOpen(false);
          setView('detail');
        }}
        footer={null}
        width={420}
        centered
        styles={{
          content: { background: '#141416', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', textAlign: 'center', padding: '24px' }
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '48px', margin: '12px 0 0 0' }}>🎉</div>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#F2F2F2', margin: 0 }}>{t('typingCompletedModalTitle')}</h2>
          <p 
            style={{ fontSize: '13px', color: '#8A8A8E', margin: 0 }}
            dangerouslySetInnerHTML={{ __html: t('typingCompletedModalDesc').replace('{title}', selectedArticle?.title || '') }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%', margin: '16px 0' }}>
            <div style={{ background: '#1C1C1F', border: '1px solid rgba(255,255,255,0.06)', padding: '12px', borderRadius: '10px' }}>
              <span style={{ display: 'block', fontSize: '28px', fontWeight: '700', color: '#E8FF57' }}>{finalWpm}</span>
              <span style={{ fontSize: '11px', color: '#8A8A8E' }}>{t('typingSpeedWpmLabel')}</span>
            </div>
            <div style={{ background: '#1C1C1F', border: '1px solid rgba(255,255,255,0.06)', padding: '12px', borderRadius: '10px' }}>
              <span style={{ display: 'block', fontSize: '28px', fontWeight: '700', color: '#3ECF8E' }}>{finalAccuracy}%</span>
              <span style={{ fontSize: '11px', color: '#8A8A8E' }}>{t('typingAccuracyLabel')}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
            <button 
              className={styles.btnSecondary} 
              style={{ flex: 1 }} 
              onClick={() => {
                setResultModalOpen(false);
                startPractice(selectedArticle);
              }}
            >
              {t('practiceAgainBtn')}
            </button>
            <button 
              className={styles.btnPrimary} 
              style={{ flex: 1 }}
              onClick={() => {
                setResultModalOpen(false);
                // Check if there is a next article in the book
                const currentIdx = selectedBook.articles.findIndex((a: any) => a.id === selectedArticle.id);
                if (currentIdx > -1 && currentIdx < selectedBook.articles.length - 1) {
                  startPractice(selectedBook.articles[currentIdx + 1]);
                } else {
                  setView('detail');
                }
              }}
            >
              {t('nextArticleBtn')}
            </button>
          </div>
        </div>
      </Modal>

      {/* ─── MODAL 4: THAY ĐỔI SÁCH ĐANG HỌC ────────────────────────── */}
      <Modal
        title={t('selectActiveBookModalTitle')}
        open={changeBookModalOpen}
        onCancel={() => setChangeBookModalOpen(false)}
        footer={null}
        styles={{
          content: { background: '#141416', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px' },
          header: { background: '#141416', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px', maxHeight: '400px', overflowY: 'auto' }}>
          {books.map(b => (
            <div 
              key={b.id} 
              className={`${styles.selectBookRow} ${b.id === currentBookId ? styles.selectBookRowActive : ''}`}
              onClick={() => {
                setCurrentBookId(b.id);
                localStorage.setItem('typewords_current_book_id', b.id);
                setChangeBookModalOpen(false);
                message.success(language === 'vi' ? `Sách đang học đã đổi thành: ${b.name}` : `Active book changed to: ${b.name}`);
              }}
            >
              <div className={styles.selectBookCover} style={{ background: b.coverGradient }}>📖</div>
              <div style={{ flex: 1 }}>
                <strong style={{ display: 'block', color: '#F2F2F2', fontSize: '14px' }}>{b.name}</strong>
                <span style={{ color: '#8A8A8E', fontSize: '12px' }}>{getBookProgressText(b)}</span>
              </div>
              {b.id === currentBookId && (
                <span style={{ color: '#E8FF57', fontWeight: 'bold' }}>{t('activeBadge')}</span>
              )}
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default TypeWordsPage;
