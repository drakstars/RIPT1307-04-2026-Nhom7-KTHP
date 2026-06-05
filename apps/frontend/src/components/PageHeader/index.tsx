import React from 'react';
import styles from './index.less';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumb?: { label: string; path?: string }[];
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title, description, actions, breadcrumb,
}) => (
  <div className={styles.header}>
    {breadcrumb && (
      <div className={styles.breadcrumb}>
        {breadcrumb.map((b, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className={styles.sep}>/</span>}
            <span className={b.path ? styles.link : styles.current}>{b.label}</span>
          </React.Fragment>
        ))}
      </div>
    )}
    <div className={styles.row}>
      <div>
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.desc}>{description}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  </div>
);

export default PageHeader;