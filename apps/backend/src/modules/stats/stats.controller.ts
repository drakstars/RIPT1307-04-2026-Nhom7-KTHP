import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
    constructor(private readonly statsService: StatsService) { }

    @Get('overview')
    getOverview(@Request() req: any) {
        return this.statsService.getOverview(req.user.id);
    }

    @Get('activity')
    getActivity(@Request() req: any) {
        return this.statsService.getActivity(req.user.id);
    }

    @Get('weekly')
    getWeekly(@Request() req: any) {
        return this.statsService.getWeekly(req.user.id);
    }

    @Get('progress')
    getSetProgress(@Request() req: any) {
        return this.statsService.getSetProgress(req.user.id);
    }

    @Get('streak')
    getStreak(@Request() req: any) {
        return this.statsService.getStreak(req.user.id);
    }

    @Post('record')
    recordActivity(@Request() req: any, @Body() body: { type: 'card' | 'quiz'; count?: number }) {
        return this.statsService.recordActivity(req.user.id, body.type, body.count ?? 1);
    }
}