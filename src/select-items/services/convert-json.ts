import { Injectable } from '@nestjs/common';
import { SelectItemsService } from '../select-items.service';
import { CookieService } from './../../cookie/cookie.service';

@Injectable()
export class ConvertJson {
  constructor(
    protected selectItemsService: SelectItemsService,
    protected cookieService: CookieService,
  ) {}

  async replaceVariables(data: any[]) {
    await Promise.all(
      data.map(async (item) => {
        await this.replaceInObject(item);
      }),
    );
    return data;
  }

  async replaceInObject(obj: any) {
    await Promise.all(
      Object.keys(obj).map(async (key) => {
        if (obj[key] && typeof obj[key] === 'object') {
          await this.replaceInObject(obj[key]);
        } else if (typeof obj[key] === 'string') {
          await this.replaceMatches(obj, key);
        }
      }),
    );
  }

  async replaceMatches(obj: any, key: string) {
    const matches = obj[key].match(/\${([^}]+)}/g);
    if (matches) {
      await Promise.all(
        matches.map(async (match) => {
          const variable = match.substring(2, match.length - 1);
          const convertedValue = await this.convertValue(variable);
          if (Array.isArray(convertedValue)) {
            obj[key] = convertedValue;
          } else {
            obj[key] = obj[key].replace(match, convertedValue.toString());
          }
        }),
      );
    }
  }

  async convertValue(variable: string) {
    if (variable.endsWith('years')) {
      return variable;
    } else {
      return await this.selectItemsService.getSelectItemByName(variable);
      // return await this.getVariableDataFromCookie(variable);
    }
  }

  async getVariableDataFromCookie(id: string) {
    const result = await this.cookieService.getList(id);
    return result.map((n) => ({
      name: n.value,
      id: n._id.toString().padStart(8, '0'),
    }));
  }
}
