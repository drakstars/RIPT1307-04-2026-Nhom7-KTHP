import React from 'react';
import type { GameResult as IGameResult } from '@/types/game.types';
import { useTranslation } from '@/hooks/useTranslation';
import styles from './index.less';

interface Props {
    result: IGameResult;
    onReplay: () => void;
    onBack: () => void;
}

const GameResult: React.FC<Props> = ({ result, onReplay, onBack }) => {
    const { t } = useTranslation();
    const label =
        result.pct >= 90 ? t('gameResultExcellent') :
            result.pct >= 70 ? t('gameResultGreatWork') :
                result.pct >= 50 ? t('gameResultGoodEffort') : t('gameResultKeepPracticing');

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
    };

    return (
        <div className={styles.wrap}>
            <div className={styles.circle}>
                <div className={styles.pct}>{result.pct}%</div>
                <div className={styles.sub}>{t('scoreLabelText')}</div>
            </div>
            <div className={styles.label}>{label}</div>
            <div className={styles.stats}>
                <div className={styles.stat}>
                    <div className={styles.statVal} style={{ color: '#3ECF8E' }}>{result.score}</div>
                    <div className={styles.statLabel}>{t('correctLabelText')}</div>
                </div>
                <div className={styles.stat}>
                    <div className={styles.statVal} style={{ color: '#FF5B5B' }}>{result.errors}</div>
                    <div className={styles.statLabel}>{t('errorsLabelText')}</div>
                </div>
                <div className={styles.stat}>
                    <div className={styles.statVal}>{formatTime(result.timeTaken)}</div>
                    <div className={styles.statLabel}>{t('timeLabelText')}</div>
                </div>
            </div>
            <div className={styles.actions}>
                <button className={styles.btnSecondary} onClick={onBack}>{t('backToGamesBtnText')}</button>
                <button className={styles.btnPrimary} onClick={onReplay}>{t('playAgainBtnText')}</button>
            </div>
        </div>
    );
};

export default GameResult;