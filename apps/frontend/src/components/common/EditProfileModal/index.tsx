import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { useAuthStore } from '@/stores/auth.store';
import ImageUpload from '../ImageUpload';
import { api } from '@/services/api';
import styles from './index.less';

interface EditProfileModalProps {
  open: boolean;
  onCancel: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ open, onCancel }) => {
  const { user, setUser } = useAuthStore();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Initialize fields with current user profile
  useEffect(() => {
    if (open && user) {
      // Fetch fresh profile data
      api.get('/users/profile')
        .then(({ data }) => {
          form.setFieldsValue({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            bio: data.bio || '',
          });
          setAvatarUrl(data.avatarUrl || null);
        })
        .catch(() => {
          // Fallback to store user
          form.setFieldsValue({
            firstName: (user as any).firstName || '',
            lastName: (user as any).lastName || '',
            email: user.email || '',
            bio: (user as any).bio || '',
          });
          setAvatarUrl(user.avatarUrl || null);
        });
    }
  }, [open, user, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const { data } = await api.put('/users/profile', {
        firstName: values.firstName,
        lastName: values.lastName,
        bio: values.bio,
        avatarUrl,
      });

      // Update zustand store user state
      setUser(data);
      message.success('Cập nhật hồ sơ cá nhân thành công!');
      onCancel();
    } catch {
      message.error('Lỗi khi cập nhật hồ sơ cá nhân.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Chỉnh sửa hồ sơ"
      onCancel={onCancel}
      footer={null}
      width={480}
      className={styles.modal}
      centered
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className={styles.form}
      >
        {/* Avatar Upload Container */}
        <div className={styles.avatarSection}>
          <Form.Item label="Ảnh đại diện" className={styles.avatarLabel}>
            <ImageUpload value={avatarUrl} onChange={(url) => setAvatarUrl(url)} />
          </Form.Item>
        </div>

        <div className={styles.nameFields}>
          <Form.Item
            name="firstName"
            label="Tên"
            rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
          >
            <Input placeholder="Nhập tên" />
          </Form.Item>

          <Form.Item
            name="lastName"
            label="Họ"
            rules={[{ required: true, message: 'Vui lòng nhập họ!' }]}
          >
            <Input placeholder="Nhập họ" />
          </Form.Item>
        </div>

        <Form.Item
          name="email"
          label="Địa chỉ Email"
        >
          <Input disabled />
        </Form.Item>

        <Form.Item
          name="bio"
          label="Giới thiệu bản thân"
          help="Tối đa 160 ký tự"
        >
          <Input.TextArea
            rows={4}
            maxLength={160}
            showCount
            placeholder="Giới thiệu ngắn gọn về bản thân của bạn…"
          />
        </Form.Item>

        <div className={styles.footer}>
          <Button onClick={onCancel}>Hủy</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Lưu hồ sơ
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default EditProfileModal;
