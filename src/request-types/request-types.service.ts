import { BadRequestException, Injectable } from '@nestjs/common';
import { RequestsService } from '../requests/requests.service';
import { PrismaService } from './../prisma.service';

@Injectable()
export class RequestTypesService {
  constructor(
    protected prisma: PrismaService,
    protected requestService: RequestsService,
  ) {}

  async requestTypes(grantType: boolean): Promise<
    {
      id: string;
      name: string;
      isAvailable: boolean;
    }[]
  > {
    try {
      const requestTypes = await this.prisma.requestType.findMany({
        where: grantType ? { id: '06' } : { id: { not: '06' } },
      });
      return Promise.all(
        requestTypes.map(async (requestType) => {
          return {
            id: requestType.id,
            name: requestType.name,
            isAvailable: requestType.isAvailable,
          };
        }),
      );
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
