import { Module } from '@nestjs/common';
import { VocabulariesController } from './vocabularies.controller';
import { VocabulariesService } from './vocabularies.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [VocabulariesController],
  providers: [VocabulariesService]
})
export class VocabulariesModule {}
