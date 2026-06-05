import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StatsService {
    constructor(private readonly prisma: PrismaService) { }

    // ─── Overview KPIs ───────────────────────────────────────

    async getOverview(userId: string) {
        const numUserId = Number(userId);
        const [
            totalStudied,
            knownCount,
            reviewCount,
            quizAttempts,
            sets,
        ] = await Promise.all([
            // Total cards studied (all time)
            this.prisma.studyRecord.count({ where: { userId: numUserId } }),

            // Known cards
            this.prisma.studyRecord.count({
                where: { userId: numUserId, status: 'KNOWN' },
            }),

            // Need review
            this.prisma.studyRecord.count({
                where: { userId: numUserId, status: 'NEED_REVIEW' },
            }),

            // Quiz attempts
            this.prisma.quizAttempt.findMany({
                where: { userId: numUserId },
                select: { score: true, totalQ: true, completedAt: true },
                orderBy: { completedAt: 'desc' },
            }),

            // Flashcard sets
            this.prisma.flashcardSet.findMany({
                where: { userId: numUserId },
                include: {
                    _count: { select: { flashcards: true } },
                    flashcards: {
                        include: {
                            studyRecords: {
                                where: { userId: numUserId },
                                orderBy: { reviewedAt: 'desc' },
                                take: 1,
                            },
                        },
                    },
                },
            }),
        ]);

        // Known rate
        const knownRate = totalStudied > 0
            ? Math.round((knownCount / totalStudied) * 100)
            : 0;

        // Quiz average
        const quizAvg = quizAttempts.length > 0
            ? Math.round(
                quizAttempts.reduce((sum, a) => sum + (a.score / a.totalQ) * 100, 0)
                / quizAttempts.length,
            )
            : 0;

        // This week vs last week
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        const [thisWeek, lastWeek] = await Promise.all([
            this.prisma.studyRecord.count({
                where: { userId: numUserId, reviewedAt: { gte: weekAgo } },
            }),
            this.prisma.studyRecord.count({
                where: { userId: numUserId, reviewedAt: { gte: twoWeeksAgo, lt: weekAgo } },
            }),
        ]);

        const weekDelta = thisWeek - lastWeek;

        return {
            totalStudied,
            knownCount,
            reviewCount,
            knownRate,
            quizAttemptCount: quizAttempts.length,
            quizAvg,
            setCount: sets.length,
            thisWeek,
            weekDelta,
        };
    }

    // ─── Activity heatmap — 30 days ──────────────────────────

    async getActivity(userId: string) {
        const numUserId = Number(userId);
        const now = new Date();
        const thirtyDaysAgo = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() - 29, 0, 0, 0, 0));

        const records = await this.prisma.dailyActivity.findMany({
            where: {
                userId: numUserId,
                date: { gte: thirtyDaysAgo },
            },
            orderBy: { date: 'asc' },
        });

        // Build 30-day map
        const map: Record<string, number> = {};
        records.forEach(r => {
            const key = r.date.toISOString().split('T')[0];
            map[key] = r.cardCount;
        });

        const getLocalDateString = (d: Date) => {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const dayVal = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${dayVal}`;
        };

        // Fill all 30 days
        const days: { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }[] = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = getLocalDateString(d);
            const count = map[key] ?? 0;
            days.push({
                date: key,
                count,
                level: count === 0 ? 0
                    : count < 10 ? 1
                        : count < 25 ? 2
                            : count < 50 ? 3
                                : 4,
            });
        }

        return days;
    }

    // ─── Weekly chart ─────────────────────────────────────────

    async getWeekly(userId: string) {
        const numUserId = Number(userId);
        const now = new Date();
        const sevenDaysAgo = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0));

        const records = await this.prisma.dailyActivity.findMany({
            where: { userId: numUserId, date: { gte: sevenDaysAgo } },
            orderBy: { date: 'asc' },
        });

        const getLocalDateString = (d: Date) => {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const dayVal = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${dayVal}`;
        };

        const result: { label: string; date: string; count: number }[] = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = getLocalDateString(d);
            const label = d.toLocaleDateString('en-US', { weekday: 'short' }); // e.g. "Mon", "Tue"

            const rec = records.find(r => r.date.toISOString().split('T')[0] === key);
            result.push({ label, date: key, count: rec?.cardCount ?? 0 });
        }

        return result;
    }

    // ─── Per-set progress ─────────────────────────────────────

    async getSetProgress(userId: string) {
        const numUserId = Number(userId);
        const sets = await this.prisma.flashcardSet.findMany({
            where: { userId: numUserId },
            include: {
                _count: { select: { flashcards: true } },
                flashcards: {
                    select: {
                        id: true,
                        studyRecords: {
                            where: { userId: numUserId },
                            orderBy: { reviewedAt: 'desc' },
                            take: 1,
                            select: { status: true },
                        },
                    },
                },
            },
            orderBy: { updatedAt: 'desc' },
        });

        return sets.map(set => {
            const total = set._count.flashcards;
            let known = 0;
            let needReview = 0;

            set.flashcards.forEach(card => {
                const last = card.studyRecords[0];
                if (last?.status === 'KNOWN') known++;
                else if (last?.status === 'NEED_REVIEW') needReview++;
            });

            const unstudied = total - known - needReview;
            const knownPct = total > 0 ? Math.round((known / total) * 100) : 0;
            const reviewPct = total > 0 ? Math.round((needReview / total) * 100) : 0;

            return {
                id: set.id,
                title: set.title,
                total,
                known,
                needReview,
                unstudied,
                knownPct,
                reviewPct,
            };
        });
    }

    // ─── Streak ───────────────────────────────────────────────

    async getStreak(userId: string) {
        const numUserId = Number(userId);
        const activities = await this.prisma.dailyActivity.findMany({
            where: { userId: numUserId, cardCount: { gt: 0 } },
            orderBy: { date: 'desc' },
            select: { date: true },
        });

        if (!activities.length) {
            return { current: 0, best: 0, lastThirtyDays: [] };
        }

        // Convert all activity dates to YYYY-MM-DD format (representing local date because stored in UTC)
        const actDateStrings = activities.map(a => a.date.toISOString().split('T')[0]);
        const actDatesSet = new Set(actDateStrings);

        // Calculate current streak in local time
        let current = 0;
        const now = new Date();
        
        // Helper to format local date YYYY-MM-DD
        const getLocalDateString = (d: Date) => {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const dayVal = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${dayVal}`;
        };

        // Today is:
        const todayStr = getLocalDateString(now);
        // Yesterday is:
        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        const yesterdayStr = getLocalDateString(yesterday);

        // A streak is active if there is activity today OR yesterday
        let checkDate: Date | null = new Date();
        if (actDatesSet.has(todayStr)) {
            checkDate = now;
        } else if (actDatesSet.has(yesterdayStr)) {
            checkDate = yesterday;
        } else {
            // No activity today or yesterday, streak is broken
            checkDate = null;
        }

        if (checkDate) {
            let i = 0;
            while (true) {
                const temp = new Date(checkDate);
                temp.setDate(checkDate.getDate() - i);
                const tempStr = getLocalDateString(temp);
                if (actDatesSet.has(tempStr)) {
                    current++;
                    i++;
                } else {
                    break;
                }
            }
        }

        // Calculate best streak
        // Sort distinct dates ascending
        const sortedDates = Array.from(actDatesSet).sort();
        let best = 0;
        if (sortedDates.length > 0) {
            let tempStreak = 1;
            best = 1;
            for (let i = 1; i < sortedDates.length; i++) {
                const prevDate = new Date(sortedDates[i - 1]);
                const currDate = new Date(sortedDates[i]);
                const diffTime = Math.abs(currDate.getTime() - prevDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays === 1) {
                    tempStreak++;
                    best = Math.max(best, tempStreak);
                } else {
                    tempStreak = 1;
                }
            }
        }
        best = Math.max(best, current);

        // Last 28 days for calendar (aligned to start on Monday 3 weeks ago)
        const currentDayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1;
        const currentMonday = new Date(now);
        currentMonday.setDate(now.getDate() - currentDayOfWeek);
        const startMonday = new Date(currentMonday);
        startMonday.setDate(currentMonday.getDate() - 21);

        const lastThirtyDays: { date: string; studied: boolean }[] = [];
        for (let i = 0; i < 28; i++) {
            const d = new Date(startMonday);
            d.setDate(startMonday.getDate() + i);
            const key = getLocalDateString(d);
            lastThirtyDays.push({ date: key, studied: actDatesSet.has(key) });
        }

        return { current, best, lastThirtyDays };
    }

    // ─── Record daily activity (call after study/quiz) ───────

    async recordActivity(userId: string, type: 'card' | 'quiz', count = 1) {
        const numUserId = Number(userId);
        const now = new Date();
        const todayUtc = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0));

        await this.prisma.dailyActivity.upsert({
            where: { userId_date: { userId: numUserId, date: todayUtc } },
            update: type === 'card'
                ? { cardCount: { increment: count } }
                : { quizCount: { increment: count } },
            create: {
                userId: numUserId,
                date: todayUtc,
                cardCount: type === 'card' ? count : 0,
                quizCount: type === 'quiz' ? count : 0,
            },
        });
    }
}