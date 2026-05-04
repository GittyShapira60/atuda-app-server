import { Test, TestingModule } from '@nestjs/testing';
import { TokenModule } from './token.module';

jest.mock('env-var', () => ({}));
jest.mock('./../config', () => ({ ENV: 'PROD' }));

describe('TokenModule', () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [TokenModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });
});
