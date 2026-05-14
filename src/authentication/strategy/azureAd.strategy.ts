import {
  BearerStrategy,
  IBearerStrategyOption,
  ITokenPayload,
  VerifyCallback,
} from 'passport-azure-ad';
import {
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import passport = require('passport');
import { LoggedInRequest } from '../interface/auth.interface';
import { TENANT_ID, CLIENT_ID } from '../../config';

const tenantId = TENANT_ID;
const clientID = CLIENT_ID;

const azureCredentials: IBearerStrategyOption = {
  identityMetadata: `https://login.microsoftonline.com/${tenantId}/v2.0/.well-known/openid-configuration`,
  clientID,
  validateIssuer: true,
  issuer: `https://login.microsoftonline.com/${tenantId}/v2.0`,
  audience: clientID,
};

@Injectable()
export class AzureAdStrategy extends BearerStrategy implements OnModuleInit {
  onModuleInit() {
    passport.use('azure-ad', this);
  }

  constructor() {
    super(
      azureCredentials,
      async (token: ITokenPayload, done: VerifyCallback) => {
        if (Date.now() / 1000 > token.exp) {
          return done(new UnauthorizedException('access token is expired'));
        }
        const tokenUsername = token?.preferred_username?.slice(0, 9);
        const tokenAppId = !tokenUsername && token?.azp;

        if (!tokenUsername && !tokenAppId) {
          return done(new UnauthorizedException('Missing User'));
        }

        const user: LoggedInRequest['user'] = {
          tz: token.preferred_username.split('@')[0],
        };

        return done(null, user, token);
      },
    );
  }
}
