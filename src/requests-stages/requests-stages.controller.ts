import { Controller, Get, Param } from '@nestjs/common';
import { RequestsStagesService } from './requests-stages.service';

@Controller('requests-stages')
export class RequestsStagesController {
  constructor(
    protected readonly requestsStagesService: RequestsStagesService,
  ) {}

  @Get(':id')
  async getFlow(@Param('id') id: string) {
    return await this.requestsStagesService.getRequestType(id);
  }

  @Get(':id/:stage')
  async getStagesFlow(@Param('id') id: string, @Param('stage') stage: string) {
    return await this.requestsStagesService.getStages(id, stage);
  }
}
