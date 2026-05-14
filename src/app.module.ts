import { Module } from '@nestjs/common';
import { RequestsStagesController } from './requests-stages/requests-stages.controller';
import { RequestsStagesService } from './requests-stages/requests-stages.service';
import { RequestsController } from './requests/requests.controller';
import { RequestsService } from './requests/requests.service';
import { RequestsValidationService } from './requests/requests-validation.service';
import { SelectItemsService } from './select-items/select-items.service';
import { RequestTypesService } from './request-types/request-types.service';
import { RequestTypesController } from './request-types/request-types.controller';
import { PrismaService } from './prisma.service';
import { ConvertJson } from './select-items/services/convert-json';
import { AuthModule } from './authentication/auth.module';
import { CookieModule } from './cookie/cookie.module';
import { TokenModule } from './token/token.module';
import { JwtModule } from '@nestjs/jwt';
import * as env from './config';
import { FileArchiveModule } from './file-archive/file-archive.module';
import { TokenController } from './token/token.controller';
import { RateLimiterModule } from './rate-limiter.module';
import { FileValidationService } from './files/files-validation.service';
import { RequestDetailsController } from './request-details/request-details.controller';
import { RequestDetailsService } from './request-details/request-details.service';

@Module({
  imports: [
    CookieModule,
    TokenModule,
    AuthModule,
    RateLimiterModule,
    FileArchiveModule,
    JwtModule.register({
      secret: env.JWT_SECRET,
      signOptions: { expiresIn: '60m' },
    }),
  ],
  controllers: [
    RequestsStagesController,
    RequestsController,
    RequestTypesController,
    TokenController,
    RequestDetailsController,
  ],
  providers: [
    RequestsStagesService,
    RequestsService,
    SelectItemsService,
    ConvertJson,
    PrismaService,
    RequestTypesService,
    RequestsValidationService,
    FileValidationService,
    RequestDetailsService,
  ],
})
export class AppModule {}
