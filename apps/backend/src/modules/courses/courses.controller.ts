import {
    Controller, Get, Post, Put, Delete, Param, Body,
    UseGuards, Request,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-courses.dto';
import { CompleteLessonDto } from './dto/complete-courses.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PlanGuard, RequirePlan } from '../payment/plan.guard';

@Controller('courses')
@UseGuards(JwtAuthGuard)
export class CoursesController {
    constructor(private readonly coursesService: CoursesService) { }

    // ─── Public (enrolled users) ───────────────────────────
    @Get()
    @UseGuards(PlanGuard)
    @RequirePlan('canAccessCourses')
    findAll(@Request() req: any) {
        return this.coursesService.findAll(req.user.id);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Request() req: any) {
        return this.coursesService.findOne(id, req.user.id);
    }

    @Post(':id/enroll')
    enroll(@Param('id') id: string, @Request() req: any) {
        return this.coursesService.enroll(req.user.id, id);
    }

    @Delete(':id/enroll')
    unenroll(@Param('id') id: string, @Request() req: any) {
        return this.coursesService.unenroll(req.user.id, id);
    }

    @Get('lessons/:lessonId')
    getLesson(@Param('lessonId') id: string, @Request() req: any) {
        return this.coursesService.getLesson(id, req.user.id);
    }

    @Post('lessons/complete')
    completeLesson(@Body() dto: CompleteLessonDto, @Request() req: any) {
        return this.coursesService.completeLesson(req.user.id, dto);
    }

    // ─── Admin only ────────────────────────────────────────
    @Post()
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    adminCreate(@Body() dto: CreateCourseDto) {
        return this.coursesService.adminCreate(dto);
    }

    @Put(':id')
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    adminUpdate(@Param('id') id: string, @Body() dto: Partial<CreateCourseDto>) {
        return this.coursesService.adminUpdate(id, dto);
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    adminDelete(@Param('id') id: string) {
        return this.coursesService.adminDelete(id);
    }

    @Post(':id/publish')
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    togglePublish(@Param('id') id: string) {
        return this.coursesService.adminTogglePublish(id);
    }
}