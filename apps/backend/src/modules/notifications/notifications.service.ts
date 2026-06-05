import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(userId: number) {
        return this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }

    async getUnreadCount(userId: number) {
        const count = await this.prisma.notification.count({
            where: { userId, read: false },
        });
        return { count };
    }

    async markRead(id: string, userId: number) {
        return this.prisma.notification.updateMany({
            where: { id, userId },
            data: { read: true },
        });
    }

    async markAllRead(userId: number) {
        return this.prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true },
        });
    }

    async deleteOne(id: string, userId: number) {
        return this.prisma.notification.deleteMany({ where: { id, userId } });
    }

    // ─── Create helpers (called internally) ────────────────

    async create(
        userId: number,
        type: NotificationType,
        title: string,
        body: string,
        data?: Record<string, unknown>,
    ) {
        return this.prisma.notification.create({
            data: { userId, type, title, body, data: data as any },
        });
    }

    async notifyStreakReminder(userId: number, streak: number) {
        return this.create(
            userId,
            'STREAK_REMINDER',
            'Keep your streak alive! 🔥',
            `You have a ${streak}-day streak. Study today to keep it going.`,
            { streak },
        );
    }

    async notifyReviewDue(userId: number, cardCount: number) {
        return this.create(
            userId,
            'REVIEW_DUE',
            'Cards due for review',
            `${cardCount} cards are ready for review. Keep your knowledge fresh.`,
            { cardCount },
        );
    }

    async notifyAchievement(userId: number, title: string, body: string) {
        return this.create(userId, 'ACHIEVEMENT', title, body);
    }

    async notifyPayment(userId: number, plan: string, amount: number) {
        return this.create(
            userId,
            'PAYMENT',
            'Payment successful',
            `Your ${plan} subscription has been activated. Amount: $${amount}`,
            { plan, amount },
        );
    }
}