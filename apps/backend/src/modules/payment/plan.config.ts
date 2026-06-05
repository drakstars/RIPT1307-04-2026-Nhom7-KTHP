import { PlanType } from '@prisma/client';

export interface PlanLimits {
    maxSets: number | null;          // null = unlimited
    maxCardsPerSet: number | null;
    maxAiMessagesPerDay: number | null;
    canAccessGames: boolean;
    canAccessCourses: boolean;
    canAccessAnalytics: boolean;
    canExport: boolean;
    teamSeats: number;
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
    FREE: {
        maxSets: 3,
        maxCardsPerSet: 50,
        maxAiMessagesPerDay: 10,
        canAccessGames: false,
        canAccessCourses: false,
        canAccessAnalytics: false,
        canExport: false,
        teamSeats: 1,
    },
    PRO: {
        maxSets: null,
        maxCardsPerSet: null,
        maxAiMessagesPerDay: null,
        canAccessGames: true,
        canAccessCourses: true,
        canAccessAnalytics: true,
        canExport: true,
        teamSeats: 1,
    },
    TEAM: {
        maxSets: null,
        maxCardsPerSet: null,
        maxAiMessagesPerDay: null,
        canAccessGames: true,
        canAccessCourses: true,
        canAccessAnalytics: true,
        canExport: true,
        teamSeats: 5,
    },
};

export const PLAN_PRICING = {
    PRO: { monthly: 9.99, annual: 7.99 },
    TEAM: { monthly: 24.99, annual: 19.99 },
};