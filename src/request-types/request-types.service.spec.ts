import { Test, TestingModule } from '@nestjs/testing';
import { RequestsService } from '../requests/requests.service';
import { PrismaService } from './../prisma.service';
import { RequestTypesService } from './request-types.service';

jest.mock('env-var', () => ({}));
jest.mock('./../config', () => ({ ENV: 'PROD' }));

const types = [
  {
    id: '01',
    name: '',
    isAvailable: true,
    declarationText: '',
    description: '',
    duration: 15,
    stagesFlow: {},
  },
];

const db = {
  requestType: {
    findMany: jest.fn().mockReturnValue(types),
  },
};

const mockIsExist = {
  isExist: jest
    .fn()
    .mockImplementation((userIdentity: string, requestTypeId: string) => {
      return userIdentity === '123456789' && requestTypeId === '01';
    }),
};

describe('RequestTypesService', () => {
  let service: RequestTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestTypesService,
        {
          provide: PrismaService,
          useValue: db,
        },
        { provide: RequestsService, useValue: mockIsExist },
      ],
    }).compile();

    service = module.get<RequestTypesService>(RequestTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return array of request types', async () => {
    expect(await service.requestTypes(true)).toEqual([
      {
        id: types[0].id,
        name: types[0].name,
        isAvailable: types[0].isAvailable,
      },
    ]);
    expect(await service.requestTypes(false)).toEqual([
      {
        id: types[0].id,
        name: types[0].name,
        isAvailable: types[0].isAvailable,
      },
    ]);
  });
});
