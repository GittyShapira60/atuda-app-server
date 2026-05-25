import { BadRequestException, Injectable } from '@nestjs/common';
import { CookieService } from './../cookie/cookie.service';
import { FileArchiveService } from './../file-archive/file-archive.service';
import { RequestsStagesService } from './../requests-stages/requests-stages.service';
import { PrismaService } from '../prisma.service';
import { SelectItemsService } from '../select-items/select-items.service';
import {
  SUPPLEMENTAL_FILES_FIELD,
  SUPPLEMENTAL_FILES_TITLE,
} from '../requests/constants/supplemental-files.constant';

@Injectable()
export class RequestDetailsService {
  protected GENERAL_REASON: string = '';
  constructor(
    protected prisma: PrismaService,
    protected requestsStagesService: RequestsStagesService,
    protected cookieService: CookieService,
    protected fileArchiveService: FileArchiveService,
    protected selectItemsService: SelectItemsService,
  ) {}

  async getDetails(requestId: string) {
    try {
      const details = await this.prisma.requestDetails.findMany({
        where: { requestId: requestId },
      });
      return await Promise.all(
        details.map((detail) => ({
          id: detail.id,
          name: detail.fieldName,
          type: detail.fieldType,
          data: detail.data,
        })),
      );
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getRequestTypeId(requestId: string) {
    try {
      return await this.prisma.request.findFirst({
        where: { id: requestId },
        select: { requestTypeId: true },
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getProperties(requestId: string) {
    const id = (await this.getRequestTypeId(requestId))?.requestTypeId;
    if (!id) {
      throw new BadRequestException('request Id not found');
    }
    const requestType = await this.requestsStagesService.getRequestTypeById(id);
    const details = await this.getDetails(requestId);
    const generalReason = details.find(
      (item) => item.name === 'generalReason',
    )?.data;
    if (generalReason && requestType.stagesFlow['isDepend']) {
      this.GENERAL_REASON = requestType.stagesFlow['menuTitle'];
      return await this.getDependSchemaProperties(
        requestType,
        generalReason,
        id,
      );
    }
    return await this.getNotDependSchemaProperties(id);
  }

  async getDependSchemaProperties(requestType, generalReason, id) {
    const option = requestType.stagesFlow['options'].find(
      (option) => option.displayName === generalReason,
    )?.name;
    return (await this.requestsStagesService.getSchema(id, option)).map(
      (stage) => ({
        properties: stage.schema.properties,
      }),
    );
  }

  async getNotDependSchemaProperties(id) {
    return (await this.requestsStagesService.getSchema(id, 'academic')).map(
      (stage) => ({
        properties: stage.schema.properties,
      }),
    );
  }

  async prepareDetails(properties, details) {
    const detailsForSummary = [];
    details = details.filter((detail) => detail.name !== 'signature');
    for (const detail of details) {
      const property = properties.find((prop) => prop.properties[detail.name]);
      if (detail.name === 'generalReason') {
        detail.name = this.GENERAL_REASON || detail.name;
      }
      const file = this.isFile(detail);
      if (file) {
        detail.data = {
          content: await this.convertFile(file.fileId),
          name: file.name,
          type: file.type,
        };
      }
      detailsForSummary.push(await this.createFinalObject(property, detail));
    }
    return detailsForSummary;
  }

  async createFinalObject(property, detail) {
    const schemaProp = property?.properties[detail.name];
    const isSupplemental =
      detail.name === SUPPLEMENTAL_FILES_FIELD && detail.type === 'file';
    const value =
      schemaProp?.layout?.slots?.component === 'date-range-picker'
        ? this.formatDateRange(detail.data)
        : schemaProp
          ? await this.convertValues(detail.data, schemaProp)
          : detail.data;

    return {
      detailId: detail.id,
      fieldName: detail.name,
      title: isSupplemental
        ? SUPPLEMENTAL_FILES_TITLE
        : schemaProp?.title || (detail.type === 'file' ? null : detail.name),
      value,
      textarea: schemaProp?.layout?.slots?.component === 'textarea',
      file: detail.type === 'file',
      deletable: isSupplemental,
    };
  }

  private formatDateRange(data: string): string {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length === 2) {
        const [start, end] = parsed;
        const toDisplay = (d: string) =>
          new Date(d).toLocaleDateString('he-IL');
        return `${toDisplay(end)} - ${toDisplay(start)}`;
      }
    } catch {}
    return data;
  }

  isFile(detail) {
    try {
      const jsonData = JSON.parse(detail.data);
      return typeof jsonData === 'object' && 'fileId' in jsonData
        ? jsonData
        : false;
    } catch {
      return false;
    }
  }

  async convertValues(data, props): Promise<string> {
    const result = this.findInnerObject(data, props);
    if (result && result.id) {
      return result.name;
    }
    if (result && result.data?.match(/\${([^}]+)}/g)) {
      const listName = result.data?.substring(2, result.data?.length - 1);
      // const list = await this.cookieService.getList(id);
      const list = await this.selectItemsService.getSelectItemByName(listName);
      return list?.find((l) => String(l.id) === String(data))?.name ?? data;
    }
    return data;
  }

  findInnerObject(data, obj: any) {
    if (typeof obj !== 'object' || obj === null) {
      return null;
    }
    if ('name' in obj && 'id' in obj && obj.id === data) {
      return obj;
    }
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        if (typeof value === 'string' && value.match(/\${([^}]+)}/g)) {
          return obj;
        }
        const result = this.findInnerObject(data, value);
        if (result) {
          return result;
        }
      }
    }
    return null;
  }

  async convertFile(id) {
    return await this.fileArchiveService.getFile(id);
  }

  async requestDetails(requestId: string) {
    const properties = await this.getProperties(requestId);
    const details = await this.getDetails(requestId);
    return await this.prepareDetails(properties, details);
  }

 
}

