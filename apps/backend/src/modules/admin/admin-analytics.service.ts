import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminAnalyticsService {
    constructor(private readonly prisma: PrismaService) { }

    async getOverview() {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const [
            totalUsers,
            newUsersThisWeek,
            proCount,
            teamCount,
            totalCards,
            totalStudyRecords,
            totalQuizAttempts,
            revenue30d,
            revenueTotal,
            dailySignups,
            dailyRevenue,
        ] = await Promise.all([
            this.prisma.user.count(),

            this.prisma.user.count({
                where: { createdAt: { gte: sevenDaysAgo } },
            }),

            this.prisma.subscription.count({
                where: { plan: 'PRO', status: 'ACTIVE' },
            }),

            this.prisma.subscription.count({
                where: { plan: 'TEAM', status: 'ACTIVE' },
            }),

            this.prisma.flashcard.count(),

            this.prisma.studyRecord.count({
                where: { reviewedAt: { gte: thirtyDaysAgo } },
            }),

            this.prisma.quizAttempt.count({
                where: { completedAt: { gte: thirtyDaysAgo } },
            }),

            this.prisma.paymentHistory.aggregate({
                where: { status: 'SUCCESS', createdAt: { gte: thirtyDaysAgo } },
                _sum: { amount: true },
            }),

            this.prisma.paymentHistory.aggregate({
                where: { status: 'SUCCESS' },
                _sum: { amount: true },
            }),

            // Daily signups — last 14 days
            this.prisma.$queryRaw<{ date: string; count: bigint }[]>`
        SELECT DATE(createdAt) as date, COUNT(*) as count
        FROM User
        WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 14 DAY)
        GROUP BY DATE(createdAt)
        ORDER BY date ASC
      `,

            // Daily revenue — last 30 days
            this.prisma.$queryRaw<{ date: string; amount: number }[]>`
        SELECT DATE(paidAt) as date, SUM(amount) as amount
        FROM payment_histories
        WHERE status = 'SUCCESS' AND paidAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE(paidAt)
        ORDER BY date ASC
      `,
        ]);

        const mrr = proCount * 9.99 + teamCount * 24.99;

        return {
            users: {
                total: totalUsers,
                newThisWeek: newUsersThisWeek,
                pro: proCount,
                team: teamCount,
                free: totalUsers - proCount - teamCount,
            },
            content: {
                totalCards,
                studyRecords30d: totalStudyRecords,
                quizAttempts30d: totalQuizAttempts,
            },
            revenue: {
                mrr: parseFloat(mrr.toFixed(2)),
                last30d: parseFloat((revenue30d._sum.amount ?? 0).toFixed(2)),
                total: parseFloat((revenueTotal._sum.amount ?? 0).toFixed(2)),
            },
            charts: {
                dailySignups: dailySignups.map(r => ({
                    date: r.date,
                    count: Number(r.count),
                })),
                dailyRevenue: dailyRevenue.map(r => ({
                    date: r.date,
                    amount: parseFloat(r.amount?.toString() ?? '0'),
                })),
            },
        };
    }

    async getTopUsers(limit = 10) {
        const users = await this.prisma.user.findMany({
            include: {
                subscription: { select: { plan: true } },
                _count: {
                    select: {
                        flashcardSets: true,
                        studyRecords: true,
                        quizAttempts: true,
                    },
                },
            },
            orderBy: { studyRecords: { _count: 'desc' } },
            take: limit,
        });

        return users.map(u => ({
            email: u.email,
            plan: u.subscription?.plan ?? 'FREE',
            sets: u._count.flashcardSets,
            studyRecords: u._count.studyRecords,
            quizzes: u._count.quizAttempts,
            joinedAt: u.createdAt,
        }));
    }

    async getRevenueChart(days = 30) {
        const result = await this.prisma.$queryRaw<{ date: string; amount: number; count: bigint }[]>`
      SELECT DATE(paidAt) as date, SUM(amount) as amount, COUNT(*) as count
      FROM payment_histories
      WHERE status = 'SUCCESS' AND paidAt >= DATE_SUB(NOW(), INTERVAL ${days} DAY)
      GROUP BY DATE(paidAt)
      ORDER BY date ASC
    `;

        return result.map(r => ({
            date: r.date,
            amount: parseFloat(r.amount?.toString() ?? '0'),
            count: Number(r.count),
        }));
    }
}