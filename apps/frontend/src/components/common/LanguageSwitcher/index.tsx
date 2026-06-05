import React from 'react';
import { Select } from 'antd';
import { useTranslation } from '@/hooks/useTranslation';
import styles from './index.less';

const { Option } = Select;

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useTranslation();

  return (
    <div className={styles.container}>
      <Select
        value={language}
        onChange={(val) => setLanguage(val as 'vi' | 'en')}
        classNames={{ popup: { root: styles.dropdown } }}
        size="middle"
        className={styles.select}
      >
        <Option value="vi">
          <span style={{ marginRight: '8px' }}>🇻🇳</span>
          Tiếng Việt
        </Option>
        <Option value="en">
          <span style={{ marginRight: '8px' }}>🇺🇸</span>
          English
        </Option>
      </Select>
    </div>
  );
};

export default LanguageSwitcher;
