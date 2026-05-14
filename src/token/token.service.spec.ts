import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from './token.service';
import { of } from 'rxjs';

jest.mock('./../config', () => ({ ENV: 'PROD' }));
jest.mock('exponential-backoff', () => ({
  backOff: jest.fn().mockImplementation((fn) => fn()),
}));

describe('TokenService', () => {
  let service: TokenService;
  let httpService: HttpService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
    httpService = module.get<HttpService>(HttpService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getGraphAccessToken', () => {
    it('should return the existing token if it is fresh', async () => {
      const tokenExpire = Date.now() + 60000;
      const result = await service.getGraphAccessToken(
        tokenExpire,
        '',
        'existingToken',
      );
      expect(result).toEqual({
        token: 'existingToken',
        expires: tokenExpire,
      });
    });

    it('should request a new token if the existing one is not fresh', async () => {
      httpService.post = jest.fn().mockImplementation(() => {
        return of({
          data: { access_token: 'newToken' },
        });
      });

      const result = await service.getGraphAccessToken(
        Date.now() - 60000,
        '',
        'existingToken',
      );
      expect(result.token).toBe('newToken');
      expect(result.expires).toBeGreaterThan(Date.now());
    });

    it('should throw an error if the token request fails', async () => {
      jest.spyOn(httpService, 'post').mockImplementationOnce(() => {
        throw new Error('Request failed');
      });

      await expect(
        service.getGraphAccessToken(Date.now() - 60000, '', 'existingToken'),
      ).rejects.toThrow('Request failed');
    });
  });

  describe('getJwtToken', () => {
    it('should return a JWT token', async () => {
      jest.spyOn(jwtService, 'sign').mockReturnValue('jwtToken');

      const result = await service.getJwtToken('123456789');
      expect(result).toEqual({ idToken: 'jwtToken' });
    });

    it('should throw an error if the JWT signing fails', async () => {
      jest.spyOn(jwtService, 'sign').mockImplementation(() => {
        throw new Error('Signing failed');
      });

      await expect(service.getJwtToken('123456789')).rejects.toThrow(
        'Token Error',
      );
    });
  });
});
