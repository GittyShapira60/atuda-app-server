import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  serializeUser(user: any, done: (err: any, user: any) => void): any {
    done(null, { tz: user.tz, grantType: user.grantType });
  }
  deserializeUser(payload: any, done: (err: any, user: any) => void): any {
    done(null, payload);
  }
}
