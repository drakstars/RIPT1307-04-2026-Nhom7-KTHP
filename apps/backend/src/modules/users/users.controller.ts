import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  getProfile(@Req() req: any) {
    return this.usersService.getProfile(req.user.id);
  }

  @Put('profile')
  updateProfile(
    @Req() req: any,
    @Body() body: { firstName?: string; lastName?: string; bio?: string; avatarUrl?: string },
  ) {
    return this.usersService.updateProfile(req.user.id, body);
  }

  @Get('settings')
  getSettings(@Req() req: any) {
    return this.usersService.getSettings(req.user.id);
  }

  @Put('settings')
  updateSettings(@Req() req: any, @Body() settings: any) {
    return this.usersService.updateSettings(req.user.id, settings);
  }

  @Put('password')
  updatePassword(
    @Req() req: any,
    @Body() body: { currentPassword?: string; newPassword?: string },
  ) {
    return this.usersService.updatePassword(req.user.id, body);
  }

  @Delete('me')
  deleteAccount(@Req() req: any) {
    return this.usersService.deleteAccount(req.user.id);
  }
}
