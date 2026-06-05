import React, { useState } from 'react';
import { useNavigate } from 'umi';
import { useQuery } from '@tanstack/react-query';
import { paymentService } from '@/services/payment.service';
import { PLAN_PRICING, PLAN_FEATURES, type PlanType, type BillingCycle } from '@/types/payment.types';
import styles from './index.less';

const PLANS: {
    type: PlanType;
    name: string;
    desc: string;
    featured?: boolean;
}[] = [
        { type: 'FREE', name: 'Miễn phí', desc: 'Dành cho người mới bắt đầu học.' },
        { type: 'PRO', name: 'Pro', desc: 'Dành cho người học nghiêm túc muốn đầy đủ công cụ.', featured: true },
        { type: 'TEAM', name: 'Nhóm', desc: 'Dành cho giáo viên và nhóm học tập tới 5 người.' },
    ];

const PricingPage: React.FC = () => {
    const navigate = useNavigate();
    const [cycle, setCycle] = useState<BillingCycle>('monthly');

    const { data: sub } = useQuery({
        queryKey: ['subscription'],
        queryFn: paymentService.getSubscription,
    });

    const currentPlan = sub?.plan ?? 'FREE';

    const getPrice = (plan: PlanType) => {
        if (plan === 'FREE') return '$0';
        const pricing = PLAN_PRICING[plan as 'PRO' | 'TEAM'];
        return `$${cycle === 'annual' ? pricing.annual : pricing.monthly}`;
    };

    const getPeriod = (plan: PlanType) => {
        if (plan === 'FREE') return 'mãi mãi';
        return cycle === 'annual' ? '/ tháng, thanh toán hàng năm' : '/ tháng';
    };

    return (
        <div className={styles.pg}>
            <div className={styles.head}>
                <h1 className={styles.title}>Bảng giá đơn giản, minh bạch.</h1>
                <p className={styles.sub}>Bắt đầu miễn phí. Nâng cấp khi bạn sẵn sàng.</p>

                <div className={styles.toggle}>
                    <span
                        className={`${styles.toggleOpt} ${cycle === 'monthly' ? styles.toggleOptOn : ''}`}
                        onClick={() => setCycle('monthly')}
                    >
                        Hàng tháng
                    </span>
                    <div
                        className={`${styles.togglePill} ${cycle === 'annual' ? styles.togglePillOn : ''}`}
                        onClick={() => setCycle(c => c === 'monthly' ? 'annual' : 'monthly')}
                    >
                        <div className={styles.toggleKnob} />
                    </div>
                    <span
                        className={`${styles.toggleOpt} ${cycle === 'annual' ? styles.toggleOptOn : ''}`}
                        onClick={() => setCycle('annual')}
                    >
                        Hàng năm
                        <span className={styles.saveBadge}>Tiết kiệm 20%</span>
                    </span>
                </div>
            </div>

            <div className={styles.plans}>
                {PLANS.map(plan => {
                    const isCurrent = plan.type === currentPlan;
                    const isDowngrade = ['FREE'].includes(plan.type) && currentPlan !== 'FREE';

                    return (
                        <div
                            key={plan.type}
                            className={`${styles.plan} ${plan.featured ? styles.planFeatured : ''}`}
                        >
                            {plan.featured && (
                                <div className={styles.popularBadge}>Phổ biến nhất</div>
                            )}

                            <div className={styles.planName}>{plan.name}</div>

                            <div className={styles.planPrice}>
                                <span className={`${styles.planAmount} ${plan.featured ? styles.planAmountAccent : ''}`}>
                                    {getPrice(plan.type)}
                                </span>
                                <span className={styles.planPeriod}>{getPeriod(plan.type)}</span>
                            </div>

                            <p className={styles.planDesc}>{plan.desc}</p>

                            <div className={styles.features}>
                                {PLAN_FEATURES[plan.type].map(f => (
                                    <div key={f} className={styles.feature}>
                                        <span className={styles.featureCheck}>✓</span>
                                        {f}
                                    </div>
                                ))}
                            </div>

                            <button
                                className={`${styles.planBtn}
                  ${isCurrent ? styles.planBtnCurrent : ''}
                  ${plan.featured && !isCurrent ? styles.planBtnPrimary : ''}
                  ${!plan.featured && !isCurrent ? styles.planBtnSecondary : ''}
                `}
                                disabled={isCurrent || isDowngrade}
                                onClick={() => {
                                    if (!isCurrent && plan.type !== 'FREE') {
                                        navigate(`/checkout?plan=${plan.type}&cycle=${cycle}`);
                                    }
                                }}
                            >
                                {isCurrent ? 'Gói hiện tại' : isDowngrade ? 'Liên hệ hỗ trợ' : `Nâng lên ${plan.name} →`}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PricingPage;