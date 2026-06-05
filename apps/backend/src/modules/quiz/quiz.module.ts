import { Module } from '@nestjs/common';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { QuizGeneratorService } from './quiz-generator.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { StatsModule } from '../stats/stats.module';

@Module({
    imports: [PrismaModule, StatsModule],
    controllers: [QuizController],
    providers: [QuizService, QuizGeneratorService],
})
export class QuizModule { }