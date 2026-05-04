import { Test, TestingModule } from '@nestjs/testing';
import { RequestsStagesController } from './requests-stages.controller';
import { RequestsStagesService } from './requests-stages.service';

jest.mock('env-var', () => ({}));
jest.mock('./../config', () => ({ ENV: 'PROD' }));

describe('RequestsStagesController', () => {
  let controller: RequestsStagesController;
  let service: RequestsStagesService;

  const mockRequestsService = {
    getRequestType: jest.fn().mockResolvedValue('flowMock'),
    getStages: jest.fn().mockResolvedValue('stagesMock'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequestsStagesController],
      providers: [
        {
          provide: RequestsStagesService,
          useValue: mockRequestsService,
        },
      ],
    }).compile();

    controller = module.get<RequestsStagesController>(RequestsStagesController);
    service = module.get<RequestsStagesService>(RequestsStagesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return the flow by id', async () => {
    const result = await controller.getFlow('123');
    expect(service.getRequestType).toHaveBeenCalledWith('123');
    expect(result).toBe('flowMock');
  });

  it('should return the stage flow by id and stage', async () => {
    const result = await controller.getStagesFlow('123', 'component');
    expect(service.getStages).toHaveBeenCalledWith('123', 'component');
    expect(result).toBe('stagesMock');
  });
});
