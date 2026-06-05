import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { AdminUsersService } from './admin-users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('plan') plan?: string,
    @Query('page') page?: string,
  ) {
    return this.adminUsersService.findAll({
      search, plan, page: page ? parseInt(page) : 1,
    });
  }

  @Post()
  create(@Body() body: any) {
    return this.adminUsersService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.adminUsersService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.adminUsersService.delete(id);
  }

  @Post(':id/ban')
  ban(@Param('id') id: string) {
    return this.adminUsersService.ban(id);
  }

  @Post(':id/unban')
  unban(@Param('id') id: string) {
    return this.adminUsersService.unban(id);
  }
}
