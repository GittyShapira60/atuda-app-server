import { lastValueFrom, map } from 'rxjs';
import { BadRequestException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { backOff } from 'exponential-backoff';
import { JwtService } from '@nestjs/jwt';
import { CLIENT_ID, CLIENT_SECRET_VALUE, JWT_SECRET } from './../config';

@Injectable()
export class TokenService {
  constructor(
    protected readonly httpService: HttpService,
    protected readonly jwtService: JwtService,
  ) {}

  protected isTokenFresh = (token: string, expires: number) => {
    return token && expires > Date.now();
  };

  public getGraphAccessToken = async (
    expires: number,
    scope = '',
    token = '',
  ) => {
    const GRANT_TYPE = 'client_credentials';

    if (this.isTokenFresh(token, expires)) {
      return { token, expires };
    }

    const body = {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET_VALUE,
      scope,
      grant_type: GRANT_TYPE,
    };

    try {
      const refreshedToken = await backOff(
        async () => {
          return await lastValueFrom(
            this.httpService
              .post('/', body)
              .pipe(map((res) => res.data.access_token)),
          );
        },
        { numOfAttempts: 3 },
      );

      const oneHourFromNow = Date.now() + 60 * 60 * 1000;

      return { token: refreshedToken, expires: oneHourFromNow };
    } catch (err) {
      throw err;
    }
  };

  async getJwtToken(identity: string) {
    try {
      return {
        idToken: this.jwtService.sign({ identity }, { secret: JWT_SECRET }),
      };
    } catch (err) {
      throw new BadRequestException('Token Error');
    }
  }
}
