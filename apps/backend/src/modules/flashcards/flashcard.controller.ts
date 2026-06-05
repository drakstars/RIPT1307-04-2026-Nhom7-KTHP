import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { FlashcardService } from './flashcard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StudyStatus } from '@prisma/client';

@Controller('flashcards')
@UseGuards(JwtAuthGuard)
export class FlashcardController {
  constructor(private readonly flashcardService: FlashcardService) {}

  @Get('sets')
  getSets(@Request() req: any) {
    return this.flashcardService.getSets(req.user.id);
  }

  @Get('sets/:id')
  getSet(@Param('id') id: string, @Request() req: any) {
    return this.flashcardService.getSet(id, req.user.id);
  }

  @Post('sets')
  createSet(@Body() payload: any, @Request() req: any) {
    return this.flashcardService.createSet(req.user.id, payload);
  }

  @Put('sets/:id')
  updateSet(@Param('id') id: string, @Body() payload: any, @Request() req: any) {
    return this.flashcardService.updateSet(id, req.user.id, payload);
  }

  @Delete('sets/:id')
  deleteSet(@Param('id') id: string, @Request() req: any) {
    return this.flashcardService.deleteSet(id, req.user.id);
  }

  @Post('study/record')
  recordStudy(@Body() body: { flashcardId: string; status: StudyStatus }, @Request() req: any) {
    return this.flashcardService.recordStudy(req.user.id, body.flashcardId, body.status);
  }
}
