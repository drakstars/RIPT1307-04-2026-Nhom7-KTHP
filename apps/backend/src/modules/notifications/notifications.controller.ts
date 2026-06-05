import { Controller, Get, Put, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    findAll(@Request() req: any) {
        return this.notificationsService.findAll(req.user.id);
    }

    @Get('unread-count')
    getUnreadCount(@Request() req: any) {
        return this.notificationsService.getUnreadCount(req.user.id);
    }

    @Put(':id/read')
    markRead(@Param('id') id: string, @Request() req: any) {
        return this.notificationsService.markRead(id, req.user.id);
    }

    @Put('read-all')
    markAllRead(@Request() req: any) {
        return this.notificationsService.markAllRead(req.user.id);
    }

    @Delete(':id')
    deleteOne(@Param('id') id: string, @Request() req: any) {
        return this.notificationsService.deleteOne(id, req.user.id);
    }
}