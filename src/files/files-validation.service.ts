import { Injectable } from '@nestjs/common';
import { loadEsm } from 'load-esm';

@Injectable()
export class FileValidationService {
  async getMimeType(base64String) {
    if (!base64String) {
      return 'Invalid input';
    }
    const { fileTypeFromBuffer } = await loadEsm('file-type');
    const buffer = Buffer.from(base64String, 'base64');
    const type = await fileTypeFromBuffer(buffer);
    return type ? type.mime : 'unknown';
  }
}
