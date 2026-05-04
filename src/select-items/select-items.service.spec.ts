import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { SelectItemsService } from './select-items.service';

describe('SelectItemsService', () => {
  let service: SelectItemsService;

  const db = {
    selectItem: {
      findMany: jest
        .fn()
        .mockImplementation(({ where: { listName } }) =>
          listName === 'university' ? ['אוניברסיטת א', 'אוניברסיטת ב'] : null,
        ),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SelectItemsService,
        {
          provide: PrismaService,
          useValue: db,
        },
      ],
    }).compile();

    service = module.get<SelectItemsService>(SelectItemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('get Select Item By Name', () => {
    it('should successfully get Select Item By Name', async () => {
      const result = await service.getSelectItemByName('university');
      expect(result).toEqual(['אוניברסיטת א', 'אוניברסיטת ב']);
    });
  });
});
