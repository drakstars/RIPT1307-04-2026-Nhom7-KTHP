import React from 'react';
import { useNavigate } from 'umi';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { statsService } from '@/services/stats.service';
import { quizService } from '@/services/quiz.service';
import Heatmap from '@/components/common/Heatmap';
import WeeklyChart from '@/components/common/WeeklyChart';
import StreakCalendar from '@/components/common/StreakCalendar';
import type { SetProgress } from '@/types/stats.types';
import styles from './index.less';

const STALE = 60 * 1000; // 60s

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const firstName = user?.email?.split('@')[0] ?? 'there';

  const { data: overview, isLoading: loadingOverview } = useQuery({
    queryKey: ['stats-overview'],
    queryFn: statsService.getOverview,
    staleTime: STALE,
  });

  const { data: activity } = useQuery({
    queryKey: ['stats-activity'],
    queryFn: statsService.getActivity,
    staleTime: STALE,
  });

  const { data: weekly } = useQuery({
    queryKey: ['stats-weekly'],
    queryFn: statsService.getWeekly,
    staleTime: STALE,
  });

  const { data: progress } = useQuery({
    queryKey: ['stats-progress'],
    queryFn: statsService.getSetProgress,
    staleTime: STALE,
  });

  const { data: streak } = useQuery({
    queryKey: ['stats-streak'],
    queryFn: statsService.getStreak,
    staleTime: STALE,
  });

  const { data: quizzes } = useQuery({
    queryKey: ['quizzes'],
    queryFn: quizService.getAll,
    staleTime: STALE,
  });

  const getHour = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Chào buổi sáng';
    if (h < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  if (loadingOverview) {
    return (
      <div className={styles.centered}>
        <div style={{ width: 24, height: 24, border: '2px solid #242428', borderTopColor: '#E8FF57', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className={styles.pg}>
      {/* Header */}
      <div className={styles.top}>
        <div>
          <h1 className={styles.greeting}>{getHour()}, {firstName}.</h1>
          <p className={styles.greetingSub}>
            {streak?.current
              ? `Chuỗi ${streak.current} ngày · tiếp tục phát huy!`
              : 'Bắt đầu học để xây dựng chuỗi ngày của bạn'}
          </p>
        </div>
        <div className={styles.topActions}>
          <button className={styles.btnSecondary} onClick={() => navigate('/quiz/create')}>
            Tạo bài kiểm tra
          </button>
          <button className={styles.btnPrimary} onClick={() => navigate('/flashcards/create')}>
            + Bộ thẻ mới
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className={styles.kpis}>
        <div className={styles.kpi}>
          <div className={styles.kpiLabel}>Thẻ đã học</div>
          <div className={styles.kpiVal}>{overview?.totalStudied ?? 0}</div>
          <div className={`${styles.kpiDelta} ${(overview?.weekDelta ?? 0) > 0 ? styles.up : ''}`}>
            {(overview?.weekDelta ?? 0) > 0 ? '↑' : '→'} {overview?.thisWeek ?? 0} tuần này
          </div>
        </div>
        <div className={styles.kpi}>
          <div className={styles.kpiLabel}>Tỷ lệ thuộc bài</div>
          <div className={`${styles.kpiVal} ${styles.green}`}>{overview?.knownRate ?? 0}%</div>
          <div className={styles.kpiDelta}>{overview?.knownCount ?? 0} thẻ đã nhớ</div>
        </div>
        <div className={styles.kpi}>
          <div className={styles.kpiLabel}>Chuỗi hiện tại</div>
          <div className={`${styles.kpiVal} ${styles.accent}`}>{streak?.current ?? 0} ngày</div>
          <div className={styles.kpiDelta}>Kỷ lục: {streak?.best ?? 0} ngày</div>
        </div>
        <div className={styles.kpi}>
          <div className={styles.kpiLabel}>Điểm quiz TB</div>
          <div className={`${styles.kpiVal} ${styles.warn}`}>{overview?.quizAvg ?? 0}%</div>
          <div className={styles.kpiDelta}>{overview?.quizAttemptCount ?? 0} lần làm bài</div>
        </div>
      </div>

      {/* Heatmap + Weekly */}
      <div className={styles.twoCol}>
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>Hoạt động — 30 ngày qua</span>
            <span className={styles.badge}>{overview?.totalStudied ?? 0} thẻ tổng</span>
          </div>
          {activity ? <Heatmap data={activity} /> : <div className={styles.skelSmall} />}
        </div>

        <div className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>Tuần này</span>
            <span className={styles.muted}>thẻ / ngày</span>
          </div>
          {weekly ? <WeeklyChart data={weekly} /> : <div className={styles.skelSmall} />}
        </div>
      </div>

      {/* Progress + Streak */}
      <div className={styles.twoCol}>
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>Tiến độ bộ thẻ</span>
            <span
              className={styles.link}
              onClick={() => navigate('/flashcards')}
            >
              Xem tất cả →
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
                  <span className={styles.progressPct}>{set.knownPct}% thuộc</span>
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
                    <span className={styles.dotGreen} />{set.known} thuộc
                  </span>
                  <span className={styles.progressStat}>
                    <span className={styles.dotWarn} />{set.needReview} cần ôn
                  </span>
                  <span className={styles.progressStat}>
                    <span className={styles.dotMuted} />{set.unstudied} mới
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

      {/* Quiz history */}
      <div>
        <div className={styles.cardHead} style={{ marginBottom: 10 }}>
          <span className={styles.cardTitle}>Lịch sử kiểm tra</span>
          <span className={styles.link} onClick={() => navigate('/quiz')}>Xem tất cả →</span>
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
                    <div className={styles.histMeta}>{last.score}/{last.totalQ} câu đúng</div>
                  </div>
                  <div className={styles.histTime}>
                    {new Date(last.completedAt).toLocaleDateString('vi-VN', {
                      day: 'numeric', month: 'numeric',
                    })}
                  </div>
                </div>
              );
            })}
          {!(quizzes ?? []).some(q => (q._count?.attempts ?? 0) > 0) && (
            <div className={styles.emptyHist}>
              Chưa có lần kiểm tra nào —{' '}
              <span onClick={() => navigate('/quiz/create')}>làm bài kiểm tra đầu tiên →</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;