import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SelectItemsService {
  constructor(protected prisma: PrismaService) {}

  async getSelectItemByName(name: string) {
    try {
      return await this.prisma.selectItem.findMany({
        where: { listName: name },
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
