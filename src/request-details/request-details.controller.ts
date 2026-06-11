import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { RequestDetailsService } from './request-details.service';

@Controller('request-details')
export class RequestDetailsController {
  constructor(protected requestDetailsService: RequestDetailsService) {}

  @Get(':requestId')
  async getRequestDetails(@Param('requestId') requestId: string) {
    return await this.requestDetailsService.requestDetails(requestId);
  }

  
}