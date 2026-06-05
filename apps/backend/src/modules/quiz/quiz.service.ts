import {
    Injectable, NotFoundException, ForbiddenException, BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QuizGeneratorService } from './quiz-generator.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { StatsService } from '../stats/stats.service';

@Injectable()
export class QuizService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly generator: QuizGeneratorService,
        private readonly statsService: StatsService,
    ) { }

    // ─── List ────────────────────────────────────────────────

    async findAll(userId: string) {
        const numUserId = Number(userId);
        return this.prisma.quiz.findMany({
            where: { userId: numUserId },
            include: {
                _count: { select: { questions: true, attempts: true } },
                attempts: {
                    where: { userId: numUserId },
                    orderBy: { completedAt: 'desc' },
                    take: 1,
                    select: { score: true, totalQ: true, completedAt: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string, userId: string) {
        const numUserId = Number(userId);
        const quiz = await this.prisma.quiz.findUnique({
            where: { id },
            include: {
                questions: { orderBy: { order: 'asc' } },
            },
        });

        if (!quiz) throw new NotFoundException('Quiz not found');
        if (quiz.userId !== numUserId) throw new ForbiddenException();
        return quiz;
    }

    // ─── Create + Generate ───────────────────────────────────

    async create(userId: string, dto: CreateQuizDto) {
        const numUserId = Number(userId);
        // Load flashcard set
        const set = await this.prisma.flashcardSet.findUnique({
            where: { id: dto.flashcardSetId },
            include: { flashcards: true },
        });

        if (!set) throw new NotFoundException('Flashcard set not found');
        if (set.userId !== numUserId) throw new ForbiddenException();
        if (!set.flashcards.length) {
            throw new BadRequestException('Flashcard set is empty');
        }

        // Generate questions
        const generated = this.generator.generate(set.flashcards, {
            count: Math.min(dto.questionCount, set.flashcards.length),
            shuffle: dto.shuffle,
            includeMultipleChoice: dto.includeMultipleChoice ?? true,
            includeTrueFalse: dto.includeTrueFalse ?? true,
            includeFillInBlank: dto.includeFillInBlank ?? false,
        });

        // Persist quiz + questions in one transaction
        return this.prisma.quiz.create({
            data: {
                title: dto.title,
                flashcardSetId: dto.flashcardSetId,
                userId: numUserId,
                questionCount: generated.length,
                shuffle: dto.shuffle,
                timeLimitSecs: dto.timeLimitSecs,
                questions: {
                    create: generated.map(q => ({
                        type: q.type,
                        prompt: q.prompt,
                        options: q.options ? JSON.stringify(q.options) : undefined,
                        answer: q.answer,
                        explanation: q.explanation,
                        order: q.order,
                    })),
                },
            },
            include: { questions: { orderBy: { order: 'asc' } } },
        });
    }

    async delete(id: string, userId: string) {
        const numUserId = Number(userId);
        const quiz = await this.prisma.quiz.findUnique({ where: { id } });
        if (!quiz) throw new NotFoundException();
        if (quiz.userId !== numUserId) throw new ForbiddenException();
        await this.prisma.quiz.delete({ where: { id } });
        return { message: 'Deleted' };
    }

    // ─── Submit + Grade ──────────────────────────────────────

    async submit(userId: string, dto: SubmitQuizDto) {
        const numUserId = Number(userId);
        const quiz = await this.prisma.quiz.findUnique({
            where: { id: dto.quizId },
            include: { questions: true },
        });

        if (!quiz) throw new NotFoundException('Quiz not found');
        if (quiz.userId !== numUserId) throw new ForbiddenException();

        // Grade each answer
        let score = 0;
        const gradedAnswers: Record<string, {
            given: string;
            correct: string;
            isCorrect: boolean;
            explanation: string;
        }> = {};

        for (const question of quiz.questions) {
            const given = (dto.answers[question.id] ?? '').toLowerCase().trim();
            const correct = question.answer.toLowerCase().trim();
            const isCorrect = given === correct;
            if (isCorrect) score++;

            gradedAnswers[question.id] = {
                given: dto.answers[question.id] ?? '',
                correct: question.answer,
                isCorrect,
                explanation: question.explanation ?? '',
            };
        }

        // Save attempt
        const attempt = await this.prisma.quizAttempt.create({
            data: {
                quizId: dto.quizId,
                userId: numUserId,
                answers: gradedAnswers,
                score,
                totalQ: quiz.questions.length,
                timeTaken: dto.timeTaken,
            },
        });

        // Record daily activity
        await this.statsService.recordActivity(userId, 'quiz', 1);

        return {
            attemptId: attempt.id,
            score,
            totalQ: quiz.questions.length,
            percentage: Math.round((score / quiz.questions.length) * 100),
            timeTaken: dto.timeTaken,
            gradedAnswers,
            questions: quiz.questions,
        };
    }

    async getAttempt(attemptId: string, userId: string) {
        const numUserId = Number(userId);
        const attempt = await this.prisma.quizAttempt.findUnique({
            where: { id: attemptId },
            include: { quiz: { include: { questions: { orderBy: { order: 'asc' } } } } },
        });

        if (!attempt) throw new NotFoundException();
        if (attempt.userId !== numUserId) throw new ForbiddenException();
        return attempt;
    }
}