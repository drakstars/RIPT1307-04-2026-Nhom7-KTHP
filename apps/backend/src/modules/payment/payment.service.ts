import {
    Injectable, NotFoundException, BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PlanType } from '@prisma/client';
import { PLAN_PRICING, PLAN_LIMITS } from './plan.config';

interface MockPaymentPayload {
    plan: PlanType;
    billingCycle: 'monthly' | 'annual';
    // In real: card token from Stripe.js
    mockCardLast4?: string;
}

@Injectable()
export class PaymentService {
    constructor(private readonly prisma: PrismaService) { }

    // ─── Get current subscription ────────────────────────────

    async getSubscription(userId: number) {
        const sub = await this.prisma.subscription.findUnique({
            where: { userId },
            include: {
                payments: {
                    orderBy: { createdAt: 'desc' },
                    take: 12,
                },
            },
        });

        if (!sub) {
            // Auto-create FREE subscription
            return this.prisma.subscription.create({
                data: { userId, plan: 'FREE' },
                include: { payments: true },
            });
        }

        return {
            ...sub,
            limits: PLAN_LIMITS[sub.plan],
        };
    }

    // ─── Get plan limits for current user ────────────────────

    async getLimits(userId: number) {
        const sub = await this.prisma.subscription.findUnique({
            where: { userId },
            select: { plan: true, status: true },
        });

        const plan = sub?.plan ?? 'FREE';
        return { plan, limits: PLAN_LIMITS[plan] };
    }

    // ─── Mock payment / upgrade ───────────────────────────────

    async upgradePlan(userId: number, payload: MockPaymentPayload) {
        if (payload.plan === 'FREE') {
            throw new BadRequestException('Cannot purchase FREE plan');
        }

        const pricing = PLAN_PRICING[payload.plan as 'PRO' | 'TEAM'];
        if (!pricing) throw new BadRequestException('Invalid plan');

        const amount = payload.billingCycle === 'annual' ? pricing.annual : pricing.monthly;

        // Simulate 95% success, 5% failure
        const success = Math.random() > 0.05;

        if (!success) {
            // Log failed attempt
            const sub = await this.prisma.subscription.findUnique({ where: { userId } });
            if (sub) {
                await this.prisma.paymentHistory.create({
                    data: {
                        subscriptionId: sub.id,
                        userId,
                        amount,
                        plan: payload.plan,
                        billingCycle: payload.billingCycle,
                        status: 'FAILED',
                    },
                });
            }
            throw new BadRequestException('Payment failed. Please try again.');
        }

        // Calculate expiry
        const expiresAt = new Date();
        if (payload.billingCycle === 'annual') {
            expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        } else {
            expiresAt.setMonth(expiresAt.getMonth() + 1);
        }

        // Upsert subscription
        const sub = await this.prisma.subscription.upsert({
            where: { userId },
            update: {
                plan: payload.plan,
                status: 'ACTIVE',
                startedAt: new Date(),
                expiresAt,
                cancelledAt: null,
            },
            create: {
                userId,
                plan: payload.plan,
                status: 'ACTIVE',
                expiresAt,
            },
        });

        // Log payment
        const payment = await this.prisma.paymentHistory.create({
            data: {
                subscriptionId: sub.id,
                userId,
                amount,
                plan: payload.plan,
                billingCycle: payload.billingCycle,
                status: 'SUCCESS',
                paidAt: new Date(),
                receiptUrl: `/receipts/${sub.id}`,
            },
        });

        return {
            success: true,
            subscription: { ...sub, limits: PLAN_LIMITS[sub.plan] },
            payment,
        };
    }

    // ─── Downgrade / Cancel ───────────────────────────────────

    async cancelSubscription(userId: number) {
        const sub = await this.prisma.subscription.findUnique({ where: { userId } });
        if (!sub) throw new NotFoundException();
        if (sub.plan === 'FREE') throw new BadRequestException('No active paid subscription');

        // Mark as cancelled — keep active until expiresAt
        return this.prisma.subscription.update({
            where: { userId },
            data: {
                status: 'CANCELLED',
                cancelledAt: new Date(),
            },
        });
    }

    // ─── Downgrade to FREE immediately ───────────────────────

    async downgradeFree(userId: number) {
        return this.prisma.subscription.update({
            where: { userId },
            data: {
                plan: 'FREE',
                status: 'ACTIVE',
                expiresAt: null,
                cancelledAt: new Date(),
            },
        });
    }

    // ─── Check specific limit ─────────────────────────────────

    async checkLimit(userId: number, feature: string): Promise<boolean> {
        const sub = await this.prisma.subscription.findUnique({
            where: { userId },
            select: { plan: true },
        });

        const plan = sub?.plan ?? 'FREE';
        const limits = PLAN_LIMITS[plan] as Record<string, any>;
        return !!limits[feature];
    }

    // ─── Usage stats (for billing portal) ────────────────────

    async getUsage(userId: number) {
        const [setCount, aiMessages] = await Promise.all([
            this.prisma.flashcardSet.count({ where: { userId } }),
            this.prisma.chatMessage.count({
                where: {
                    role: 'user',
                    conversation: { userId },
                    createdAt: { gte: new Date(new Date().setDate(1)) }, // this month
                },
            }),
        ]);

        const sub = await this.prisma.subscription.findUnique({
            where: { userId },
            select: { plan: true },
        });

        const plan = sub?.plan ?? 'FREE';
        const limits = PLAN_LIMITS[plan];

        return {
            sets: { used: setCount, limit: limits.maxSets },
            aiMessages: { used: aiMessages, limit: limits.maxAiMessagesPerDay },
        };
    }
}