import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './../prisma.service';
import { RequestsService } from './requests.service';
import { RequestsStagesService } from './../requests-stages/requests-stages.service';
import { RequestsValidationService } from './requests-validation.service';
import { FileArchiveService } from '../file-archive/file-archive.service';
import { FileValidationService } from '../files/files-validation.service';

jest.mock('env-var', () => ({}));
jest.mock('./../config', () => ({ ENV: 'PROD' }));

const request = {
  id: 'cddaiaabjaAhhsyUjTTHsvghTabQlUJd',
  requestTypeId: '01',
  userIdentity: '233080019',
  createdOn: new Date(),
  status: 'ACTIVE',
  lastChangeStatus: new Date(),
  requestDetails: [
    {
      id: 35,
      requestId: 18,
      fieldName: 'name',
      fieldType: 'string',
      data: 'Bob',
    },
    {
      id: 36,
      requestId: 18,
      fieldName: 'age',
      fieldType: 'number',
      data: '15',
    },
    {
      id: 37,
      requestId: 18,
      fieldName: 'image',
      fieldType: 'file',
      data: {
        content: 'nameToRed',
        name: 'image',
        type: 'image/png',
      },
    },
  ],
};

const db = {
  request: {
    findMany: jest
      .fn()
      .mockImplementation(({ where: { userIdentity } }) =>
        userIdentity === request.userIdentity
          ? [{ status: request.status, requestType: { name: 'בקשה א' } }]
          : [],
      ),
    findFirst: jest.fn().mockReturnValue(null),
    create: jest.fn().mockReturnValue(request),
    count: jest.fn().mockReturnValue(0),
  },
};
const stages = [
  {
    schema: {
      type: 'object',
      required: [],
      properties: [
        {
          name: {
            type: 'string',
          },
          age: {
            type: 'number',
          },
          image: {},
        },
      ],
    },
  },
];
const mockRequestStages = {
  getSchema: jest.fn().mockReturnValue(stages),
};

const mockFileArchive = {
  uploadFile: jest.fn(),
};

const mockFileValidation = {
  getMimeType: jest.fn().mockReturnValue('image/png'),
};

describe('RequestsService', () => {
  let service: RequestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestsService,
        RequestsValidationService,
        {
          provide: PrismaService,
          useValue: db,
        },
        {
          provide: RequestsStagesService,
          useValue: mockRequestStages,
        },
        {
          provide: FileArchiveService,
          useValue: mockFileArchive,
        },
        {
          provide: FileValidationService,
          useValue: mockFileValidation,
        },
      ],
    }).compile();

    service = module.get<RequestsService>(RequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find requests by userIdentity', () => {
    expect(service.requests('233080019')).resolves.toEqual([
      {
        status: request.status,
        requestType: 'בקשה א',
      },
    ]);
  });

  it('should not find requests by userIdentity', () => {
    expect(service.requests('123456789')).resolves.toEqual([]);
  });

  it('should successfully insert a request', () => {
    expect(
      service.create('233080019', {
        reason: 'academic',
        requestTypeId: '01',
        requestDetails: Object.assign({
          name: 'Bob',
          age: 15,
          image: [
            {
              name: 'image',
              type: 'png',
              content: 'base64',
            },
          ],
        }),
      }),
    ).resolves.toEqual(request);
  });

  it('should failed on insert an exists request', () => {
    const db2 = db;
    db2.request.findFirst = jest.fn().mockResolvedValue(request);
    expect(
      service.create('233080019', {
        reason: 'academic',
        requestTypeId: '01',
        requestDetails: Object.assign({
          name: 'Bob',
          age: 15,
        }),
      }),
    ).resolves.toEqual(request);
  });
});
