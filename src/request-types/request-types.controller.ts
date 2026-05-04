import { Controller, Get, Req } from '@nestjs/common';
import { RequestTypesService } from './request-types.service';
import { LoggedInRequest } from 'src/authentication/interface/auth.interface';

@Controller('request-types')
export class RequestTypesController {
  constructor(protected readonly requestTypesService: RequestTypesService) {}

  @Get()
  async get(@Req() req: LoggedInRequest) {
    return this.requestTypesService.requestTypes(
      (req.session as any).user?.grantType,
    );
  }
}
