import { create } from 'zustand';
import type { PlanType, PlanLimits } from '@/types/payment.types';

interface PlanState {
    plan: PlanType;
    limits: PlanLimits | null;
    setPlan: (plan: PlanType, limits: PlanLimits) => void;
    isPro: () => boolean;
    isTeam: () => boolean;
    canDo: (feature: keyof PlanLimits) => boolean;
}

const FREE_LIMITS: PlanLimits = {
    maxSets: 3,
    maxCardsPerSet: 50,
    maxAiMessagesPerDay: 10,
    canAccessGames: false,
    canAccessCourses: false,
    canAccessAnalytics: false,
    canExport: false,
    teamSeats: 1,
};

export const usePlanStore = create<PlanState>((set, get) => ({
    plan: 'FREE',
    limits: FREE_LIMITS,

    setPlan: (plan, limits) => set({ plan, limits }),

    isPro: () => ['PRO', 'TEAM'].includes(get().plan),
    isTeam: () => get().plan === 'TEAM',

    canDo: (feature) => {
        const limits = get().limits;
        if (!limits) return false;
        const val = limits[feature];
        if (typeof val === 'boolean') return val;
        if (typeof val === 'number') return val > 0;
        return val !== null;
    },
}));