import React, { useState } from 'react';
import { useNavigate } from 'umi';
import { useAuthStore } from '@/stores/auth.store';
import styles from '../Login/index.less';

export default function RegisterPage() {
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = 'Vui lòng nhập họ tên';
    if (!form.email) e.email = 'Vui lòng nhập email';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email không hợp lệ';
    if (!form.password) e.password = 'Vui lòng nhập mật khẩu';
    else if (form.password.length < 6) e.password = 'Tối thiểu 6 ký tự';
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
      alert('Email đã tồn tại hoặc dữ liệu không hợp lệ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.shell}>
      <div className={styles.left}>
        <div className={styles.logo}>
          <span className={styles.logoMark}>E</span>
          <span className={styles.logoText}>ELP</span>
        </div>
        <div className={styles.leftBody}>
          <h1 className={styles.leftTitle}>Bắt đầu học.</h1>
          <p className={styles.leftSub}>Tạo tài khoản miễn phí và nâng cao tiếng Anh mỗi ngày.</p>
          <ul className={styles.featList}>
            {['Flashcard lặp lại ngắt quãng', 'Gia sư AI ngữ pháp & từ vựng', 'Theo dõi tiến độ & chuỗi ngày'].map(f => (
              <li key={f} className={styles.feat}><span className={styles.featDot} />{f}</li>
            ))}
          </ul>
        </div>
        <span className={styles.leftFoot}>Nền tảng học tiếng Anh · 2025</span>
      </div>

      <div className={styles.right}>
        <h2 className={styles.formTitle}>Tạo tài khoản</h2>
        <p className={styles.formSub}>Đăng ký miễn phí, học không giới hạn.</p>

        <div className={styles.field}>
          <label className={styles.label}>Họ và tên</label>
          <input
            className={`${styles.inp} ${errors.fullName ? styles.inpErr : ''}`}
            placeholder="Nguyễn Văn A"
            value={form.fullName}
            onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
          />
          {errors.fullName && <span className={styles.errMsg}>{errors.fullName}</span>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Email</label>
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
          <label className={styles.label}>Mật khẩu</label>
          <input
            className={`${styles.inp} ${errors.password ? styles.inpErr : ''}`}
            type="password"
            placeholder="Tối thiểu 6 ký tự"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
          {errors.password && <span className={styles.errMsg}>{errors.password}</span>}
        </div>

        <button className={styles.btnPrimary} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Đang đăng ký…' : 'Đăng ký →'}
        </button>

        <p className={styles.footLink}>
          Đã có tài khoản?{' '}
          <span onClick={() => navigate('/login')}>Đăng nhập →</span>
        </p>
      </div>
    </div>
  );
}