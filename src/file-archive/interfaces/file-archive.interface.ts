export interface IFileArchiveRequest {
  baseURL: string;
  headers: {
    'Content-Type': string;
    'Archive-Api-Key': string;
  };
}

export interface IFileArchiveUploadResponse {
  FileId: string;
}

export interface IFileArchiveUploadRequestBody {
  nameToRed: string;
  filebase64: string;
  FileProperties: FileProperties;
}

export interface FileProperties {
  DynamicProperties?: DynamicProperties;
  FileName: string;
  FileType: string;
}

export interface DynamicProperties {
  [key: string]: string;
}
