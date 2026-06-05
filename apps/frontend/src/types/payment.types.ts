export type PlanType = 'FREE' | 'PRO' | 'TEAM';
export type BillingCycle = 'monthly' | 'annual';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
export type SubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'TRIALING';

export interface PlanLimits {
    maxSets: number | null;
    maxCardsPerSet: number | null;
    maxAiMessagesPerDay: number | null;
    canAccessGames: boolean;
    canAccessCourses: boolean;
    canAccessAnalytics: boolean;
    canExport: boolean;
    teamSeats: number;
}

export interface Subscription {
    id: string;
    plan: PlanType;
    status: SubscriptionStatus;
    startedAt: string;
    expiresAt: string | null;
    cancelledAt: string | null;
    limits: PlanLimits;
    payments: PaymentHistory[];
}

export interface PaymentHistory {
    id: string;
    amount: number;
    currency: string;
    plan: PlanType;
    billingCycle: BillingCycle;
    status: PaymentStatus;
    reference: string;
    paidAt: string | null;
    createdAt: string;
}

export interface UsageStats {
    sets: { used: number; limit: number | null };
    aiMessages: { used: number; limit: number | null };
}

export const PLAN_PRICING = {
    PRO: { monthly: 9.99, annual: 7.99 },
    TEAM: { monthly: 24.99, annual: 19.99 },
};

export const PLAN_FEATURES: Record<PlanType, string[]> = {
    FREE: [
        '3 bộ thẻ flashcard',
        '50 thẻ mỗi bộ',
        'Chế độ kiểm tra cơ bản',
        '10 tin nhắn AI / ngày',
    ],
    PRO: [
        'Không giới hạn bộ thẻ flashcard',
        'Không giới hạn tin nhắn AI',
        'Tất cả trò chơi',
        'Toàn bộ khóa học',
        'Phân tích tiến độ',
        'Xuất dữ liệu & báo cáo',
    ],
    TEAM: [
        'Tất cả tính năng Pro',
        '5 thành viên nhóm',
        'Chia sẻ bộ thẻ flashcard',
        'Bảng phân tích nhóm',
        'Hỗ trợ ưu tiên',
    ],
};