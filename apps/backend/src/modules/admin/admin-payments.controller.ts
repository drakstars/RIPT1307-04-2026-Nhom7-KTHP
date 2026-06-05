import {
  Controller, Get, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('admin/payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminPaymentsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('page')   page = '1',
  ) {
    const take = 20;
    const skip = (parseInt(page) - 1) * take;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.user = { email: { contains: search, mode: 'insensitive' } };
    }

    const [payments, total] = await Promise.all([
      this.prisma.paymentHistory.findMany({
        where,
        include: {
          user: { select: { email: true } },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      this.prisma.paymentHistory.count({ where }),
    ]);

    return {
      payments,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / take),
    };
  }
}
