import { Controller, Get, Param } from '@nestjs/common';
import { RequestDetailsService } from './request-details.service';

@Controller('request-details')
export class RequestDetailsController {
  constructor(protected requestDetailsService: RequestDetailsService) {}

  @Get(':requestId')
  async getRequestDetails(@Param('requestId') requestId: string) {
    return await this.requestDetailsService.requestDetails(requestId);
  }
}
