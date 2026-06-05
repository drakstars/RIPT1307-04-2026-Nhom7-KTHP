import { Module } from '@nestjs/common';
import { AdminUsersController }    from './admin-users.controller';
import { AdminUsersService }       from './admin-users.service';
import { AdminAnalyticsController } from './admin-analytics.controller';
import { AdminAnalyticsService }   from './admin-analytics.service';
import { AdminSettingsController } from './admin-settings.controller';
import { AdminQuizzesController }  from './admin-quizzes.controller';
import { AdminPaymentsController } from './admin-payments.controller';
import { PrismaModule }            from '../../prisma/prisma.module';
import { NotificationsModule }     from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [
    AdminUsersController,
    AdminAnalyticsController,
    AdminSettingsController,
    AdminQuizzesController,
    AdminPaymentsController,
  ],
  providers: [
    AdminUsersService,
    AdminAnalyticsService,
  ],
})
export class AdminModule {}
