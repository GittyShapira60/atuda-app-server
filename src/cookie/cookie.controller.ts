import { Controller, Get, HttpStatus, Res, Req, Logger } from '@nestjs/common';
import { CookieService } from './cookie.service';
import { Response } from 'express';
import { LoggedInRequest } from './../authentication/interface/auth.interface';

@Controller('cookie')
export class CookieController {
  private readonly logger = new Logger(CookieController.name);

  constructor(protected readonly cookieService: CookieService) {}

  @Get()
  async checkSoldier(@Req() req: LoggedInRequest, @Res() res: Response) {
    const tz = req.user?.tz ?? '213884489';
    this.logger.log(`Checking soldier status for user: ${tz}`);
    console.log('Checking soldier status for user:', tz);
    process.stdout.write(`[LOG] Soldier check for user: ${tz}\n`);
    const { user, grantType } = await this.cookieService.isSoldierValid(tz);
    if (req.user) {
      req.user.grantType = grantType;
      (req.session as any).user = req.user;
      (req.session as any).passport?.user &&
        ((req.session as any).passport.user.grant = grantType);
      (req as any).logIn(req.user, (err: any) => err);
      req.session.save();
    }
    res.status(HttpStatus.OK).json({ tz: user.tz });
  }
}
