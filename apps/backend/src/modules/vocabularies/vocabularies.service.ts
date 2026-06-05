import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVocabularyDto } from './dto/create-vocabulary.dto';
import { UpdateVocabularyDto } from './dto/update-vocabulary.dto';

@Injectable()
export class VocabulariesService {
  constructor(private readonly prisma: PrismaService) {}

  private mapVocabulary(item: any) {
    if (!item) return item;
    return {
      ...item,
      definition: item.meaning,
      pronunciation: item.ipa,
      type: item.partOfSpeech,
    };
  }

  async findAll(query: { search?: string; topic?: string; level?: string }) {
    const items = await this.prisma.vocabulary.findMany({
      where: {
        isPublic: true,
        word: query.search
          ? {
              contains: query.search,
            }
          : undefined,
        topic: query.topic || undefined,
        level: query.level || undefined,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return items.map((item) => this.mapVocabulary(item));
  }

  async findOne(id: number) {
    const vocabulary = await this.prisma.vocabulary.findUnique({
      where: { id },
    });

    if (!vocabulary) {
      throw new NotFoundException('Vocabulary not found');
    }

    return this.mapVocabulary(vocabulary);
  }

  async create(dto: CreateVocabularyDto) {
    const { definition, pronunciation, type, ...rest } = dto as any;
    const data = {
      ...rest,
      meaning: definition !== undefined ? definition : rest.meaning,
      ipa: pronunciation !== undefined ? pronunciation : rest.ipa,
      partOfSpeech: type !== undefined ? type : rest.partOfSpeech,
    };
    const created = await this.prisma.vocabulary.create({
      data,
    });
    return this.mapVocabulary(created);
  }

  async update(id: number, dto: UpdateVocabularyDto) {
    await this.findOne(id);
    const { definition, pronunciation, type, ...rest } = dto as any;
    const data: any = {
      ...rest,
    };
    if (definition !== undefined) data.meaning = definition;
    if (pronunciation !== undefined) data.ipa = pronunciation;
    if (type !== undefined) data.partOfSpeech = type;

    const updated = await this.prisma.vocabulary.update({
      where: { id },
      data,
    });
    return this.mapVocabulary(updated);
  }

  async remove(id: number) {
    await this.findOne(id);

    const deleted = await this.prisma.vocabulary.delete({
      where: { id },
    });
    return this.mapVocabulary(deleted);
  }

  // ─── New endpoints for Dashboard ─────────────────────────

  async findByTopic(topic: string) {
    const items = await this.prisma.vocabulary.findMany({
      where: {
        isPublic: true,
        topic,
      },
      orderBy: {
        word: 'asc',
      },
    });
    return items.map((item) => this.mapVocabulary(item));
  }

  async findRandom() {
    const count = await this.prisma.vocabulary.count({
      where: { isPublic: true },
    });
    if (count === 0) return null;

    const skip = Math.floor(Math.random() * count);
    const items = await this.prisma.vocabulary.findMany({
      where: { isPublic: true },
      skip,
      take: 1,
    });
    return this.mapVocabulary(items[0] ?? null);
  }

  async findRecent(limit: number = 8) {
    const items = await this.prisma.vocabulary.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return items.map((item) => this.mapVocabulary(item));
  }

  async getStats() {
    const total = await this.prisma.vocabulary.count({
      where: { isPublic: true },
    });

    const byTopic = await this.prisma.vocabulary.groupBy({
      by: ['topic'],
      where: { isPublic: true },
      _count: { id: true },
    });

    const topics = byTopic.map((t) => ({
      topic: t.topic ?? 'Uncategorized',
      count: t._count.id,
    }));

    return { total, topics };
  }
}