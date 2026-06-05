import {
    Injectable, NotFoundException, ForbiddenException, ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-courses.dto';
import { CompleteLessonDto } from './dto/complete-courses.dto';

@Injectable()
export class CoursesService {
    constructor(private readonly prisma: PrismaService) { }

    // ─── Catalog ─────────────────────────────────────────────

    async findAll(userId: string) {
        const numUserId = Number(userId);
        const courses = await this.prisma.course.findMany({
            where: { published: true },
            include: {
                _count: { select: { lessons: true } },
                enrollments: { where: { userId: numUserId }, select: { id: true, enrolledAt: true } },
            },
            orderBy: { order: 'asc' },
        });

        // Attach progress per course
        return Promise.all(
            courses.map(async course => {
                const enrolled = course.enrollments.length > 0;
                if (!enrolled) return { ...course, enrolled: false, completedLessons: 0, progressPct: 0 };

                const completed = await this.prisma.lessonProgress.count({
                    where: {
                        userId: numUserId,
                        lesson: { courseId: course.id },
                    },
                });

                const total = course._count.lessons;
                return {
                    ...course,
                    enrolled: true,
                    completedLessons: completed,
                    progressPct: total > 0 ? Math.round((completed / total) * 100) : 0,
                };
            }),
        );
    }

    async findOne(id: string, userId: string) {
        const numUserId = Number(userId);
        const course = await this.prisma.course.findUnique({
            where: { id },
            include: {
                lessons: { orderBy: { order: 'asc' } },
                enrollments: { where: { userId: numUserId }, select: { id: true } },
            },
        });

        if (!course) throw new NotFoundException('Course not found');
        if (!course.published) throw new NotFoundException('Course not available');

        const enrolled = course.enrollments.length > 0;

        // Get completed lesson IDs for this user
        const progresses = await this.prisma.lessonProgress.findMany({
            where: { userId: numUserId, lesson: { courseId: id } },
            select: { lessonId: true },
        });

        const completedIds = new Set(progresses.map(p => p.lessonId));

        // Determine which lessons are locked
        // Rule: lesson N+1 unlocks after lesson N is complete
        const lessonsWithStatus = course.lessons.map((lesson, idx) => {
            const isCompleted = completedIds.has(lesson.id);
            const prevLesson = course.lessons[idx - 1];
            const isLocked = idx > 0 && !completedIds.has(prevLesson?.id ?? '');
            const isCurrent = !isCompleted && !isLocked;

            return { ...lesson, isCompleted, isLocked, isCurrent };
        });

        const total = course.lessons.length;
        const completed = completedIds.size;

        return {
            ...course,
            enrolled,
            lessons: lessonsWithStatus,
            completedLessons: completed,
            progressPct: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
    }

    // ─── Enrollment ───────────────────────────────────────────

    async enroll(userId: string, courseId: string) {
        const numUserId = Number(userId);
        const course = await this.prisma.course.findUnique({ where: { id: courseId } });
        if (!course || !course.published) throw new NotFoundException('Course not found');

        const existing = await this.prisma.enrollment.findUnique({
            where: { userId_courseId: { userId: numUserId, courseId } },
        });
        if (existing) throw new ConflictException('Already enrolled');

        return this.prisma.enrollment.create({
            data: { userId: numUserId, courseId },
        });
    }

    async unenroll(userId: string, courseId: string) {
        const numUserId = Number(userId);
        const enrollment = await this.prisma.enrollment.findUnique({
            where: { userId_courseId: { userId: numUserId, courseId } },
        });
        if (!enrollment) throw new NotFoundException('Not enrolled');

        await this.prisma.enrollment.delete({
            where: { userId_courseId: { userId: numUserId, courseId } },
        });

        return { message: 'Unenrolled successfully' };
    }

    // ─── Lesson viewer ────────────────────────────────────────

    async getLesson(lessonId: string, userId: string) {
        const numUserId = Number(userId);
        const lesson = await this.prisma.lesson.findUnique({
            where: { id: lessonId },
            include: {
                course: { select: { id: true, title: true, published: true } },
                flashcardSet: {
                    include: { flashcards: { orderBy: { createdAt: 'asc' } } },
                },
                quiz: {
                    include: { questions: { orderBy: { order: 'asc' } } },
                },
            },
        });

        if (!lesson) throw new NotFoundException('Lesson not found');
        if (!lesson.course.published) throw new NotFoundException();

        // Check enrolled
        const enrollment = await this.prisma.enrollment.findUnique({
            where: { userId_courseId: { userId: numUserId, courseId: lesson.course.id } },
        });
        if (!enrollment) throw new ForbiddenException('Enroll in this course first');

        // Check locked — find previous lesson
        const allLessons = await this.prisma.lesson.findMany({
            where: { courseId: lesson.course.id },
            orderBy: { order: 'asc' },
            select: { id: true, order: true },
        });

        const lessonIdx = allLessons.findIndex(l => l.id === lessonId);
        if (lessonIdx > 0) {
            const prevLesson = allLessons[lessonIdx - 1];
            const prevCompleted = await this.prisma.lessonProgress.findUnique({
                where: { userId_lessonId: { userId: numUserId, lessonId: prevLesson.id } },
            });
            if (!prevCompleted) throw new ForbiddenException('Complete previous lesson first');
        }

        // Is this lesson completed?
        const progress = await this.prisma.lessonProgress.findUnique({
            where: { userId_lessonId: { userId: numUserId, lessonId } },
        });

        // Next lesson
        const nextLesson = allLessons[lessonIdx + 1] ?? null;

        return {
            ...lesson,
            isCompleted: !!progress,
            nextLessonId: nextLesson?.id ?? null,
        };
    }

    // ─── Complete lesson ──────────────────────────────────────

    async completeLesson(userId: string, dto: CompleteLessonDto) {
        const numUserId = Number(userId);
        const lesson = await this.prisma.lesson.findUnique({
            where: { id: dto.lessonId },
            include: { course: true },
        });
        if (!lesson) throw new NotFoundException();

        // Check enrolled
        const enrollment = await this.prisma.enrollment.findUnique({
            where: { userId_courseId: { userId: numUserId, courseId: lesson.courseId } },
        });
        if (!enrollment) throw new ForbiddenException();

        // Upsert progress
        await this.prisma.lessonProgress.upsert({
            where: { userId_lessonId: { userId: numUserId, lessonId: dto.lessonId } },
            update: { completedAt: new Date() },
            create: { userId: numUserId, lessonId: dto.lessonId },
        });

        // Check if course complete
        const [total, completed] = await Promise.all([
            this.prisma.lesson.count({ where: { courseId: lesson.courseId } }),
            this.prisma.lessonProgress.count({
                where: { userId: numUserId, lesson: { courseId: lesson.courseId } },
            }),
        ]);

        return {
            lessonId: dto.lessonId,
            courseComplete: completed >= total,
            progressPct: Math.round((completed / total) * 100),
        };
    }

    // ─── Admin CRUD ───────────────────────────────────────────

    async adminCreate(dto: CreateCourseDto) {
        const { lessons, ...courseData } = dto;

        return this.prisma.course.create({
            data: {
                ...courseData,
                lessons: lessons?.length ? { create: lessons } : undefined,
            },
            include: { lessons: true },
        });
    }

    async adminUpdate(id: string, dto: Partial<CreateCourseDto>) {
        const { lessons, ...courseData } = dto;

        return this.prisma.course.update({
            where: { id },
            data: courseData,
        });
    }

    async adminDelete(id: string) {
        await this.prisma.course.delete({ where: { id } });
        return { message: 'Deleted' };
    }

    async adminTogglePublish(id: string) {
        const course = await this.prisma.course.findUnique({ where: { id } });
        if (!course) throw new NotFoundException();

        return this.prisma.course.update({
            where: { id },
            data: { published: !course.published },
        });
    }
}