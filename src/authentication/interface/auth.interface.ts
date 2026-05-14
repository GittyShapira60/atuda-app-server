import { Request } from 'express';

export interface LoggedInRequest extends Request {
  user: { tz: string; grantType?: boolean };
}
