import { Test, TestingModule } from '@nestjs/testing';
import { VocabulariesController } from './vocabularies.controller';

describe('VocabulariesController', () => {
  let controller: VocabulariesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VocabulariesController],
    }).compile();

    controller = module.get<VocabulariesController>(VocabulariesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
