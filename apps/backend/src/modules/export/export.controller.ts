import { Controller, Get, Query, Request, Response, UseGuards } from '@nestjs/common';
import { ExportService } from './export.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Response as ExpressResponse } from 'express';

@Controller('export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('vocabulary')
  async exportVocabulary(
    @Query('topic') topic: string,
    @Response() res: ExpressResponse,
  ) {
    const csv = await this.exportService.exportVocabulary(topic);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=vocabulary.csv');
    res.status(200).send(csv);
  }

  @Get('admin-report')
  async exportAdminReport(@Response() res: ExpressResponse) {
    const csv = await this.exportService.exportAdminReport();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=admin-report.csv');
    res.status(200).send(csv);
  }

  @Get('progress')
  @UseGuards(JwtAuthGuard)
  async exportProgress(
    @Request() req: any,
    @Response() res: ExpressResponse,
  ) {
    const csv = await this.exportService.exportProgress(req.user.id);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=progress.csv');
    res.status(200).send(csv);
  }
}
