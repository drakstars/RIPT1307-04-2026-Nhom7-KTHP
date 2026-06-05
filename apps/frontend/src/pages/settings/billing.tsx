import React, { useState } from 'react';
import { useNavigate } from 'umi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '@/services/payment.service';
import styles from './billing.less';

const BillingPage: React.FC = () => {
    const navigate = useNavigate();
    const qc = useQueryClient();
    const [confirmCancel, setConfirmCancel] = useState(false);

    const { data: sub, isLoading } = useQuery({
        queryKey: ['subscription'],
        queryFn: paymentService.getSubscription,
    });

    const { data: usage } = useQuery({
        queryKey: ['usage'],
        queryFn: paymentService.getUsage,
    });

    const cancelMutation = useMutation({
        mutationFn: paymentService.cancel,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['subscription'] });
            setConfirmCancel(false);
            alert('Đã huỷ gói. Bạn vẫn có thể sử dụng đến khi hết hạn.');
        },
    });

    if (isLoading) return (
        <div className={styles.centered}>
            <div style={{ width: 24, height: 24, border: '2px solid #242428', borderTopColor: '#E8FF57', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
        </div>
    );

    const plan = sub?.plan ?? 'FREE';
    const isPaid = plan !== 'FREE';

    const planLabel: Record<string, string> = { FREE: 'Miễn phí', PRO: 'Pro', TEAM: 'Nhóm' };
    const statusLabel: Record<string, string> = {
        ACTIVE: 'Đang hoạt động', CANCELLED: 'Đã huỷ', EXPIRED: 'Hết hạn', TRIALING: 'Dùng thử',
    };

    const formatDate = (d?: string | null) =>
        d ? new Date(d).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

    const usagePct = (used: number, limit: number | null) =>
        limit === null ? 0 : Math.min(Math.round((used / limit) * 100), 100);

    const usageCls = (pct: number) =>
        pct >= 90 ? styles.fillFull : pct >= 70 ? styles.fillWarn : styles.fillNorm;

    const paymentStatusLabel: Record<string, string> = {
        SUCCESS: 'Thành công', FAILED: 'Thất bại', PENDING: 'Đang xử lý', REFUNDED: 'Hoàn tiền',
    };

    return (
        <div className={styles.pg}>
            <div className={styles.top}>
                <h1 className={styles.title}>Thanh toán &amp; gói dịch vụ</h1>
            </div>

            {/* Current plan */}
            <div className={styles.card}>
                <div className={styles.cardHead}>
                    <span className={styles.cardTitle}>Gói hiện tại</span>
                    {plan !== 'TEAM' && (
                        <button className={styles.btnAccent} onClick={() => navigate('/pricing')}>
                            {isPaid ? 'Đổi gói' : 'Nâng cấp'}
                        </button>
                    )}
                </div>

                <div className={styles.planRow}>
                    <div>
                        <div className={styles.planName}>
                            {planLabel[plan] ?? plan}
                            <span className={`${styles.badge} ${sub?.status === 'ACTIVE' ? styles.badgeGreen : styles.badgeWarn}`}>
                                {statusLabel[sub?.status ?? ''] ?? sub?.status ?? 'Hoạt động'}
                            </span>
                        </div>
                        <div className={styles.planDetail}>
                            {isPaid
                                ? `Gia hạn ngày ${formatDate(sub?.expiresAt)}`
                                : 'Miễn phí mãi mãi'}
                            {sub?.status === 'CANCELLED' && ' · Đã huỷ — còn dùng đến hết hạn'}
                        </div>
                    </div>
                    {isPaid && (
                        <div className={styles.planPriceBlock}>
                            <div className={styles.planPrice}>
                                ${plan === 'PRO' ? '9.99' : '24.99'}
                            </div>
                            <div className={styles.planPricePeriod}>mỗi tháng</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Usage */}
            {usage && (
                <div className={styles.card}>
                    <div className={styles.cardHead}>
                        <span className={styles.cardTitle}>Mức sử dụng tháng này</span>
                    </div>
                    <div className={styles.usageList}>
                        {[
                            {
                                label: 'Bộ thẻ flashcard',
                                used: usage.sets.used,
                                limit: usage.sets.limit,
                            },
                            {
                                label: 'Tin nhắn AI hôm nay',
                                used: usage.aiMessages.used,
                                limit: usage.aiMessages.limit,
                            },
                        ].map(u => {
                            const pct = usagePct(u.used, u.limit);
                            return (
                                <div key={u.label} className={styles.usageRow}>
                                    <div className={styles.usageHead}>
                                        <span className={styles.usageLabel}>{u.label}</span>
                                        <span className={styles.usageVal}>
                                            {u.used} / {u.limit === null ? 'Không giới hạn' : u.limit}
                                        </span>
                                    </div>
                                    {u.limit !== null && (
                                        <div className={styles.usageBar}>
                                            <div
                                                className={`${styles.usageFill} ${usageCls(pct)}`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Payment history */}
            {(sub?.payments ?? []).length > 0 && (
                <div className={styles.card}>
                    <div className={styles.cardHead}>
                        <span className={styles.cardTitle}>Lịch sử thanh toán</span>
                    </div>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Ngày</th>
                                <th>Mô tả</th>
                                <th>Số tiền</th>
                                <th>Trạng thái</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {(sub?.payments ?? []).map(p => (
                                <tr key={p.id}>
                                    <td className={styles.muted}>{formatDate(p.paidAt ?? p.createdAt)}</td>
                                    <td>Gói {planLabel[p.plan] ?? p.plan} · {p.billingCycle === 'annual' ? 'hàng năm' : 'hàng tháng'}</td>
                                    <td>${p.amount.toFixed(2)}</td>
                                    <td>
                                        <span className={`${styles.badge} ${p.status === 'SUCCESS' ? styles.badgeGreen : p.status === 'FAILED' ? styles.badgeRed : styles.badgeNeutral}`}>
                                            {paymentStatusLabel[p.status] ?? p.status}
                                        </span>
                                    </td>
                                    <td>
                                        {p.status === 'SUCCESS' && (
                                            <button className={styles.btnSm}>Hoá đơn</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Cancel */}
            {isPaid && sub?.status === 'ACTIVE' && (
                <div className={styles.card}>
                    <div className={styles.cardHead}>
                        <span className={styles.cardTitle}>Vùng nguy hiểm</span>
                    </div>
                    <div className={styles.dangerRow}>
                        <div>
                            <div className={styles.dangerLabel}>Huỷ gói đăng ký</div>
                            <div className={styles.dangerSub}>
                                Bạn vẫn sử dụng gói {planLabel[plan]} đến ngày {formatDate(sub?.expiresAt)}
                            </div>
                        </div>
                        {!confirmCancel ? (
                            <button className={styles.btnDanger} onClick={() => setConfirmCancel(true)}>
                                Huỷ gói
                            </button>
                        ) : (
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <span style={{ fontSize: 13, color: '#aaa' }}>Xác nhận huỷ?</span>
                                <button
                                    className={styles.btnDanger}
                                    disabled={cancelMutation.isPending}
                                    onClick={() => cancelMutation.mutate()}
                                >
                                    {cancelMutation.isPending ? 'Đang huỷ…' : 'Xác nhận'}
                                </button>
                                <button
                                    className={styles.btnAccent}
                                    onClick={() => setConfirmCancel(false)}
                                >
                                    Giữ gói
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BillingPage;