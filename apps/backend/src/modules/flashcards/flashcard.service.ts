import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StudyStatus } from '@prisma/client';

@Injectable()
export class FlashcardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSets(userId: number) {
    return this.prisma.flashcardSet.findMany({
      where: { userId },
      include: {
        flashcards: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getSet(id: string, userId: number) {
    const set = await this.prisma.flashcardSet.findUnique({
      where: { id },
      include: {
        flashcards: true,
      },
    });
    if (!set) throw new NotFoundException('Set not found');
    if (set.userId !== userId) throw new ForbiddenException();
    return set;
  }

  async createSet(userId: number, payload: any) {
    const { title, description, flashcards = [] } = payload;
    return this.prisma.flashcardSet.create({
      data: {
        title,
        description,
        userId,
        flashcards: {
          create: flashcards.map((f: any) => ({
            front: f.front,
            back: f.back,
            hint: f.hint,
            vocabularyId: f.vocabularyId ? Number(f.vocabularyId) : undefined,
          })),
        },
      },
      include: {
        flashcards: true,
      },
    });
  }

  async updateSet(id: string, userId: number, payload: any) {
    const set = await this.prisma.flashcardSet.findUnique({ where: { id } });
    if (!set) throw new NotFoundException('Set not found');
    if (set.userId !== userId) throw new ForbiddenException();

    const { title, description, flashcards } = payload;

    return this.prisma.$transaction(async (tx) => {
      if (flashcards) {
        await tx.flashcard.deleteMany({ where: { flashcardSetId: id } });
        await tx.flashcard.createMany({
          data: flashcards.map((f: any) => ({
            front: f.front,
            back: f.back,
            hint: f.hint,
            flashcardSetId: id,
            vocabularyId: f.vocabularyId ? Number(f.vocabularyId) : undefined,
          })),
        });
      }

      return tx.flashcardSet.update({
        where: { id },
        data: {
          title,
          description,
        },
        include: {
          flashcards: true,
        },
      });
    });
  }

  async deleteSet(id: string, userId: number) {
    const set = await this.prisma.flashcardSet.findUnique({ where: { id } });
    if (!set) throw new NotFoundException('Set not found');
    if (set.userId !== userId) throw new ForbiddenException();
    await this.prisma.flashcardSet.delete({ where: { id } });
  }

  async recordStudy(userId: number, flashcardId: string, status: StudyStatus) {
    const card = await this.prisma.flashcard.findUnique({ where: { id: flashcardId } });
    if (!card) throw new NotFoundException('Flashcard not found');

    const record = await this.prisma.studyRecord.create({
      data: {
        userId,
        flashcardId,
        status,
      },
    });

    const now = new Date();
    const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0));

    await this.prisma.dailyActivity.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      update: {
        cardCount: { increment: 1 },
      },
      create: {
        userId,
        date: today,
        cardCount: 1,
      },
    });

    return record;
  }
}
