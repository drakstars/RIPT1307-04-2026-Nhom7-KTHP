import React, { useState, useRef } from 'react';
import { message } from 'antd';
import { api } from '@/services/api';
import styles from './index.less';

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange }) => {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      message.error('Ảnh phải nhỏ hơn 2MB!');
      return;
    }

    // Validate file type
    if (!file.type.match(/image\/(jpeg|jpg|png|webp|gif|svg\+xml)$/)) {
      message.error('Chỉ chấp nhận các định dạng ảnh (JPEG, PNG, WEBP, GIF, SVG)!');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data } = await api.post('/upload/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (data && data.url) {
        onChange(data.url);
        message.success('Tải ảnh đại diện lên thành công!');
      } else {
        throw new Error('No URL returned');
      }
    } catch {
      message.error('Lỗi khi tải ảnh đại diện lên, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const triggerSelectFile = () => {
    fileInputRef.current?.click();
  };

  const initialLetter = 'U';

  return (
    <div className={styles.container} onClick={triggerSelectFile}>
      <input
        type="file"
        ref={fileInputRef}
        className={styles.fileInput}
        onChange={handleUpload}
        accept="image/*"
      />
      <div className={styles.previewContainer}>
        {value ? (
          <img src={value} alt="Avatar Preview" className={styles.avatarImg} />
        ) : (
          <div className={styles.fallbackAvatar}>{initialLetter}</div>
        )}
        <div className={`${styles.overlay} ${loading ? styles.overlayLoading : ''}`}>
          {loading ? (
            <div className={styles.spinner} />
          ) : (
            <span className={styles.cameraIcon}>📷</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
