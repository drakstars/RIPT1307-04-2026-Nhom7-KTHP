import React from 'react';
import type { GameResult } from '@/types/game.types';
import styles from './index.less';

interface Props {
    result: GameResult;
    onReplay: () => void;
    onBack: () => void;
}

const GameResult: React.FC<Props> = ({ result, onReplay, onBack }) => {
    const label =
        result.pct >= 90 ? 'Excellent!' :
            result.pct >= 70 ? 'Great work!' :
                result.pct >= 50 ? 'Good effort.' : 'Keep practicing.';

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
    };

    return (
        <div className={styles.wrap}>
            <div className={styles.circle}>
                <div className={styles.pct}>{result.pct}%</div>
                <div className={styles.sub}>score</div>
            </div>
            <div className={styles.label}>{label}</div>
            <div className={styles.stats}>
                <div className={styles.stat}>
                    <div className={styles.statVal} style={{ color: '#3ECF8E' }}>{result.score}</div>
                    <div className={styles.statLabel}>Correct</div>
                </div>
                <div className={styles.stat}>
                    <div className={styles.statVal} style={{ color: '#FF5B5B' }}>{result.errors}</div>
                    <div className={styles.statLabel}>Errors</div>
                </div>
                <div className={styles.stat}>
                    <div className={styles.statVal}>{formatTime(result.timeTaken)}</div>
                    <div className={styles.statLabel}>Time</div>
                </div>
            </div>
            <div className={styles.actions}>
                <button className={styles.btnSecondary} onClick={onBack}>← Games</button>
                <button className={styles.btnPrimary} onClick={onReplay}>Play again</button>
            </div>
        </div>
    );
};

export default GameResult;