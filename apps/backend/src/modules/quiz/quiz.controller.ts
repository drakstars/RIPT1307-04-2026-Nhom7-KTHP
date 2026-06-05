import {
    Controller, Get, Post, Delete, Body, Param, UseGuards, Request,
} from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('quiz')
@UseGuards(JwtAuthGuard)
export class QuizController {
    constructor(private readonly quizService: QuizService) { }

    @Get()
    findAll(@Request() req: any) {
        return this.quizService.findAll(req.user.id);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Request() req: any) {
        return this.quizService.findOne(id, req.user.id);
    }

    @Post()
    create(@Body() dto: CreateQuizDto, @Request() req: any) {
        return this.quizService.create(req.user.id, dto);
    }

    @Delete(':id')
    delete(@Param('id') id: string, @Request() req: any) {
        return this.quizService.delete(id, req.user.id);
    }

    @Post('submit')
    submit(@Body() dto: SubmitQuizDto, @Request() req: any) {
        return this.quizService.submit(req.user.id, dto);
    }

    @Get('attempts/:attemptId')
    getAttempt(@Param('attemptId') id: string, @Request() req: any) {
        return this.quizService.getAttempt(id, req.user.id);
    }
}