import React from 'react';
import styles from './AdminPageHeader.less';

interface Props {
  title: string;
  sub?: string;
  actions?: React.ReactNode;
}

const AdminPageHeader: React.FC<Props> = ({ title, sub, actions }) => (
  <div className={styles.header}>
    <div className={styles.main}>
      <div>
        <h1 className={styles.title}>{title}</h1>
        {sub && <p className={styles.sub}>{sub}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
    <div className={styles.divider} />
  </div>
);

export default AdminPageHeader;
