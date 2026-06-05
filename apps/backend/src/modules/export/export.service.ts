import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ExportService {
  constructor(private readonly prisma: PrismaService) {}

  async exportVocabulary(topic?: string) {
    const vocab = await this.prisma.vocabulary.findMany({
      where: topic ? { topic } : {},
    });
    let csv = 'word,meaning,ipa,partOfSpeech,example,level,topic\n';
    vocab.forEach((v) => {
      csv += `"${v.word}","${v.meaning}","${v.ipa || ''}","${v.partOfSpeech || ''}","${v.example || ''}","${v.level || ''}","${v.topic || ''}"\n`;
    });
    return csv;
  }

  async exportAdminReport() {
    const users = await this.prisma.user.findMany({
      include: { subscription: true },
    });
    let csv = 'email,fullName,plan,joinedAt\n';
    users.forEach((u) => {
      csv += `"${u.email}","${u.fullName}","${u.subscription?.plan || 'FREE'}","${u.createdAt.toISOString()}"\n`;
    });
    return csv;
  }

  async exportProgress(userId: number) {
    const progress = await this.prisma.lessonProgress.findMany({
      where: { userId },
      include: { lesson: true },
    });
    let csv = 'lessonTitle,completedAt\n';
    progress.forEach((p) => {
      csv += `"${p.lesson.title}","${p.completedAt.toISOString()}"\n`;
    });
    return csv;
  }
}
