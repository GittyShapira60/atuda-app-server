import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { FILE_ARCHIVE_API, FILE_ARCHIVE_SUBSCRIPTION_KEY } from '../config';
import { FileArchiveService } from './file-archive.service';
import { IFileArchiveRequest } from './interfaces/file-archive.interface';

const fileArchiveRequestInstance = HttpModule.registerAsync({
  useFactory: async (): Promise<IFileArchiveRequest> => ({
    baseURL: FILE_ARCHIVE_API,
    headers: {
      'Content-Type': 'application/json',
      'Archive-Api-Key': FILE_ARCHIVE_SUBSCRIPTION_KEY,
    },
  }),
});

@Module({
  imports: [fileArchiveRequestInstance],
  providers: [FileArchiveService],
  exports: [FileArchiveService],
})
export class FileArchiveModule {}
