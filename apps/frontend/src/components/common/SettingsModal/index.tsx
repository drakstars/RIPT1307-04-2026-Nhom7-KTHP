import React, { useState, useEffect } from 'react';
import {
  Modal,
  Switch,
  Radio,
  Select,
  InputNumber,
  Button,
  Form,
  Divider,
  Input,
  Popconfirm,
  message,
  Segmented,
} from 'antd';
import {
  useSettingsStore,
  AccentColor,
  FontSize,
  Theme,
} from '@/stores/settings.store';
import { useAuthStore } from '@/stores/auth.store';
import { api } from '@/services/api';
import styles from './index.less';

interface SettingsModalProps {
  open: boolean;
  onCancel: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ open, onCancel }) => {
  const store = useSettingsStore();
  const { logout } = useAuthStore();
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  // Sync staged local values with store when opening modal
  useEffect(() => {
    if (open) {
      // Refresh settings from server
      store.fetchSettings().then(() => {
        form.setFieldsValue({
          emailNotifications: store.emailNotifications,
          streakReminder: store.streakReminder,
          reviewAlerts: store.reviewAlerts,
          achievementAlerts: store.achievementAlerts,
          dailyGoal: store.dailyGoal,
          autoPlayPronunciation: store.autoPlayPronunciation,
          showRomanization: store.showRomanization,
          cardsPerSession: store.cardsPerSession,
          publicProfile: store.publicProfile,
          showStreakLeaderboard: store.showStreakLeaderboard,
        });
      });
    }
  }, [open, form]);

  // Save non-appearance settings
  const handleSave = async (values: any) => {
    setLoading(true);
    try {
      store.updateSettings({
        emailNotifications: values.emailNotifications,
        streakReminder: values.streakReminder,
        reviewAlerts: values.reviewAlerts,
        achievementAlerts: values.achievementAlerts,
        dailyGoal: values.dailyGoal,
        autoPlayPronunciation: values.autoPlayPronunciation,
        showRomanization: values.showRomanization,
        cardsPerSession: values.cardsPerSession,
        publicProfile: values.publicProfile,
        showStreakLeaderboard: values.showStreakLeaderboard,
      });

      // Instantly trigger sync
      await store.saveSettingsToServer();
      message.success('Cập nhật cấu hình thành công!');
      onCancel();
    } catch {
      message.error('Lỗi khi lưu cấu hình cài đặt.');
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const handlePasswordChange = async (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('Mật khẩu nhập lại không khớp!');
      return;
    }

    setPwdLoading(true);
    try {
      await api.put('/users/password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      message.success('Thay đổi mật khẩu thành công!');
      passwordForm.resetFields();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Lỗi khi thay đổi mật khẩu.';
      message.error(msg);
    } finally {
      setPwdLoading(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    try {
      await api.delete('/users/me');
      message.success('Tài khoản của bạn đã được xóa.');
      await logout();
      window.location.href = '/login';
    } catch {
      message.error('Lỗi khi xóa tài khoản.');
    }
  };

  // Export data
  const handleExportData = async () => {
    try {
      const response = await api.get('/export/progress', { responseType: 'blob' });
      // Create element to trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `elp-user-data-export-${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success('Xuất dữ liệu học tập thành công!');
    } catch {
      message.error('Lỗi khi xuất dữ liệu học tập.');
    }
  };

  return (
    <Modal
      open={open}
      title="Cài đặt"
      onCancel={onCancel}
      footer={null}
      width={520}
      className={styles.modal}
      centered
    >
      <div className={styles.scrollableBody}>
        {/* APPEARANCE SECTION (No save required) */}
        <div className={styles.section}>
          <h3 className={styles.sectionHeader}>Giao diện</h3>
          <div className={styles.settingRow}>
            <span>Chế độ nền tối (Dark mode)</span>
            <Switch
              checked={store.theme === 'dark'}
              onChange={(checked) => store.setTheme(checked ? 'dark' : 'light')}
              checkedChildren="Tối"
              unCheckedChildren="Sáng"
            />
          </div>

          <div className={styles.settingBlock}>
            <span className={styles.label}>Màu chủ đạo</span>
            <Radio.Group
              value={store.accentColor}
              onChange={(e) => store.setAccentColor(e.target.value as AccentColor)}
              className={styles.accentGrid}
            >
              <Radio.Button value="chartreuse" className={`${styles.accentBtn} ${styles.presetChartreuse}`}>
                Chartreuse
              </Radio.Button>
              <Radio.Button value="blue" className={`${styles.accentBtn} ${styles.presetBlue}`}>
                Xanh dương
              </Radio.Button>
              <Radio.Button value="purple" className={`${styles.accentBtn} ${styles.presetPurple}`}>
                Tím
              </Radio.Button>
              <Radio.Button value="green" className={`${styles.accentBtn} ${styles.presetGreen}`}>
                Xanh lá
              </Radio.Button>
              <Radio.Button value="orange" className={`${styles.accentBtn} ${styles.presetOrange}`}>
                Cam
              </Radio.Button>
              <Radio.Button value="pink" className={`${styles.accentBtn} ${styles.presetPink}`}>
                Hồng
              </Radio.Button>
            </Radio.Group>
          </div>

          <div className={styles.settingRow}>
            <span>Kích thước chữ</span>
            <Segmented
              value={store.fontSize}
              onChange={(value) => store.setFontSize(value as FontSize)}
              options={[
                { label: 'Nhỏ', value: 'small' },
                { label: 'Mặc định', value: 'default' },
                { label: 'Lớn', value: 'large' },
              ]}
            />
          </div>
        </div>

        <Divider />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          className={styles.settingsForm}
        >
          {/* NOTIFICATIONS SECTION */}
          <div className={styles.section}>
            <h3 className={styles.sectionHeader}>Thông báo</h3>
            <Form.Item name="emailNotifications" valuePropName="checked" className={styles.formSwitchRow}>
              <div className={styles.switchLabelRow}>
                <span>Nhận thông báo qua Email</span>
                <Switch />
              </div>
            </Form.Item>

            <Form.Item name="streakReminder" valuePropName="checked" className={styles.formSwitchRow}>
              <div className={styles.switchLabelRow}>
                <span>Nhắc nhở chuỗi Streak</span>
                <Switch />
              </div>
            </Form.Item>

            <Form.Item name="reviewAlerts" valuePropName="checked" className={styles.formSwitchRow}>
              <div className={styles.switchLabelRow}>
                <span>Nhắc nhở ôn tập thẻ Flashcard</span>
                <Switch />
              </div>
            </Form.Item>

            <Form.Item name="achievementAlerts" valuePropName="checked" className={styles.formSwitchRow}>
              <div className={styles.switchLabelRow}>
                <span>Nhận huy hiệu & Thành tích mới</span>
                <Switch />
              </div>
            </Form.Item>
          </div>

          <Divider />

          {/* STUDY PREFERENCES */}
          <div className={styles.section}>
            <h3 className={styles.sectionHeader}>Cài đặt học tập</h3>
            <div className={styles.studyGrid}>
              <Form.Item
                name="dailyGoal"
                label="Mục tiêu thẻ ôn tập hằng ngày"
                rules={[{ required: true, message: 'Nhập số thẻ!' }]}
              >
                <InputNumber min={10} max={200} style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                name="cardsPerSession"
                label="Số lượng thẻ mỗi lượt học"
              >
                <Select
                  options={[
                    { value: 10, label: '10 thẻ' },
                    { value: 20, label: '20 thẻ' },
                    { value: 30, label: '30 thẻ' },
                    { value: 50, label: '50 thẻ' },
                  ]}
                />
              </Form.Item>
            </div>

            <Form.Item name="autoPlayPronunciation" valuePropName="checked" className={styles.formSwitchRow}>
              <div className={styles.switchLabelRow}>
                <span>Tự động phát âm thanh khi lật thẻ</span>
                <Switch />
              </div>
            </Form.Item>

            <Form.Item name="showRomanization" valuePropName="checked" className={styles.formSwitchRow}>
              <div className={styles.switchLabelRow}>
                <span>Hiển thị phiên âm quốc tế IPA</span>
                <Switch />
              </div>
            </Form.Item>
          </div>

          <Divider />

          {/* PRIVACY SECTION */}
          <div className={styles.section}>
            <h3 className={styles.sectionHeader}>Quyền riêng tư & Dữ liệu</h3>
            <Form.Item name="publicProfile" valuePropName="checked" className={styles.formSwitchRow}>
              <div className={styles.switchLabelRow}>
                <span>Công khai hồ sơ cá nhân</span>
                <Switch />
              </div>
            </Form.Item>

            <Form.Item name="showStreakLeaderboard" valuePropName="checked" className={styles.formSwitchRow}>
              <div className={styles.switchLabelRow}>
                <span>Hiển thị chuỗi Streak trên Bảng xếp hạng</span>
                <Switch />
              </div>
            </Form.Item>

            <div className={styles.dataExportRow}>
              <span>Xuất toàn bộ lịch sử tiến độ học tập (.json)</span>
              <Button type="dashed" onClick={handleExportData}>
                Xuất dữ liệu học tập
              </Button>
            </div>
          </div>

          {/* Staged values submit */}
          <div className={styles.saveSettingsFooter}>
            <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%', height: 40 }}>
              Lưu cài đặt chung
            </Button>
          </div>
        </Form>

        <Divider />

        {/* SECURITY & PASSWORD CHANGE */}
        <div className={styles.section}>
          <h3 className={styles.sectionHeader}>Thay đổi mật khẩu</h3>
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handlePasswordChange}
            className={styles.passwordForm}
          >
            <Form.Item
              name="currentPassword"
              label="Mật khẩu hiện tại"
              rules={[{ required: true, message: 'Nhập mật khẩu cũ!' }]}
            >
              <Input.Password placeholder="Mật khẩu hiện tại" />
            </Form.Item>

            <div className={styles.studyGrid}>
              <Form.Item
                name="newPassword"
                label="Mật khẩu mới"
                rules={[{ required: true, message: 'Nhập mật khẩu mới!' }]}
              >
                <Input.Password placeholder="Mật khẩu mới" />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Xác nhận mật khẩu"
                rules={[{ required: true, message: 'Xác nhận mật khẩu mới!' }]}
              >
                <Input.Password placeholder="Xác nhận mật khẩu mới" />
              </Form.Item>
            </div>

            <Button type="default" htmlType="submit" loading={pwdLoading} className={styles.changePwdBtn}>
              Cập nhật mật khẩu
            </Button>
          </Form>
        </div>

        <Divider />

        {/* DANGER ACCOUNT DELETION */}
        <div className={styles.section}>
          <h3 className={styles.sectionHeader} style={{ color: 'var(--danger)' }}>Khu vực nguy hiểm</h3>
          <div className={styles.dangerZone}>
            <div className={styles.dangerLabel}>
              <span className={styles.dangerTitle}>Xóa tài khoản vĩnh viễn</span>
              <span className={styles.dangerSub}>
                Toàn bộ dữ liệu tiến trình học tập, flashcard, và lịch sử thi của bạn sẽ biến mất vĩnh viễn.
              </span>
            </div>
            <Popconfirm
              title="Bạn chắc chắn muốn xóa tài khoản chứ?"
              description="Hành động này không thể hoàn tác vĩnh viễn."
              onConfirm={handleDeleteAccount}
              okText="Đồng ý, xóa tài khoản"
              cancelText="Hủy bỏ"
              okButtonProps={{ danger: true }}
            >
              <Button type="primary" danger>
                Xóa tài khoản
              </Button>
            </Popconfirm>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;
