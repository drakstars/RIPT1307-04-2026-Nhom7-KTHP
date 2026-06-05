import React from 'react';
import { useNavigate } from 'umi';
import { useQuery } from '@tanstack/react-query';
import { flashcardService } from '@/services/flashcards.service';
import styles from './index.less';

const GAMES = [
    {
        id: 'matching',
        icon: '⬡',
        title: 'Word matching',
        desc: 'Match English words to their meanings before time runs out.',
        badge: 'Fast paced',
        badgeCls: 'accent',
        minCards: 6,
    },
    {
        id: 'memory',
        icon: '◻',
        title: 'Memory cards',
        desc: 'Flip and match word-definition pairs. Train your recall.',
        badge: 'Memory',
        badgeCls: 'purple',
        minCards: 4,
    },
    {
        id: 'drag',
        icon: '◈',
        title: 'Drag & drop',
        desc: 'Fill blanks with the correct words to complete sentences.',
        badge: 'Vocabulary',
        badgeCls: 'green',
        minCards: 5,
    },
];

const GamesLobbyPage: React.FC = () => {
    const navigate = useNavigate();

    const { data: sets } = useQuery({
        queryKey: ['flashcard-sets'],
        queryFn: flashcardService.getSets,
    });

    const usableSets = (sets ?? []).filter(s => (s._count?.flashcards ?? 0) >= 5);

    return (
        <div className={styles.pg}>
            <div className={styles.top}>
                <h1 className={styles.title}>Mini games</h1>
                <p className={styles.sub}>Learn while playing · using your flashcard sets</p>
            </div>

            {usableSets.length === 0 && (
                <div className={styles.notice}>
                    You need at least 5 cards in a set to play.{' '}
                    <span onClick={() => navigate('/flashcards/create')}>Create a set →</span>
                </div>
            )}

            <div className={styles.grid}>
                {GAMES.map(game => (
                    <div key={game.id} className={styles.card}>
                        <div className={styles.cardIcon}>{game.icon}</div>
                        <div className={styles.cardTitle}>{game.title}</div>
                        <div className={styles.cardDesc}>{game.desc}</div>
                        <div className={styles.cardFoot}>
                            <span className={`${styles.badge} ${styles[game.badgeCls]}`}>
                                {game.badge}
                            </span>
                            <button
                                className={styles.playBtn}
                                disabled={usableSets.length === 0}
                                onClick={() => navigate(`/games/${game.id}`)}
                            >
                                Play →
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {usableSets.length > 0 && (
                <div>
                    <div className={styles.sectionLabel}>Your sets</div>
                    <div className={styles.setList}>
                        {usableSets.map(set => (
                            <div key={set.id} className={styles.setRow}>
                                <div>
                                    <div className={styles.setName}>{set.title}</div>
                                    <div className={styles.setMeta}>{set._count?.flashcards} cards</div>
                                </div>
                                <div className={styles.setActions}>
                                    <button className={styles.setBtn} onClick={() => navigate(`/games/matching?set=${set.id}`)}>Match</button>
                                    <button className={styles.setBtn} onClick={() => navigate(`/games/memory?set=${set.id}`)}>Memory</button>
                                    <button className={styles.setBtn} onClick={() => navigate(`/games/drag?set=${set.id}`)}>Fill</button>
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