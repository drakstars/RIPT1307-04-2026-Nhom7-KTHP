import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'umi';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';
import { useTranslation } from '@/hooks/useTranslation';
import styles from './index.less';

const FEATURES = [
  {
    icon: '⬡',
    title: 'Smart Flashcards',
    desc: 'Learn vocabulary using the spaced repetition method (SRS). The system automatically prioritizes words you tend to forget.',
    color: '#E8FF57',
    bg: 'rgba(232,255,87,0.06)',
  },
  {
    icon: '🎯',
    title: 'Adaptive Quiz',
    desc: 'Quizzes that adapt to your current level. Multiple choice, fill-in-the-blank, true/false — in various formats.',
    color: '#39A8FF',
    bg: 'rgba(57,168,255,0.06)',
  },
  {
    icon: '⌨️',
    title: 'Type Words',
    desc: 'Practice touch typing while learning vocabulary through real-world English passages.',
    color: '#3ECF8E',
    bg: 'rgba(62,207,142,0.06)',
  },
  {
    icon: '🤖',
    title: 'AI Chatbot',
    desc: 'AI assistant to explain grammar, correct sentences, and help you practice natural English conversations.',
    color: '#A855F7',
    bg: 'rgba(168,85,247,0.06)',
  },
  {
    icon: '📚',
    title: 'Course Library',
    desc: 'Expertly designed course library. From beginner to advanced — catering to all skill levels.',
    color: '#F6A623',
    bg: 'rgba(246,166,35,0.06)',
  },
  {
    icon: '📊',
    title: 'Progress Tracking',
    desc: 'Track your study streak, view progress charts and detailed statistics. Always know where you stand.',
    color: '#FF5B5B',
    bg: 'rgba(255,91,91,0.06)',
  },
];

const VOCAB_SETS = [
  { topic: 'IELTS', title: 'IELTS Core Vocabulary', words: 847, color: '#39A8FF', bg: 'rgba(57,168,255,0.1)' },
  { topic: 'TOEIC', title: 'TOEIC Business Words', words: 1024, color: '#3ECF8E', bg: 'rgba(62,207,142,0.1)' },
  { topic: 'TOEFL', title: 'TOEFL Academic Set', words: 692, color: '#F6A623', bg: 'rgba(246,166,35,0.1)' },
  { topic: 'SAT', title: 'SAT Vocabulary', words: 510, color: '#A855F7', bg: 'rgba(168,85,247,0.1)' },
];

const STATS = [
  { val: '50K+', label: 'Learners' },
  { val: '2M+', label: 'Flashcards' },
  { val: '98%', label: 'Satisfaction Rate' },
  { val: '4.9⭐', label: 'Rating' },
];

const TESTIMONIALS = [
  {
    name: 'Minh Anh Nguyen',
    role: 'IELTS 7.5',
    avatar: 'M',
    color: '#39A8FF',
    text: 'ELP helped me raise my IELTS score from 5.5 to 7.5 in just 3 months. The flashcard method combined with quizzes is highly effective!',
  },
  {
    name: 'Hoa Tran',
    role: 'Business English',
    avatar: 'H',
    color: '#3ECF8E',
    text: 'I used ELP to prepare for interviews at international companies. The TOEIC word set and AI chatbot boosted my confidence tremendously.',
  },
  {
    name: 'Duc Thanh Le',
    role: 'TOEFL 105',
    avatar: 'T',
    color: '#E8FF57',
    text: 'The Type Words feature is amazing — I get to practice typing while building vocabulary. I learn over 200 words a week without getting bored!',
  },
];

const PLANS = [
  {
    name: 'Free',
    price: '0đ',
    period: '/month',
    desc: 'Perfect for starting your English learning journey',
    features: ['50 flashcards/day', '5 quizzes/month', 'Basic word sets', 'AI Chatbot (limited)'],
    cta: 'Start Free',
    featured: false,
  },
  {
    name: 'Pro',
    price: '99K',
    period: '/month',
    desc: 'For serious learners wanting to make a breakthrough',
    features: ['Unlimited flashcards', 'Unlimited quizzes', 'All vocabulary sets', 'Full AI Chatbot access', 'Type Words', 'Detailed stats', 'Priority support'],
    cta: 'Try 7 Days Free',
    featured: true,
  },
  {
    name: 'Team',
    price: '299K',
    period: '/month',
    desc: 'A solution for study groups, classrooms, or enterprises',
    features: ['All Pro features', 'Manage team of 10 people', 'Admin Dashboard', 'Team progress reports', 'Custom contents', '24/7 Support'],
    cta: 'Contact Sales',
    featured: false,
  },
];

const FLOATING_WORDS = [
  { word: 'Eloquent', meaning: '/ˈel.ə.kwənt/', x: 8, y: 15, delay: 0 },
  { word: 'Meticulous', meaning: '/məˈtɪk.jə.ləs/', x: 72, y: 8, delay: 0.5 },
  { word: 'Accomplish', meaning: '/əˈkʌm.plɪʃ/', x: 85, y: 55, delay: 1 },
  { word: 'Resilient', meaning: '/rɪˈzɪl.i.ənt/', x: 5, y: 70, delay: 1.5 },
  { word: 'Persevere', meaning: '/ˌpɜː.səˈvɪər/', x: 60, y: 80, delay: 2 },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeWord, setActiveWord] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const { t, language } = useTranslation();

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveWord(prev => (prev + 1) % FLOATING_WORDS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const FEATURES_VI = [
    {
      title: 'Thẻ ghi nhớ thông minh',
      desc: 'Học từ vựng bằng phương pháp lặp lại ngắt quãng (SRS). Hệ thống tự động ưu tiên các từ bạn dễ quên.',
    },
    {
      title: 'Trắc nghiệm thích ứng',
      desc: 'Các bài trắc nghiệm tự động điều chỉnh theo trình độ hiện tại của bạn. Nhiều dạng câu hỏi: trắc nghiệm, điền từ, đúng/sai.',
    },
    {
      title: 'Luyện gõ từ',
      desc: 'Luyện gõ bàn phím mười ngón kết hợp học từ vựng qua các đoạn văn tiếng Anh thực tế.',
    },
    {
      title: 'Chatbot AI',
      desc: 'Trợ lý AI giúp giải thích ngữ pháp, sửa lỗi câu và cùng bạn luyện giao tiếp tiếng Anh tự nhiên.',
    },
    {
      title: 'Thư viện khóa học',
      desc: 'Thư viện khóa học được thiết kế chuyên nghiệp. Từ trình độ cơ bản đến nâng cao — đáp ứng mọi nhu cầu học tập.',
    },
    {
      title: 'Theo dõi tiến độ',
      desc: 'Theo dõi chuỗi học tập (streak), xem biểu đồ tiến độ và thống kê chi tiết. Luôn biết rõ bạn đang ở đâu.',
    },
  ];

  const STEPS_VI = [
    { title: 'Tạo tài khoản miễn phí', desc: 'Đăng ký trong 30 giây bằng email hoặc Google. Không cần thẻ tín dụng.' },
    { title: 'Chọn bộ từ vựng', desc: 'Lựa chọn từ hơn 50 bộ IELTS, TOEIC, TOEFL hoặc tự tạo bộ của riêng bạn.' },
    { title: 'Học và theo dõi', desc: 'Học với lộ trình thích ứng. Hệ thống tự động nhắc nhở ôn tập khi bạn chuẩn bị quên.' },
  ];

  const PLANS_VI = [
    {
      desc: 'Hoàn hảo để bắt đầu hành trình học tiếng Anh của bạn',
      features: ['50 thẻ ghi nhớ/ngày', '5 lượt trắc nghiệm/tháng', 'Các bộ từ vựng cơ bản', 'Chatbot AI (giới hạn)'],
      cta: 'Bắt đầu miễn phí',
    },
    {
      desc: 'Dành cho người học nghiêm túc muốn bứt phá',
      features: ['Không giới hạn thẻ ghi nhớ', 'Không giới hạn trắc nghiệm', 'Tất cả các bộ từ vựng', 'Quyền truy cập AI Chatbot đầy đủ', 'Tính năng luyện gõ từ', 'Thống kê chi tiết', 'Hỗ trợ ưu tiên'],
      cta: 'Dùng thử 7 ngày miễn phí',
    },
    {
      desc: 'Giải pháp cho nhóm học tập, lớp học hoặc doanh nghiệp',
      features: ['Tất cả tính năng của gói Pro', 'Quản lý nhóm 10 người', 'Bảng điều khiển quản trị', 'Báo cáo tiến độ nhóm', 'Nội dung tùy chỉnh', 'Hỗ trợ 24/7'],
      cta: 'Liên hệ kinh doanh',
    },
  ];

  const displayFeatures = FEATURES.map((f, idx) => ({
    ...f,
    title: language === 'vi' ? FEATURES_VI[idx].title : f.title,
    desc: language === 'vi' ? FEATURES_VI[idx].desc : f.desc,
  }));

  const displaySteps = [
    { num: '01', title: 'Create a free account', desc: 'Sign up in 30 seconds with email or Google. No credit card required.', icon: '👤' },
    { num: '02', title: 'Choose a word set', desc: 'Select from over 50 IELTS, TOEIC, TOEFL sets or create your own.', icon: '📖' },
    { num: '03', title: 'Learn and track', desc: 'Learn with adaptive paths. The system automatically prompts reviews when you are about to forget.', icon: '📈' },
  ].map((step, idx) => ({
    ...step,
    title: language === 'vi' ? STEPS_VI[idx].title : step.title,
    desc: language === 'vi' ? STEPS_VI[idx].desc : step.desc,
  }));

  const displayPlans = PLANS.map((p, idx) => ({
    ...p,
    desc: language === 'vi' ? PLANS_VI[idx].desc : p.desc,
    features: language === 'vi' ? PLANS_VI[idx].features : p.features,
    cta: language === 'vi' ? PLANS_VI[idx].cta : p.cta,
  }));

  return (
    <div className={styles.page}>
      {/* ─── NAVBAR ─────────────────────────────────────── */}
      <nav className={`${styles.nav} ${scrollY > 40 ? styles.navScrolled : ''}`}>
        <div className={styles.navInner}>
          <div className={styles.logo}>
            <span className={styles.logoMark}>E</span>
            <span className={styles.logoText}>ELP</span>
            <span className={styles.logoBadge}>Beta</span>
          </div>
          <div className={styles.navLinks}>
            <a href="#features" className={styles.navLink}>{t('featuresTitle')}</a>
            <a href="#vocab" className={styles.navLink}>{t('dictionary')}</a>
            <a href="#pricing" className={styles.navLink}>{t('pricingTitle')}</a>
          </div>
          <div className={styles.navCta}>
            <LanguageSwitcher />
            <button className={styles.btnOutline} onClick={() => navigate('/login')}>{t('loginBtn').replace(' →', '')}</button>
            <button className={styles.btnAccent} onClick={() => navigate('/register')}>{t('getStartedFree')}</button>
          </div>
        </div>
      </nav>

      {/* ─── HERO ───────────────────────────────────────── */}
      <section className={styles.hero} ref={heroRef}>
        {/* Ambient blobs */}
        <div className={styles.blob1} />
        <div className={styles.blob2} />
        <div className={styles.blob3} />

        {/* Grid overlay */}
        <div className={styles.gridOverlay} />

        {/* Floating vocab cards */}
        <div className={styles.floatingCards}>
          {FLOATING_WORDS.map((fw, i) => (
            <div
              key={fw.word}
              className={`${styles.floatCard} ${i === activeWord ? styles.floatCardActive : ''}`}
              style={{ left: `${fw.x}%`, top: `${fw.y}%`, animationDelay: `${fw.delay}s` }}
            >
              <span className={styles.floatWord}>{fw.word}</span>
              <span className={styles.floatIpa}>{fw.meaning}</span>
            </div>
          ))}
        </div>

        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot} />
            🚀 #1 Smart English Learning Platform
          </div>
          <h1 className={styles.heroTitle}>
            {language === 'vi' ? (
              <>
                Học tiếng Anh
                <br />
                <span className={styles.heroAccent}>thông minh hơn</span>
                <br />
                cùng ELP
              </>
            ) : (
              <>
                Learn English
                <br />
                <span className={styles.heroAccent}>smarter</span>
                <br />
                with ELP
              </>
            )}
          </h1>
          <p className={styles.heroSub}>
            {t('heroSubText')}
          </p>
          <div className={styles.heroCtas}>
            <button className={styles.btnHeroPrimary} onClick={() => navigate('/register')}>
              {t('startLearningFreeBtn')}
            </button>
            <button className={styles.btnHeroSecondary} onClick={() => navigate('/login')}>
              {t('alreadyHaveAccountBtn')}
            </button>
          </div>
          <div className={styles.heroMeta}>
            <span>✓ {t('freeForever')}</span>
            <span>✓ {t('noCreditCard')}</span>
            <span>✓ {t('setUp30s')}</span>
          </div>
        </div>

        {/* Hero visual — animated flashcard demo */}
        <div className={styles.heroVisual}>
          <div className={styles.heroCard}>
            <div className={styles.heroCardTop}>
              <span className={styles.heroCardBadge}>IELTS</span>
              <span className={styles.heroCardCount}>1 / 30</span>
            </div>
            <div className={styles.heroCardWord}>Eloquent</div>
            <div className={styles.heroCardIpa}>/ˈel.ə.kwənt/</div>
            <div className={styles.heroCardDef}>
              {language === 'vi' ? 'Có khả năng diễn đạt ý kiến và suy nghĩ một cách rõ ràng và hiệu quả.' : 'Able to express ideas and opinions clearly and effectively.'}
            </div>
            <div className={styles.heroCardExample}>"She gave an eloquent speech at the conference."</div>
            <div className={styles.heroCardActions}>
              <button className={styles.heroCardBtnKnow}>{language === 'vi' ? '✓ Biết' : '✓ Know'}</button>
              <button className={styles.heroCardBtnReview}>{language === 'vi' ? '↺ Ôn tập' : '↺ Review'}</button>
            </div>
          </div>

          {/* Mini streak widget */}
          <div className={styles.heroStreak}>
            <span className={styles.heroStreakFire}>🔥</span>
            <div>
              <div className={styles.heroStreakNum}>12</div>
              <div className={styles.heroStreakLabel}>{language === 'vi' ? 'ngày streak' : 'day streak'}</div>
            </div>
          </div>

          {/* Mini progress */}
          <div className={styles.heroProgress}>
            <div className={styles.heroProgressHead}>
              <span>{language === 'vi' ? 'Tiến độ hôm nay' : "Today's Progress"}</span>
              <span className={styles.heroProgressPct}>73%</span>
            </div>
            <div className={styles.heroProgressBar}>
              <div className={styles.heroProgressFill} style={{ width: '73%' }} />
            </div>
            <div className={styles.heroProgressSub}>22 / 30 {language === 'vi' ? 'thẻ' : 'cards'}</div>
          </div>
        </div>
      </section>


      {/* ─── FEATURES ───────────────────────────────────── */}
      <section className={styles.features} id="features">
        <div className={styles.sectionInner}>
          <div className={styles.sectionTag}>{t('allToolsTitle')}</div>
          <h2 className={styles.sectionTitle}>
            {language === 'vi' ? (
              <>
                Tất cả tính năng trong
                <br />
                <span className={styles.sectionAccent}>một nền tảng</span>
              </>
            ) : (
              <>
                All features in
                <br />
                <span className={styles.sectionAccent}>one platform</span>
              </>
            )}
          </h2>
          <p className={styles.sectionSub}>
            {t('allFeaturesSubtitle')}
          </p>
          <div className={styles.featGrid}>
            {displayFeatures.map(f => (
              <div key={f.title} className={styles.featCard} style={{ '--feat-color': f.color, '--feat-bg': f.bg } as any}>
                <div className={styles.featIcon} style={{ color: f.color, background: f.bg }}>{f.icon}</div>
                <h3 className={styles.featTitle}>{f.title}</h3>
                <p className={styles.featDesc}>{f.desc}</p>
                <div className={styles.featArrow} style={{ color: f.color }}>→</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ───────────────────────────────── */}
      <section className={styles.howItWorks}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionTag}>{language === 'vi' ? 'HOẠT ĐỘNG NHƯ THẾ NÀO' : 'HOW IT WORKS'}</div>
          <h2 className={styles.sectionTitle}>
            {language === 'vi' ? (
              <>
                Bắt đầu chỉ với
                <br />
                <span className={styles.sectionAccent}>3 bước đơn giản</span>
              </>
            ) : (
              <>
                Get started in
                <br />
                <span className={styles.sectionAccent}>3 simple steps</span>
              </>
            )}
          </h2>
          <div className={styles.stepsGrid}>
            {displaySteps.map((step, i) => (
              <div key={step.num} className={styles.stepCard}>
                <div className={styles.stepNum}>{step.num}</div>
                <div className={styles.stepIcon}>{step.icon}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
                {i < 2 && <div className={styles.stepArrow}>→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── VOCAB SETS ─────────────────────────────────── */}
      <section className={styles.vocabSection} id="vocab">
        <div className={styles.sectionInner}>
          <div className={styles.sectionTag}>{language === 'vi' ? 'BỘ TỪ VỰNG CHUẨN HÓA' : 'VOCABULARY SETS'}</div>
          <h2 className={styles.sectionTitle}>
            {language === 'vi' ? (
              <>
                Hơn <span className={styles.sectionAccent}>2 triệu</span> thẻ ghi nhớ
              </>
            ) : (
              <>
                Over <span className={styles.sectionAccent}>2 million</span> flashcards
              </>
            )}
          </h2>
          <p className={styles.sectionSub}>
            {language === 'vi' ? 'Được thiết kế bởi các chuyên gia giáo dục, liên tục cập nhật theo các đề thi mới nhất.' : 'Curated by expert educators, updated continuously based on actual test designs.'}
          </p>
          <div className={styles.vocabGrid}>
            {VOCAB_SETS.map(vs => (
              <div
                key={vs.topic}
                className={styles.vocabCard}
                onClick={() => navigate('/login')}
              >
                <div className={styles.vocabCardTop}>
                  <span className={styles.vocabBadge} style={{ background: vs.bg, color: vs.color }}>{vs.topic}</span>
                  <span className={styles.vocabWords}>{vs.words.toLocaleString()} {language === 'vi' ? 'từ' : 'words'}</span>
                </div>
                <div className={styles.vocabTitle}>{language === 'vi' && vs.topic === 'IELTS' ? 'Từ vựng IELTS cốt lõi' : language === 'vi' && vs.topic === 'TOEIC' ? 'Từ vựng TOEIC thông dụng' : language === 'vi' && vs.topic === 'TOEFL' ? 'Từ vựng TOEFL học thuật' : vs.title}</div>
                <div className={styles.vocabCta} style={{ color: vs.color }}>{language === 'vi' ? 'Học ngay →' : 'Learn now →'}</div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ─── PRICING ────────────────────────────────────── */}
      <section className={styles.pricing} id="pricing">
        <div className={styles.sectionInner}>
          <div className={styles.sectionTag}>{language === 'vi' ? 'CÁC GÓI TÀI KHOẢN' : 'PRICING PLANS'}</div>
          <h2 className={styles.sectionTitle}>
            {language === 'vi' ? (
              <>
                Lựa chọn gói học
                <br />
                <span className={styles.sectionAccent}>phù hợp với bạn</span>
              </>
            ) : (
              <>
                Choose the plan that fits
                <br />
                <span className={styles.sectionAccent}>your needs</span>
              </>
            )}
          </h2>
          <div className={styles.plansGrid}>
            {displayPlans.map(p => (
              <div key={p.name} className={`${styles.planCard} ${p.featured ? styles.planFeatured : ''}`}>
                {p.featured && <div className={styles.planBadge}>{language === 'vi' ? 'Phổ biến nhất' : 'Most Popular'}</div>}
                <div className={styles.planName}>{p.name === 'Free' && language === 'vi' ? 'Miễn phí' : p.name === 'Team' && language === 'vi' ? 'Nhóm' : p.name}</div>
                <div className={styles.planPrice}>
                  {p.price}<span className={styles.planPeriod}>{p.period === '/month' && language === 'vi' ? '/tháng' : p.period}</span>
                </div>
                <div className={styles.planDesc}>{p.desc}</div>
                <div className={styles.planDivider} />
                <ul className={styles.planFeatures}>
                  {p.features.map(f => (
                    <li key={f} className={styles.planFeature}>
                      <span className={styles.planCheck}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <button
                  className={p.featured ? styles.btnAccent : styles.btnOutline}
                  onClick={() => navigate(p.name === 'Free' ? '/register' : '/pricing')}
                  style={{ width: '100%', marginTop: 'auto' }}
                >
                  {p.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─────────────────────────────────── */}
      <section className={styles.ctaBanner}>
        <div className={styles.ctaBannerBlob} />
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>{t('readyBreakthrough')}</h2>
          <p className={styles.ctaSub}>{t('joinLearners')}</p>
          <button className={styles.btnHeroPrimary} onClick={() => navigate('/register')}>
            {t('startLearningFreeBtn')}
          </button>
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <div className={styles.logo}>
              <span className={styles.logoMark}>E</span>
              <span className={styles.logoText}>ELP</span>
            </div>
            <p className={styles.footerTagline}>{language === 'vi' ? 'Học tiếng Anh thông minh hơn mỗi ngày cùng ELP.' : 'English Learning Platform — Learn English smarter every day.'}</p>
          </div>
          <div className={styles.footerLinks}>
            <div className={styles.footerCol}>
              <div className={styles.footerColTitle}>{language === 'vi' ? 'Sản phẩm' : 'Product'}</div>
              <a className={styles.footerLink} onClick={() => navigate('/login')}>{language === 'vi' ? 'Thẻ ghi nhớ' : 'Flashcards'}</a>
              <a className={styles.footerLink} onClick={() => navigate('/login')}>{language === 'vi' ? 'Trắc nghiệm' : 'Quiz'}</a>
              <a className={styles.footerLink} onClick={() => navigate('/login')}>{language === 'vi' ? 'Luyện gõ từ' : 'Type Words'}</a>
              <a className={styles.footerLink} onClick={() => navigate('/login')}>{language === 'vi' ? 'Gia sư AI' : 'AI Chatbot'}</a>
            </div>
            <div className={styles.footerCol}>
              <div className={styles.footerColTitle}>{language === 'vi' ? 'Học tập' : 'Resources'}</div>
              <a className={styles.footerLink} onClick={() => navigate('/login')}>{language === 'vi' ? 'Từ vựng IELTS' : 'IELTS Vocabulary'}</a>
              <a className={styles.footerLink} onClick={() => navigate('/login')}>{language === 'vi' ? 'Từ vựng TOEIC' : 'TOEIC Vocabulary'}</a>
              <a className={styles.footerLink} onClick={() => navigate('/login')}>{language === 'vi' ? 'Khóa học' : 'Courses'}</a>
              <a className={styles.footerLink} onClick={() => navigate('/login')}>{language === 'vi' ? 'Từ điển' : 'Dictionary'}</a>
            </div>
            <div className={styles.footerCol}>
              <div className={styles.footerColTitle}>{language === 'vi' ? 'Tài khoản' : 'Account'}</div>
              <a className={styles.footerLink} onClick={() => navigate('/register')}>{language === 'vi' ? 'Đăng ký' : 'Sign Up'}</a>
              <a className={styles.footerLink} onClick={() => navigate('/login')}>{language === 'vi' ? 'Đăng nhập' : 'Log In'}</a>
              <a className={styles.footerLink} onClick={() => navigate('/pricing')}>{language === 'vi' ? 'Nâng cấp Pro' : 'Upgrade to Pro'}</a>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span>© 2024 ELP — English Learning Platform. {language === 'vi' ? 'Tất cả các quyền được bảo lưu.' : 'All rights reserved.'}</span>
        </div>
      </footer>
    </div>
  );
}
