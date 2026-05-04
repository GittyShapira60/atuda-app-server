import { Test } from '@nestjs/testing';
import { CookieService } from './cookie.service';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { HttpService } from '@nestjs/axios';
import { TokenService } from '../token/token.service';
import { createObservable, observableError } from './observableFactory';
import {
  ForbiddenException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';

jest.mock('env-var', () => ({}));
jest.mock('./../config', () => ({ ENV: 'PROD' }));
describe('cookie service', () => {
  let httpMock: DeepMocked<HttpService>;
  let service: CookieService;

  beforeEach(async () => {
    const httpServiceMocker = createMock<HttpService>();

    httpServiceMocker.axiosRef.interceptors = {
      request: { use: jest.fn(), eject: jest.fn(), clear: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn(), clear: jest.fn() },
    };

    httpServiceMocker.axiosRef.interceptors.request.use = jest.fn();

    const mockTokenService = {
      getGraphAccessToken: jest
        .fn()
        .mockResolvedValue({ token: 'mocked_token' }),
    };
    const mockPrisma = {
      users: {
        findUnique: jest
          .fn()
          .mockImplementation(({ where: { tz } }) =>
            tz === '1' ? true : false,
          ),
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        CookieService,
        { provide: TokenService, useValue: mockTokenService },
        { provide: HttpService, useValue: httpServiceMocker },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    httpMock = module.get(HttpService);
    service = module.get(CookieService);
  });

  describe('isSoldierValid', () => {
    it('should return true if valid soldier', async () => {
      httpMock.post = jest.fn().mockImplementation(() => {
        return createObservable({
          data: [
            {
              tz: '1',
              is_atuda: 'X',
              grants: [{ grantType: { code: '23' } }],
            },
          ],
        });
      });

      const result = await service.isSoldierValid('1');
      expect(result).toStrictEqual({
        user: {
          tz: '1',
          is_atuda: 'X',
          grants: [{ grantType: { code: '23' } }],
        },
        grantType: '23',
      });
    });

    it('should handle soldier not found', async () => {
      httpMock.post = jest.fn().mockImplementation(() => {
        return createObservable({
          data: [{ tz: '1' }],
        });
      });

      await expect(service.isSoldierValid('2')).rejects.toThrow(
        new ForbiddenException('Access forbidden for this soldier.'),
      );
    });

    it('should throw ServiceUnavailableException when getSoldierInfo fails', async () => {
      httpMock.post = jest
        .fn()
        .mockImplementation(() => observableError(new Error('error')));
      await expect(service.isSoldierValid('1')).rejects.toThrow(
        ServiceUnavailableException,
      );
    });
  });

  describe('CalcAtudaPostponementPeriod ', () => {
    it('should return date with calc of atuda_postponement_period', async () => {
      httpMock.post = jest.fn().mockImplementation(() => {
        return createObservable({
          data: [{ tz: '1' }],
        });
      });

      const result = await service.CalcAtudaPostponementPeriod('1');
      expect(result).toMatch(/^\d{1,2}\.\d{1,2}\.\d{4}$/);
    });
  });
});
