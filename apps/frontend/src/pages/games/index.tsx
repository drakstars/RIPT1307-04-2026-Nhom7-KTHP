import React from 'react';
import { useNavigate } from 'umi';
import { useQuery } from '@tanstack/react-query';
import { flashcardService } from '@/services/flashcards.service';
import { useTranslation } from '@/hooks/useTranslation';
import styles from './index.less';

const GAMES = [
    {
        id: 'matching',
        icon: '⬡',
        titleKey: 'gameMatchingTitle',
        descKey: 'gameMatchingDesc',
        badgeKey: 'gameMatchingBadge',
        badgeCls: 'accent',
        minCards: 6,
    },
    {
        id: 'memory',
        icon: '◻',
        titleKey: 'gameMemoryTitle',
        descKey: 'gameMemoryDesc',
        badgeKey: 'gameMemoryBadge',
        badgeCls: 'purple',
        minCards: 4,
    },
    {
        id: 'drag',
        icon: '◈',
        titleKey: 'gameDragTitle',
        descKey: 'gameDragDesc',
        badgeKey: 'gameDragBadge',
        badgeCls: 'green',
        minCards: 5,
    },
];

const GamesLobbyPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const { data: sets } = useQuery({
        queryKey: ['flashcard-sets'],
        queryFn: flashcardService.getSets,
    });

    const usableSets = (sets ?? []).filter(
        s => (s._count?.flashcards ?? s.flashcards?.length ?? 0) >= 5
    );

    return (
        <div className={styles.pg}>
            <div className={styles.top}>
                <h1 className={styles.title}>{t('gamesTitle')}</h1>
                <p className={styles.sub}>{t('gamesSub')}</p>
            </div>

            {usableSets.length === 0 && (
                <div className={styles.notice}>
                    {t('gamesMinCardsNotice')}{' '}
                    <span onClick={() => navigate('/flashcards/create')}>{t('gamesCreateSetLink')}</span>
                </div>
            )}

            <div className={styles.grid}>
                {GAMES.map(game => (
                    <div key={game.id} className={styles.card}>
                        <div className={styles.cardIcon}>{game.icon}</div>
                        <div className={styles.cardTitle}>{t(game.titleKey)}</div>
                        <div className={styles.cardDesc}>{t(game.descKey)}</div>
                        <div className={styles.cardFoot}>
                            <span className={`${styles.badge} ${styles[game.badgeCls]}`}>
                                {t(game.badgeKey)}
                            </span>
                            <button
                                className={styles.playBtn}
                                disabled={usableSets.length === 0}
                                onClick={() => navigate(`/games/${game.id}`)}
                            >
                                {t('playBtn')}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {usableSets.length > 0 && (
                <div>
                    <div className={styles.sectionLabel}>{t('yourSetsLabel')}</div>
                    <div className={styles.setList}>
                        {usableSets.map(set => (
                            <div key={set.id} className={styles.setRow}>
                                <div>
                                    <div className={styles.setName}>{set.title}</div>
                                    <div className={styles.setMeta}>
                                        {set._count?.flashcards ?? set.flashcards?.length ?? 0} {t('cardsUnit')}
                                    </div>
                                </div>
                                <div className={styles.setActions}>
                                    <button className={styles.setBtn} onClick={() => navigate(`/games/matching?set=${set.id}`)}>{t('btnMatch')}</button>
                                    <button className={styles.setBtn} onClick={() => navigate(`/games/memory?set=${set.id}`)}>{t('btnMemory')}</button>
                                    <button className={styles.setBtn} onClick={() => navigate(`/games/drag?set=${set.id}`)}>{t('btnFill')}</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GamesLobbyPage;