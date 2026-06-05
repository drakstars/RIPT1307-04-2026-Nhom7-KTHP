import React from 'react';
import type { WeeklyDay } from '@/types/stats.types';
import styles from './index.less';

interface WeeklyChartProps {
    data: WeeklyDay[];
}

const WeeklyChart: React.FC<WeeklyChartProps> = ({ data }) => {
    const max = Math.max(...data.map(d => d.count), 1);
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className={styles.wrap}>
            <div className={styles.bars}>
                {data.map(day => {
                    const isToday = day.date === today;
                    const heightPct = (day.count / max) * 100;

                    return (
                        <div key={day.date} className={styles.col}>
                            <div className={styles.valLabel}>{day.count > 0 ? day.count : ''}</div>
                            <div className={styles.barWrap}>
                                <div
                                    className={`${styles.bar} ${isToday ? styles.barToday : ''}`}
                                    style={{ height: `${Math.max(heightPct, day.count > 0 ? 4 : 0)}%` }}
                                />
                            </div>
                            <div className={`${styles.dayLabel} ${isToday ? styles.dayToday : ''}`}>
                                {day.label}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default WeeklyChart;