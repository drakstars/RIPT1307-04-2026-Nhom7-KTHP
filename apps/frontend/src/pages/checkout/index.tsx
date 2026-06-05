import React, { useState } from 'react';
import { useNavigate, useLocation } from 'umi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '@/services/payment.service';
import { usePlanStore } from '@/stores/plan.store';
import { PLAN_PRICING, PLAN_FEATURES, type PlanType, type BillingCycle } from '@/types/payment.types';
import styles from './index.less';

const PLAN_LABEL: Record<string, string> = { PRO: 'Pro', TEAM: 'Nhóm' };

const CheckoutPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const plan = (params.get('plan') ?? 'PRO') as PlanType;
    const cycle = (params.get('cycle') ?? 'monthly') as BillingCycle;
    const qc = useQueryClient();
    const { setPlan } = usePlanStore();

    const [form, setForm] = useState({
        cardNumber: '',
        expiry: '',
        cvc: '',
        name: '',
        country: 'Việt Nam',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [toast, setToast] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

    const pricing = PLAN_PRICING[plan as 'PRO' | 'TEAM'];
    const amount = pricing ? (cycle === 'annual' ? pricing.annual : pricing.monthly) : 0;

    const showToast = (type: 'ok' | 'err', msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4000);
    };

    const upgradeMutation = useMutation({
        mutationFn: () => paymentService.upgrade(plan, cycle),
        onSuccess: (data) => {
            setPlan(data.subscription.plan, data.subscription.limits);
            qc.invalidateQueries({ queryKey: ['subscription'] });
            showToast('ok', `Nâng cấp thành công! Chào mừng đến với gói ${PLAN_LABEL[plan]}!`);
            setTimeout(() => navigate('/settings/billing'), 1500);
        },
        onError: (err: any) => {
            showToast('err', err?.response?.data?.message ?? 'Thanh toán thất bại. Vui lòng thử lại.');
        },
    });

    const validate = () => {
        const e: Record<string, string> = {};
        if (form.cardNumber.replace(/\s/g, '').length < 16) e.cardNumber = 'Số thẻ không hợp lệ';
        if (!form.expiry.match(/^\d{2}\/\d{2}$/)) e.expiry = 'Định dạng: MM/YY';
        if (form.cvc.length < 3) e.cvc = 'CVC không hợp lệ';
        if (!form.name.trim()) e.name = 'Vui lòng nhập tên trên thẻ';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;
        upgradeMutation.mutate();
    };

    const formatCard = (v: string) =>
        v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

    const formatExpiry = (v: string) =>
        v.replace(/\D/g, '').slice(0, 4).replace(/^(.{2})(.+)/, '$1/$2');

    const features = PLAN_FEATURES[plan] ?? [];

    if (!pricing) {
        return (
            <div style={{ padding: 32, color: '#F2F2F2' }}>
                <p>Gói không hợp lệ: <b>{plan}</b></p>
                <button onClick={() => navigate('/pricing')} style={{ color: '#E8FF57' }}>← Quay lại</button>
            </div>
        );
    }

    return (
        <div className={styles.pg}>
            {/* Toast */}
            {toast && (
                <div className={toast.type === 'ok' ? styles.toastOk : styles.toastErr}>
                    {toast.type === 'ok' ? '✓' : '✕'} {toast.msg}
                </div>
            )}

            <button className={styles.backBtn} onClick={() => navigate('/pricing')}>
                ← Quay lại bảng giá
            </button>

            <div className={styles.layout}>
                {/* Form */}
                <div className={styles.form}>
                    <h2 className={styles.formTitle}>Hoàn tất nâng cấp</h2>

                    <div className={styles.mockNotice}>
                        ⚠ Thanh toán mô phỏng — không tính phí thật. Nhập bất kỳ thông tin thẻ nào.
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Số thẻ</label>
                        <input
                            className={`${styles.inp} ${errors.cardNumber ? styles.inpErr : ''}`}
                            placeholder="4242 4242 4242 4242"
                            value={form.cardNumber}
                            onChange={e => setForm(f => ({ ...f, cardNumber: formatCard(e.target.value) }))}
                        />
                        {errors.cardNumber && <span className={styles.errMsg}>{errors.cardNumber}</span>}
                    </div>

                    <div className={styles.twoCol}>
                        <div className={styles.field}>
                            <label className={styles.label}>Ngày hết hạn</label>
                            <input
                                className={`${styles.inp} ${errors.expiry ? styles.inpErr : ''}`}
                                placeholder="MM/YY"
                                value={form.expiry}
                                onChange={e => setForm(f => ({ ...f, expiry: formatExpiry(e.target.value) }))}
                            />
                            {errors.expiry && <span className={styles.errMsg}>{errors.expiry}</span>}
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>CVC</label>
                            <input
                                className={`${styles.inp} ${errors.cvc ? styles.inpErr : ''}`}
                                placeholder="123"
                                value={form.cvc}
                                maxLength={4}
                                onChange={e => setForm(f => ({ ...f, cvc: e.target.value.replace(/\D/g, '') }))}
                            />
                            {errors.cvc && <span className={styles.errMsg}>{errors.cvc}</span>}
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Tên chủ thẻ</label>
                        <input
                            className={`${styles.inp} ${errors.name ? styles.inpErr : ''}`}
                            placeholder="Nguyễn Văn A"
                            value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        />
                        {errors.name && <span className={styles.errMsg}>{errors.name}</span>}
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Quốc gia</label>
                        <select
                            className={styles.inp}
                            value={form.country}
                            onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                        >
                            <option>Việt Nam</option>
                            <option>Hoa Kỳ</option>
                            <option>Singapore</option>
                            <option>Thái Lan</option>
                            <option>Nhật Bản</option>
                            <option>Hàn Quốc</option>
                        </select>
                    </div>

                    <button
                        className={styles.payBtn}
                        onClick={handleSubmit}
                        disabled={upgradeMutation.isPending}
                    >
                        {upgradeMutation.isPending
                            ? 'Đang xử lý…'
                            : `Thanh toán $${amount} →`}
                    </button>

                    <div className={styles.secureNote}>🔒 Thanh toán mô phỏng · Không tính phí thật</div>
                </div>

                {/* Order summary */}
                <div className={styles.orderCard}>
                    <div className={styles.orderHead}>
                        <div>
                            <div className={styles.orderPlanName}>Gói {PLAN_LABEL[plan] ?? plan}</div>
                            <div className={styles.orderBilling}>
                                {cycle === 'annual' ? 'Thanh toán hàng năm · tiết kiệm 20%' : 'Thanh toán hàng tháng · huỷ bất cứ lúc nào'}
                            </div>
                        </div>
                        <div>
                            <div className={styles.orderPrice}>${amount}</div>
                            <div className={styles.orderPeriod}>
                                {cycle === 'annual' ? '/ tháng' : '/ tháng'}
                            </div>
                        </div>
                    </div>

                    <div className={styles.orderRows}>
                        <div className={styles.orderRow}>
                            <span className={styles.orderRowLabel}>Tạm tính</span>
                            <span>${amount}</span>
                        </div>
                        <div className={styles.orderRow}>
                            <span className={styles.orderRowLabel}>Giảm giá</span>
                            <span className={styles.green}>
                                {cycle === 'annual' ? '20%' : '$0.00'}
                            </span>
                        </div>
                    </div>

                    <div className={styles.orderTotal}>
                        <span>Tổng hôm nay</span>
                        <span className={styles.orderTotalAmount}>${amount}</span>
                    </div>

                    <div className={styles.orderFeatures}>
                        {features.map(f => (
                            <div key={f} className={styles.orderFeature}>
                                <span className={styles.orderCheck}>✓</span>
                                {f}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;