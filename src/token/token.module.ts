import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TokenService } from './token.service';
import { JwtModule } from '@nestjs/jwt';
import { TENANT_ID } from './../config';

const tokenRequestInstance = HttpModule.registerAsync({
  useFactory: async () => {
    const API = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;
    const HOST = 'login.microsoftonline.com';
    const CONTENT_TYPE = 'application/x-www-form-urlencoded';

    return {
      baseURL: API,
      headers: {
        Host: HOST,
        'Content-Type': CONTENT_TYPE,
      },
    };
  },
});

@Module({
  imports: [tokenRequestInstance, JwtModule],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
