import { Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminSettingsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('notifications/streak-reminders')
  async sendStreakReminders() {
    // Find users who have not studied today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const usersWithoutActivity = await this.prisma.user.findMany({
      where: {
        banned: false,
        dailyActivities: {
          none: { date: { gte: today } },
        },
      },
      select: { id: true },
      take: 500,
    });

    let count = 0;
    for (const user of usersWithoutActivity) {
      await this.notificationsService.notifyStreakReminder(user.id, 0);
      count++;
    }

    return { count };
  }
}
