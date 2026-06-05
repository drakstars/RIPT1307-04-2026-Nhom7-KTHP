import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { VocabulariesModule } from './modules/vocabularies/vocabularies.module';
import { FlashcardsModule } from './modules/flashcards/flashcard.module';
import { QuizModule } from './modules/quiz/quiz.module';
import { StatsModule } from './modules/stats/stats.module';
import { CoursesModule } from './modules/courses/courses.module';
import { ChatModule } from './modules/chat/chat.module';
import { PaymentModule } from './modules/payment/payment.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ExportModule } from './modules/export/export.module';
import { AdminModule } from './modules/admin/admin.module';
import { UsersModule } from './modules/users/users.module';
import { UploadModule } from './modules/upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    VocabulariesModule,
    FlashcardsModule,
    QuizModule,
    StatsModule,
    CoursesModule,
    ChatModule,
    PaymentModule,
    NotificationsModule,
    ExportModule,
    AdminModule,
    UsersModule,
    UploadModule,
  ],
})
export class AppModule { }