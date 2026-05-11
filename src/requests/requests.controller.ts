import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { LoggedInRequest } from './../authentication/interface/auth.interface';
import { CreateRequestDto } from './dto/create-request.dto';
import { RequestsService } from './requests.service';

@Controller('requests')
export class RequestsController {
  constructor(protected readonly requestsService: RequestsService) {}

  @Get()
  async get(@Req() req: LoggedInRequest) {
    return await this.requestsService.requests(req.user?.tz ?? '213884489');
  }

  @Post()
  async create(
    @Body() createRequestDto: CreateRequestDto,
    @Req() req: LoggedInRequest,
    @Res() res: Response,
  ) {
    await this.requestsService.create(req.user?.tz ?? '213884489', createRequestDto);
    res.status(HttpStatus.CREATED).send();
  }
}
