import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  Param,
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
    await this.requestsService.create(
      req.user?.tz ?? '213884489',
      createRequestDto,
    );
    res.status(HttpStatus.CREATED).send();
  }

  @Post(':requestId/add-files')
  async addFiles(
    @Param('requestId') requestId: string,
    @Body() requestDetails: JSON,
    @Res() res: Response,
  ) {
    await this.requestsService.addFiles(
      requestId,
      requestDetails,
    );
    res.status(HttpStatus.CREATED).send();
  }

  @Post(':requestId/delete-file')
  async deleteFile(
    @Param('requestId') requestId: string,
    @Body() body: { detailId: number },
    @Res() res: Response,
  ) {
    await this.requestsService.deleteFile(requestId, body.detailId);
    res.status(HttpStatus.OK).send();
  }
 
}

