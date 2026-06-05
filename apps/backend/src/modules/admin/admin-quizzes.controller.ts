import {
  Controller, Get, Delete, Param, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('admin/quizzes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminQuizzesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('page')   page = '1',
  ) {
    const take = 20;
    const skip = (parseInt(page) - 1) * take;

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { user:  { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [quizzes, total] = await Promise.all([
      this.prisma.quiz.findMany({
        where,
        include: {
          user: { select: { email: true } },
          _count: { select: { questions: true, attempts: true } },
          attempts: {
            select: { score: true, totalQ: true },
            orderBy: { completedAt: 'desc' },
            take: 50,
          },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      this.prisma.quiz.count({ where }),
    ]);

    return {
      quizzes,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / take),
    };
  }

  @Delete(':id')
  async deleteQuiz(@Param('id') id: string) {
    await this.prisma.quiz.delete({ where: { id } });
    return { message: 'Quiz deleted' };
  }

  @Get(':id/attempts')
  async getAttempts(@Param('id') quizId: string) {
    return this.prisma.quizAttempt.findMany({
      where: { quizId },
      include: { user: { select: { email: true } } },
      orderBy: { completedAt: 'desc' },
      take: 100,
    });
  }
}
