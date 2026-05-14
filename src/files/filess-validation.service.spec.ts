import { Test, TestingModule } from '@nestjs/testing';
import { FileValidationService } from './files-validation.service'; // שנה את השם בהתאם לשירות שלך
import { loadEsm } from 'load-esm';

jest.mock('load-esm');

describe('FileValidationService', () => {
  let service: FileValidationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileValidationService],
    }).compile();

    service = module.get<FileValidationService>(FileValidationService);
  });

  it('should return "Invalid input" for empty input', async () => {
    const result = await service.getMimeType('');
    expect(result).toBe('Invalid input');
  });

  it('should return "unknown" for invalid base64 string', async () => {
    (loadEsm as jest.Mock).mockResolvedValue({
      fileTypeFromBuffer: jest.fn().mockResolvedValue(null),
    });

    const result = await service.getMimeType('invalidBase64String');
    expect(result).toBe('unknown');
  });

  it('should return mime type for valid base64 string', async () => {
    const mockMimeType = { mime: 'image/png' };
    (loadEsm as jest.Mock).mockResolvedValue({
      fileTypeFromBuffer: jest.fn().mockResolvedValue(mockMimeType),
    });

    const base64String = Buffer.from('test image data').toString('base64');
    const result = await service.getMimeType(base64String);
    expect(result).toBe('image/png');
  });
});
