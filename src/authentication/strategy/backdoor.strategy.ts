import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { LoggedInRequest } from '../interface/auth.interface';
import { JWT_SECRET } from '../../config';

@Injectable()
export class BackdoorStrategy extends PassportStrategy(Strategy, 'backdoor') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET,
    });
  }

  async validate(payload: any) {
    if (Date.now() / 1000 > payload.exp) {
      throw new UnauthorizedException('access token is expired');
    }
    const user: LoggedInRequest['user'] = {
      tz: payload.identity,
    };

    return user;
  }
}
