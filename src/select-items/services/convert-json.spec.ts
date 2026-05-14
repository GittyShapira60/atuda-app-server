import { Test, TestingModule } from '@nestjs/testing';
import { ConvertJson } from './convert-json';
import { CookieService } from '../../cookie/cookie.service';
import { SelectItemsService } from '../select-items.service';

jest.mock('env-var', () => ({}));
jest.mock('./../../config', () => ({ ENV: 'PROD' }));

describe('ConvertJson', () => {
  let convertJson: ConvertJson;

  const listItems = [
    {
      _id: '1',
      value: 'אוניברסיטת א',
    },
    {
      _id: '2',
      value: 'אוניברסיטת ב',
    },
  ];

  const mockCookie = {
    getList: jest
      .fn()
      .mockImplementation((value: string) =>
        value == '30' ? listItems : null,
      ),
  };

  const mockSelectItemsService = {};
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConvertJson,
        CookieService,
        {
          provide: CookieService,
          useValue: mockCookie,
        },
        SelectItemsService,
        {
          provide: SelectItemsService,
          useValue: mockSelectItemsService,
        },
      ],
    }).compile();

    convertJson = module.get<ConvertJson>(ConvertJson);
  });

  it('should return the data from cookie according to list id', async () => {
    const result = await convertJson.getVariableDataFromCookie('30');
    expect(result).toEqual([
      { name: 'אוניברסיטת א', id: '00000001' },
      { name: 'אוניברסיטת ב', id: '00000002' },
    ]);
  });
});
