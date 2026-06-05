import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Put,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/role.guard';
import { CreateVocabularyDto } from './dto/create-vocabulary.dto';
import { UpdateVocabularyDto } from './dto/update-vocabulary.dto';
import { VocabulariesService } from './vocabularies.service';

@Controller('vocabularies')
export class VocabulariesController {
  constructor(private readonly service: VocabulariesService) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('topic') topic?: string,
    @Query('level') level?: string,
  ) {
    return this.service.findAll({ search, topic, level });
  }

  @Get('random')
  findRandom() {
    return this.service.findRandom();
  }

  @Get('recent')
  findRecent(@Query('limit') limit?: string) {
    return this.service.findRecent(limit ? Number(limit) : undefined);
  }

  @Get('stats')
  getStats() {
    return this.service.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(Number(id));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateVocabularyDto) {
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVocabularyDto) {
    return this.service.update(Number(id), dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put(':id')
  updatePut(@Param('id') id: string, @Body() dto: UpdateVocabularyDto) {
    return this.service.update(Number(id), dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}