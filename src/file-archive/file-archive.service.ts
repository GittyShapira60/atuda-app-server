import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import {
  IFileArchiveUploadRequestBody,
  IFileArchiveUploadResponse,
} from './interfaces/file-archive.interface';

@Injectable()
export class FileArchiveService {
  constructor(private readonly httpService: HttpService) {}

  public async uploadFile(
    file: IFileArchiveUploadRequestBody,
  ): Promise<string> {
    const response = await firstValueFrom(
      await this.httpService.post<IFileArchiveUploadResponse>(
        'func-upload',
        file,
      ),
    );

    return response.data.FileId;
  }

  public async getFile(fileId) {
    try {
      const response = await firstValueFrom(
        await this.httpService.post('func-getFile', { fileId: fileId }),
      );
      return response.data.FileBase64;
    } catch (error) {
      return '';
    }
  }
}
