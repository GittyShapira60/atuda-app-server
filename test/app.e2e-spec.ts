import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma.service';

jest.mock('env-var', () => ({}));
jest.mock('./../src/config', () => ({
  ENV: 'PROD',
  CLIENT_ID: 'clientID',
  TENANT_ID: 'tenantID',
  JWT_SECRET: 'jwtSecret',
}));

describe('AppController (e2e)', () => {
  let app: INestApplication;
  const mockPrisma = {};
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {});
});
