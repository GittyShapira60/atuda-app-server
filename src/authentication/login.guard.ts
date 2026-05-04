import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable, lastValueFrom } from 'rxjs';
import { BackdoorAvailable } from '../environment';

@Injectable()
export class LoginGuard extends AuthGuard(
  BackdoorAvailable() ? ['backdoor', 'azure-ad'] : ['azure-ad'],
) {
  public constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );

    if (isPublic) {
      return true;
    }

    const resultPromise = super.canActivate(context);
    let result: boolean;
    if (resultPromise instanceof Observable) {
      result = await lastValueFrom(resultPromise);
    } else {
      result = await resultPromise;
    }
    return result;
  }
}
