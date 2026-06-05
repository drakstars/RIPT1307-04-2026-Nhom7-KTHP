import React from 'react';
import styles from './index.less';

interface StreakCalendarProps {
    days: { date: string; studied: boolean }[];
    current: number;
    best: number;
}

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const today = new Date().toISOString().split('T')[0];

const StreakCalendar: React.FC<StreakCalendarProps> = ({ days, current, best }) => (
    <div className={styles.wrap}>
        <div className={styles.top}>
            <div>
                <div className={styles.num}>{current}</div>
                <div className={styles.label}>Day streak</div>
            </div>
            <div className={styles.right}>
                <div className={styles.best}>Best: {best} days</div>
                {current > 0 && (
                    <span className={styles.badge}>On track ↑</span>
                )}
            </div>
        </div>

        <div className={styles.hdrs}>
            {WEEKDAYS.map((d, i) => (
                <div key={i} className={styles.hdr}>{d}</div>
            ))}
        </div>

        <div className={styles.grid}>
            {days.map(day => {
                const isToday = day.date === today;
                return (
                    <div
                        key={day.date}
                        className={`${styles.cell}
              ${isToday ? styles.cellToday : ''}
              ${!isToday && day.studied ? styles.cellDone : ''}
              ${!isToday && !day.studied ? styles.cellMiss : ''}
            `}
                    >
                        {new Date(day.date).getDate()}
                    </div>
                );
            })}
        </div>
    </div>
);

export default StreakCalendar;