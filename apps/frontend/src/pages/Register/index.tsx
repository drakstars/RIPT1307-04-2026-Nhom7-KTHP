import React, { useState } from 'react';
import { useNavigate } from 'umi';
import { useAuthStore } from '@/stores/auth.store';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';
import { useTranslation } from '@/hooks/useTranslation';
import styles from '../Login/index.less';

export default function RegisterPage() {
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);
  const { t, language } = useTranslation();
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = language === 'vi' ? 'Vui lòng nhập họ tên' : 'Please enter your full name';
    if (!form.email) e.email = language === 'vi' ? 'Vui lòng nhập email' : 'Please enter your email';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = language === 'vi' ? 'Email không hợp lệ' : 'Invalid email';
    if (!form.password) e.password = language === 'vi' ? 'Vui lòng nhập mật khẩu' : 'Please enter your password';
    else if (form.password.length < 6) e.password = language === 'vi' ? 'Tối thiểu 6 ký tự' : 'Minimum 6 characters';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form.email, form.fullName, form.password);
      navigate('/dashboard');
    } catch {
      alert(language === 'vi' ? 'Email đã tồn tại hoặc dữ liệu không hợp lệ' : 'Email already exists or invalid data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.shell}>
      <div className={styles.langWrapper}>
        <LanguageSwitcher />
      </div>
      <div className={styles.left}>
        <div className={styles.logo}>
          <span className={styles.logoMark}>E</span>
          <span className={styles.logoText}>ELP</span>
        </div>
        <div className={styles.leftBody}>
          <h1 className={styles.leftTitle}>{language === 'vi' ? 'Bắt đầu học.' : 'Start learning.'}</h1>
          <p className={styles.leftSub}>
            {language === 'vi' ? 'Tạo tài khoản miễn phí và nâng cao tiếng Anh mỗi ngày.' : 'Create a free account and improve English daily.'}
          </p>
          <ul className={styles.featList}>
            {(language === 'vi'
              ? ['Flashcard lặp lại ngắt quãng', 'Gia sư AI ngữ pháp & từ vựng', 'Theo dõi tiến độ & chuỗi ngày']
              : ['Spaced Repetition Flashcards', 'AI Grammar & Vocabulary Tutor', 'Progress & Streak Tracking']
            ).map(f => (
              <li key={f} className={styles.feat}><span className={styles.featDot} />{f}</li>
            ))}
          </ul>
        </div>
        <span className={styles.leftFoot}>
          {language === 'vi' ? 'Nền tảng học tiếng Anh · 2025' : 'English Learning Platform · 2025'}
        </span>
      </div>

      <div className={styles.right}>
        <h2 className={styles.formTitle}>{t('registerTitle').replace(' →', '')}</h2>
        <p className={styles.formSub}>{language === 'vi' ? 'Đăng ký miễn phí, học không giới hạn.' : 'Sign up for free, learn without limits.'}</p>

        <div className={styles.field}>
          <label className={styles.label}>{language === 'vi' ? 'Họ và tên' : 'Full Name'}</label>
          <input
            className={`${styles.inp} ${errors.fullName ? styles.inpErr : ''}`}
            placeholder="Nguyễn Văn A"
            value={form.fullName}
            onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
          />
          {errors.fullName && <span className={styles.errMsg}>{errors.fullName}</span>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>{t('emailLabel')}</label>
          <input
            className={`${styles.inp} ${errors.email ? styles.inpErr : ''}`}
            type="email"
            placeholder="ban@example.com"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          />
          {errors.email && <span className={styles.errMsg}>{errors.email}</span>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>{t('passwordLabel')}</label>
          <input
            className={`${styles.inp} ${errors.password ? styles.inpErr : ''}`}
            type="password"
            placeholder={language === 'vi' ? 'Tối thiểu 6 ký tự' : 'Minimum 6 characters'}
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
          {errors.password && <span className={styles.errMsg}>{errors.password}</span>}
        </div>

        <button className={styles.btnPrimary} onClick={handleSubmit} disabled={loading}>
          {loading ? t('registeringBtn') : t('registerBtn')}
        </button>

        <p className={styles.footLink}>
          {t('alreadyHaveAccount')}{' '}
          <span onClick={() => navigate('/login')}>{t('loginBtn').replace(' →', '')} →</span>
        </p>
      </div>
    </div>
  );
}