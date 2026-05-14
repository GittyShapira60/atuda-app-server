import { BadRequestException, Injectable } from '@nestjs/common';
import { ConvertJson } from '../select-items/services/convert-json';
import { PrismaService } from './../prisma.service';

@Injectable()
export class RequestsStagesService {
  constructor(
    protected prisma: PrismaService,
    protected convert: ConvertJson,
  ) {}

  async getRequestType(id: string) {
    const data = await this.getRequestTypeById(id);
    if (!data) {
      throw new BadRequestException('RequestType ID not found');
    }
    if (data.stagesFlow['options']) {
      data.stagesFlow['options'] = data.stagesFlow['options'].map(
        (option: any) => ({
          name: option.name,
          displayName: option.displayName,
        }),
      );
    }
    return data;
  }

  async getStages(id: string, stage: string) {
    const stagesFlow = await this.getSchema(id, stage);
    return this.convert.replaceVariables(await Promise.all(stagesFlow));
  }

  async getSchema(id: string, stage: string) {
    const data = await this.getRequestTypeById(id);

    if (!data) {
      throw new BadRequestException('RequestType ID not found');
    }
    const stages = data.stagesFlow['isDepend']
      ? data.stagesFlow['options'].filter((option) => option.name === stage)[0]
          .stages
      : data.stagesFlow['options'];

    if (!stages) {
      throw new BadRequestException('Stage name not found');
    }
    return Promise.all(
      stages.map((stage: string) => this.getStageFlowByName(stage)),
    );
  }

  async getRequestTypeById(id: string) {
    try {
      return await this.prisma.requestType.findUnique({
        where: { id: id },
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getStageFlowByName(name: string) {
    try {
      const result = await this.prisma.stage.findUnique({
        where: { key: name },
      });
      const convertedSchemaProperties = {};
      result.schema['properties'].forEach((property) => {
        Object.assign(convertedSchemaProperties, property);
      });
      result.schema['properties'] = convertedSchemaProperties;
      return result;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
