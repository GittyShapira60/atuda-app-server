import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TokenModule } from './../token/token.module';
import { CookieRequest } from './interfaces/cookie.interface';
import { CookieService } from './cookie.service';
import { COOKIE_API, COOKIE_SUBSCRIPTION_KEY } from './../config';
import { CookieController } from './cookie.controller';
import { PrismaService } from '../prisma.service';

const cookieRequestInstance = HttpModule.registerAsync({
  useFactory: async (): Promise<CookieRequest> => ({
    baseURL: COOKIE_API || '',
    headers: {
      'Content-Type': 'application/json',
      'Cookie-Subscription-Key': COOKIE_SUBSCRIPTION_KEY || '',
    },
  }),
});

@Module({
  imports: [cookieRequestInstance, TokenModule],
  controllers: [CookieController],
  providers: [CookieService, PrismaService],
  exports: [CookieService],
})
export class CookieModule {}
