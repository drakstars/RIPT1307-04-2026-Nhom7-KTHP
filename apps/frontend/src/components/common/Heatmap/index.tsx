import React, { useState } from 'react';
import type { ActivityDay } from '@/types/stats.types';
import styles from './index.less';

interface HeatmapProps {
    data: ActivityDay[];
}

const Heatmap: React.FC<HeatmapProps> = ({ data }) => {
    const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className={styles.wrap}>
            <div className={styles.grid}>
                {data.map(day => (
                    <div
                        key={day.date}
                        className={`${styles.cell} ${styles[`level${day.level}`]}`}
                        onMouseEnter={e => setTooltip({
                            text: `${formatDate(day.date)}: ${day.count} cards`,
                            x: (e.target as HTMLElement).getBoundingClientRect().left,
                            y: (e.target as HTMLElement).getBoundingClientRect().top,
                        })}
                        onMouseLeave={() => setTooltip(null)}
                    />
                ))}
            </div>

            {tooltip && (
                <div className={styles.tooltip} style={{ left: tooltip.x, top: tooltip.y - 32 }}>
                    {tooltip.text}
                </div>
            )}

            <div className={styles.legend}>
                <span>Less</span>
                <div className={styles.legendCells}>
                    {[0, 1, 2, 3, 4].map(l => (
                        <div key={l} className={`${styles.cell} ${styles[`level${l}`]}`} />
                    ))}
                </div>
                <span>More</span>
            </div>
        </div>
    );
};

export default Heatmap;