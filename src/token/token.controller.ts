import { Body, Controller, NotFoundException, Post, Req } from '@nestjs/common';
import { TokenService } from './token.service';
import { BackdoorAvailable } from './../environment';
import { LoggedInRequest } from './../authentication/interface/auth.interface';
import { ALLOWED_TO_BACKDOOR } from './../config';

@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Post('/getToken')
  async getToken(@Body('tz') tz: string, @Req() req: LoggedInRequest) {
    if (!BackdoorAvailable() || !ALLOWED_TO_BACKDOOR.includes(req.user.tz)) {
      throw new NotFoundException('Backdoor not available');
    }

    return this.tokenService.getJwtToken(tz);
  }
}
