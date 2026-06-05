import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminAnalyticsService } from './admin-analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminAnalyticsController {
  constructor(private readonly adminAnalyticsService: AdminAnalyticsService) {}

  @Get('overview')
  getOverview() {
    return this.adminAnalyticsService.getOverview();
  }

  @Get('top-users')
  getTopUsers(@Query('limit') limit?: string) {
    return this.adminAnalyticsService.getTopUsers(limit ? parseInt(limit, 10) : 10);
  }

  @Get('revenue')
  getRevenueChart(@Query('days') days?: string) {
    return this.adminAnalyticsService.getRevenueChart(days ? parseInt(days, 10) : 30);
  }
}
