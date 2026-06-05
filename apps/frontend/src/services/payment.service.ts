import { api } from './api';
import type {
    Subscription, PlanLimits, UsageStats, PlanType, BillingCycle,
} from '@/types/payment.types';

const BASE = '/payment';

export const paymentService = {
    getSubscription: (): Promise<Subscription> =>
        api.get(`${BASE}/subscription`).then(r => r.data),

    getLimits: (): Promise<{ plan: PlanType; limits: PlanLimits }> =>
        api.get(`${BASE}/limits`).then(r => r.data),

    getUsage: (): Promise<UsageStats> =>
        api.get(`${BASE}/usage`).then(r => r.data),

    upgrade: (plan: PlanType, billingCycle: BillingCycle) =>
        api.post(`${BASE}/upgrade`, { plan, billingCycle }).then(r => r.data),

    cancel: () =>
        api.delete(`${BASE}/subscription`).then(r => r.data),
};