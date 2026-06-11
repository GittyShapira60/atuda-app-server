import { BadRequestException, Injectable } from '@nestjs/common';
import { Request } from '@prisma/client';
import { PrismaService } from './../prisma.service';
import { RequestsStagesService } from './../requests-stages/requests-stages.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { Status } from './enum/status.enum';
import { RequestsValidationService } from './requests-validation.service';
import { v4 as uuidv4 } from 'uuid';
import { FileArchiveService } from '../file-archive/file-archive.service';
import { ENV } from './../config';
import { SUPPLEMENTAL_FILES_FIELD } from './constants/supplemental-files.constant';

@Injectable()
export class RequestsService {
  constructor(
    protected prisma: PrismaService,
    protected fileArchiveService: FileArchiveService,
    protected requestsStagesService: RequestsStagesService,
    protected requestsValidationService: RequestsValidationService,
  ) {}

  async requests(
    userIdentity: string,
  ): Promise<{ status: string; requestType: string }[]> {
    try {
      const requests = await this.prisma.request.findMany({
        where: {
          userIdentity,
        },
        select: {
          id: true,
          status: true,
          requestType: {
            select: {
              name: true,
              id: true,
            },
          },
        },
      });
      return requests.map((request) => ({
        id: request.id,
        status: request.status,
        requestType: request.requestType.name,
        requestTypeId: request.requestType.id,
      }));
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async create(
    userIdentity: string,
    requestDTO: CreateRequestDto,
  ): Promise<Request> {
    if (!this.requestsValidationService.isValidIdentity(userIdentity)) {
      throw new BadRequestException('Invalid userIdentity.');
    }
    const message = await this.requestsValidationService.isValid(requestDTO);
    if (message) {
      throw new BadRequestException(message);
    }
    return await this.insert(userIdentity, requestDTO);
  }

  protected async insert(
    userIdentity: string,
    requestDTO: CreateRequestDto,
  ): Promise<Request> {
    const { requestTypeId, requestDetails } = requestDTO;
    try {
      return this.prisma.request.create({
        data: {
          id: await this.getUniqueId(userIdentity, requestTypeId),
          createdOn: new Date(
            new Date().getTime() + 2 * 60 * 60 * 1000,
          ).toISOString(),
          lastChangeStatus: new Date(
            new Date().getTime() + 2 * 60 * 60 * 1000,
          ).toISOString(),
          status: Status.ACTIVE,
          userIdentity: userIdentity,
          requestTypeId: requestTypeId,
          requestDetails: {
            create: await this.convertJsonToRequestDetails(
              userIdentity,
              requestDetails,
            ),
          },
        },
        include: {
          requestDetails: true,
        },
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  protected generateId(userIdentity, requestTypeId) {
    let result = userIdentity;
    result += requestTypeId;
    const length = result.length;
    for (let i = 0; i < 15 - length; i++) {
      result += Math.floor(Math.random() * 10);
    }
    return result;
  }

  async getUniqueId(userIdentity, requestTypeId) {
    let uniqueId: string;
    let exists: boolean;

    do {
      uniqueId = this.generateId(userIdentity, requestTypeId);
      exists =
        (await this.prisma.request.count({ where: { id: uniqueId } })) > 0;
    } while (exists);

    return uniqueId;
  }

  protected async convertJsonToRequestDetails(
    userIdentity,
    requestDetails: JSON,
  ) {
    const detailsArray = await Promise.all(
      Object.keys(requestDetails).flatMap(async (detail) => {
        const fieldName = requestDetails[detail].key || detail;
        const details = requestDetails[detail].value || requestDetails[detail];
        if (Array.isArray(details)) {
          if (
            details.length &&
            typeof details[0] === 'object' &&
            'content' in details[0]
          ) {
            return await Promise.all(
              details.map(async (item) => {
                const { nameToRed, fileId } = await this.uploadFile(
                  userIdentity,
                  item,
                );
                return {
                  fieldName,
                  fieldType: 'file',
                  data: JSON.stringify({
                    content: nameToRed,
                    fileId,
                    name: item.name,
                    type: item.suffix,
                  }),
                };
              }),
            );
          }
          return {
            fieldName,
            fieldType: 'array',
            data: JSON.stringify(details),
          };
        }
        return {
          fieldName,
          fieldType: typeof details,
          data: details.toString(),
        };
      }),
    );
    return detailsArray.flat();
  }

  async uploadFile(userIdentity, file) {
    let env;
    switch (ENV) {
      case 'PREPROD':
        env = 's';
        break;
      case 'PROD':
        env = 'p';
        break;
      default:
        env = 'q';
    }

    const nameToRed =
      `RequestAtd_${env}_${userIdentity}_${uuidv4().replace(/-/g, '')}`.slice(
        0,
        32,
      );

    try {
      const fileId = await this.fileArchiveService.uploadFile({
        nameToRed,
        filebase64: file.content,
        FileProperties: {
          FileName: file.name,
          FileType: file.suffix,
        },
      });
      return { nameToRed: nameToRed, fileId: fileId };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async addFiles(requestId: string, requestDetails: JSON): Promise<void> {
    const request = await this.prisma.request.findUnique({
      where: { id: requestId },
      select: { userIdentity: true },
    });
    if (!request) {
      throw new BadRequestException('Request not found');
    }
    try {
      const newDetailsArray = await this.convertJsonToRequestDetails(
        request.userIdentity,
        requestDetails,
      );
      await this.prisma.request.update({
        where: { id: requestId },
        data: {
          requestDetails: {
            create: newDetailsArray.map((detail) => ({
              ...detail,
              isOrigin: false,
            })),
          },
          isOrigin: false,
          lastChangeStatus: new Date(
            new Date().getTime() + 2 * 60 * 60 * 1000,
          ).toISOString(),
        },
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error);
    }
  }
  
  async deleteFile(requestId: string, detailId: number): Promise<void> {
    try {
      const deleted = await this.prisma.requestDetails.deleteMany({
        where: {
          id: detailId,
          requestId,
        },
      });

      if (deleted.count === 0) {
        throw new BadRequestException('Detail not found for deletion');
      }

      await this.prisma.request.update({
        where: { id: requestId },
        data: {
          lastChangeStatus: new Date(
            Date.now() + 2 * 60 * 60 * 1000,
          ).toISOString(),
        },
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error);
    }
  }
  
}
