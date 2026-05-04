import { Test, TestingModule } from '@nestjs/testing';
import { FileValidationService } from '../files/files-validation.service';
import { RequestsStagesService } from './../requests-stages/requests-stages.service';
import { RequestsValidationService } from './requests-validation.service';

jest.mock('env-var', () => ({}));
jest.mock('./../config', () => ({ ENV: 'PROD' }));

const stages = [
  {
    schema: {
      type: 'object',
      required: ['name'],
      properties: {
        name: {
          type: 'string',
          pattern: '^[A-Za-z]+$',
        },
        age: {
          type: 'number',
        },
        file: {
          layout: {
            props: {
              types: 'application/pdf',
            },
          },
        },
        notRequireFile: {
          key: 'differentKey',
          layout: {
            props: {
              types: 'application/pdf',
            },
          },
        },
      },
      dependencies: {
        name: ['age'],
      },
    },
  },
];

const mockRequestStages = {
  getSchema: jest.fn().mockReturnValue(stages),
};

const mockFileValidation = {
  getMimeType: jest.fn().mockReturnValue('application/pdf'),
};

describe('RequestsValidationService', () => {
  let service: RequestsValidationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestsValidationService,
        {
          provide: RequestsStagesService,
          useValue: mockRequestStages,
        },
        {
          provide: FileValidationService,
          useValue: mockFileValidation,
        },
      ],
    }).compile();

    service = module.get<RequestsValidationService>(RequestsValidationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const request = {
    userIdentity: '233080019',
    reason: 'academic',
    requestTypeId: '01',
    requestDetails: Object.assign({
      name: 'Bob',
      age: 15,
      file: [
        {
          name: 'file',
          type: 'application/pdf',
        },
      ],
      notRequireFile: {
        key: 'differentKey',
        value: [
          {
            name: 'file',
            type: 'application/pdf',
          },
        ],
      },
    }),
  };

  it('valid request', async () => {
    expect(await service.isValid(request)).toEqual(undefined);
  });

  it('invalid request', async () => {
    request.requestDetails.age = undefined;
    expect(await service.isValid(request)).toEqual(
      'Missing depend field of name',
    );

    request.requestDetails.age = '15';
    request.requestDetails.file[0].name = 'image';
    request.requestDetails.file[0].type = 'image/png';
    expect(await service.isValid(request)).toEqual(
      'age, image.image/png is invalid type',
    );

    request.requestDetails.name = undefined;
    expect(await service.isValid(request)).toEqual(
      'Missing required field: name',
    );
  });
});
