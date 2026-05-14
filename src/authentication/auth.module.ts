import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AzureAdStrategy } from './strategy/azureAd.strategy';
import { BackdoorStrategy } from './strategy/backdoor.strategy';
import { SessionSerializer } from './session.serializer';

@Module({
  imports: [PassportModule],
  providers: [AzureAdStrategy, SessionSerializer, BackdoorStrategy],
})
export class AuthModule {}
