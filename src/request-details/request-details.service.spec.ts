import { Test, TestingModule } from '@nestjs/testing';
import { RequestsStagesService } from '../requests-stages/requests-stages.service';
import { RequestDetailsService } from './request-details.service';
import { PrismaService } from './../prisma.service';
import { CookieService } from './../cookie/cookie.service';
import { FileArchiveService } from './../file-archive/file-archive.service';
import { SelectItemsService } from '../select-items/select-items.service';

jest.mock('env-var', () => ({}));
jest.mock('./../config', () => ({ ENV: 'PROD' }));
const stages = [
  {
    schema: {
      properties: {
        keyValueData: {
          type: 'object',
          title: 'keyValueDataTitle',
          layout: {
            props: {
              field: { name: 'value', id: '02' },
            },
          },
        },
        regularData: {
          type: 'string',
          title: 'regularDataTitle',
        },
        cookieData: {
          type: 'string',
          title: 'cookieDataTitle',
          layout: {
            props: {
              data: '${1}',
            },
          },
        },
        file: {
          title: 'fileTitle',
        },
      },
    },
  },
];

const details = [
  {
    id: 1,
    data: '02',
    fieldName: 'keyValueData',
    fieldType: 'string',
    requestId: 'requestId',
  },
  {
    id: 2,
    data: 'data',
    fieldName: 'regularData',
    fieldType: 'string',
    requestId: 'requestId',
  },
  {
    id: 3,
    data: '0001',
    fieldName: 'cookieData',
    fieldType: 'string',
    requestId: 'requestId',
  },
  {
    data: '{"content":"RequestAtd","fileId":"fileId","name":"image","type":"png"}',
    fieldName: 'file',
    fieldType: 'file',
    id: 4,
    requestId: 'requestId',
  },
];

const mockPrisma = {
  requestDetails: {
    findMany: jest.fn().mockReturnValue(details),
  },
  request: {
    findFirst: jest.fn().mockReturnValue({ requestTypeId: '01' }),
  },
};

const mockStages = {
  getRequestTypeById: jest.fn().mockReturnValue('01'),
  getSchema: jest.fn().mockReturnValue(stages),
};

const mockCookie = {
  getList: jest.fn().mockReturnValue([{ value: 'listValue', _id: '1' }]),
};

const mockFileArchive = {
  getFile: jest.fn().mockReturnValue('contentBase64'),
};
const mockSelectItemsService = {
  getSelectItemByName: jest
    .fn()
    .mockReturnValue([{ id: '0001', name: 'listValue' }]),
};
describe('RequestDetailsService', () => {
  let service: RequestDetailsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestDetailsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: RequestsStagesService,
          useValue: mockStages,
        },
        {
          provide: CookieService,
          useValue: mockCookie,
        },
        {
          provide: FileArchiveService,
          useValue: mockFileArchive,
        },
        {
          provide: SelectItemsService,
          useValue: mockSelectItemsService,
        },
      ],
    }).compile();

    service = module.get<RequestDetailsService>(RequestDetailsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('return correct details', async () => {
    expect(await service.requestDetails('01')).toEqual([
      {
        title: 'keyValueDataTitle',
        value: 'value',
        file: false,
        textarea: false,
      },
      {
        title: 'regularDataTitle',
        value: 'data',
        file: false,
        textarea: false,
      },
      {
        title: 'cookieDataTitle',
        value: 'listValue',
        file: false,
        textarea: false,
      },
      {
        title: 'fileTitle',
        value: {
          content: 'contentBase64',
          name: 'image',
          type: 'png',
        },
        file: true,
        textarea: false,
      },
    ]);
  });
});
