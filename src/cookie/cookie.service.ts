import {
  ForbiddenException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { TokenService } from './../token/token.service';
import { lastValueFrom, map } from 'rxjs';
import { AxiosHeaders } from 'axios';
import { COOKIE_API, COOKIE_SCOPE, COOKIE_SUBSCRIPTION_KEY } from './../config';
import { PrismaService } from '../prisma.service';

let token = { token: '', expires: Date.now() };

@Injectable()
export class CookieService {
  constructor(
    protected readonly httpService: HttpService,
    protected readonly tokenService: TokenService,
    protected prisma: PrismaService,
  ) {
    this.httpService.axiosRef.interceptors.request.use(async (config) => {
      try {
        token = await this.tokenService.getGraphAccessToken(
          token.expires,
          COOKIE_SCOPE,
          token.token,
        );
      } catch (err) {
        throw new ServiceUnavailableException(
          'Could not retrieve token, try again later',
        );
      }

      config.headers = config.headers ?? new AxiosHeaders();
      config.headers.Authorization = `Bearer ${token.token}`;

      return config;
    });
  }

  async getSoldierInfo(soldierTz: string) {
    console.log(
      'send req to:',
      COOKIE_API,
      COOKIE_SUBSCRIPTION_KEY,
      COOKIE_SCOPE,
      soldierTz,
    );
    const tz = soldierTz;
    try {
      const observable = this.httpService
        .post('/soldiers/tzs', { tzs: [tz] })
        .pipe(
          map((response) => {
            return response?.data;
          }),
        );
      const soldiersInfo = await lastValueFrom(observable);
      return soldiersInfo.find((soldier) => soldier.tz === soldierTz);
    } catch (err) {
      throw new ServiceUnavailableException(
        'Cannot retrieve information, try again later',
      );
    }
  }

  async isSoldierValid(soldierTz: string) {
    console.log('Checking soldier validity for:', soldierTz);
    try {
      const soldierInfo = await this.getSoldierInfo(soldierTz);
      const authorizedUser =
        soldierInfo?.is_atuda === 'X'
          ? soldierInfo
          : await this.prisma.users.findUnique({
              where: { tz: soldierTz },
            });
      const grantType = await this.hasValidGrantType(soldierInfo);
      if (!authorizedUser && !grantType) {
        throw new ForbiddenException('Access forbidden for this soldier.');
      }
      return { user: authorizedUser ?? { tz: soldierTz }, grantType };
    } catch (err) {
      throw err;
    }
  }

  async hasValidGrantType(soldierInfo: any) {
    if (!soldierInfo?.grants?.length) return null;
    return soldierInfo?.grants?.find((grant: any) =>
      ['23', '25', '26', '27', '28', '29'].includes(grant?.grantType?.code),
    )?.grantType?.code;
  }

  async CalcAtudaPostponementPeriod(atuda_postponement_period: string) {
    const newDate = new Date();
    newDate.setMonth(newDate.getMonth() + parseInt(atuda_postponement_period));
    return newDate.toLocaleDateString('de-DE');
  }

  async getList(listId: string) {
    try {
      const observable = this.httpService
        .post('/codeCollections/fieldNames', { ids: [listId] })
        .pipe(
          map((response) => {
            return response?.data.collections[listId].tableData;
          }),
        );
      return await lastValueFrom(observable);
    } catch (err) {
      throw new ServiceUnavailableException(
        'Cookie - cannot retrieve information, try again later',
      );
    }
  }
}
