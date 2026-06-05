import React from 'react';
import styles from './index.less';

interface FlipCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  isFlipped: boolean;
  onClick: () => void;
}

const FlipCard: React.FC<FlipCardProps> = ({ front, back, isFlipped, onClick }) => (
  <div
    className={`${styles.scene} ${isFlipped ? styles.flipped : ''}`}
    onClick={onClick}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => e.key === 'Enter' && onClick()}
    aria-label={isFlipped ? 'Mặt sau thẻ. Nhấn để lật' : 'Mặt trước thẻ. Nhấn để lật'}
  >
    <div className={styles.card}>
      <div className={`${styles.face} ${styles.front}`}>{front}</div>
      <div className={`${styles.face} ${styles.back}`}>{back}</div>
    </div>
  </div>
);

export default FlipCard;