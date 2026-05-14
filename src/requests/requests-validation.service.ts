import { BadRequestException, Injectable } from '@nestjs/common';
import { FileValidationService } from '../files/files-validation.service';
import { RequestsStagesService } from './../requests-stages/requests-stages.service';
import { CreateRequestDto } from './dto/create-request.dto';

@Injectable()
export class RequestsValidationService {
  constructor(
    protected requestsStagesService: RequestsStagesService,
    protected fileValidationService: FileValidationService,
  ) {}

  public isValidIdentity(identity: string): boolean {
    if (identity.length > 9 || identity.length < 5) return false;
    identity = identity.length < 9 ? ('0000' + identity).slice(-9) : identity;
    return (
      Array.from(identity, Number).reduce((counter, digit, i) => {
        const step = digit * ((i % 2) + 1);
        return counter + (step > 9 ? step - 9 : step);
      }) %
        10 ===
      0
    );
  }

  public async isValid(requestDTO: CreateRequestDto) {
    const { requestTypeId, reason, requestDetails } = requestDTO;
    try {
      const stages = await this.requestsStagesService.getSchema(
        requestTypeId,
        reason,
      );

      const schema = this.getSchema(stages);

      const missingMessage = this.missingFields(schema, requestDetails);
      if (missingMessage) return missingMessage;

      const invalidMessage = await this.invalidFields(schema, requestDetails);
      if (invalidMessage) return invalidMessage;

      const dependendMessage = this.dependendFields(schema, requestDetails);
      if (dependendMessage) return dependendMessage;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  protected missingFields(schema, requestDetails) {
    const missingFields = schema.required?.filter(
      (field) => requestDetails[field] === undefined,
    );
    return missingFields.length > 0
      ? `Missing required field: ${missingFields.join(', ')}`
      : null;
  }

  protected async invalidFields(schema, requestDetails) {
    const invalidFields = [];
    await Promise.all(
      schema.properties?.map(async (prop) => {
        const name = Object.keys(prop)[0];
        const schemaType = prop[name].type;
        const value = requestDetails[name]?.value ?? requestDetails[name];
        const detailType = typeof value;

        if (this.isInvalidType(value, schemaType, detailType)) {
          invalidFields.push(name);
        }
        if (
          prop[name].pattern &&
          !this.validateRegex(requestDetails[name], prop[name].pattern)
        ) {
          invalidFields.push(name);
        }
        if (detailType === 'object') {
          const invalid = await this.validateFileType(value, prop[name]);
          if (invalid) {
            invalidFields.push(invalid);
          }
        }
      }),
    );

    return invalidFields.length > 0
      ? `${invalidFields.join(', ')} is invalid type`
      : null;
  }

  protected dependendFields(schema, requestDetails) {
    const dependendFields = [];
    schema.dependencies?.map((dep) => {
      const name = Object.keys(dep)[0];
      const dependence = dep[name];
      if (requestDetails[name]) {
        const isArray = Array.isArray(dependence);
        const condition = isArray
          ? dependence.find((d) => requestDetails[d]) === undefined
          : dependence.not.required.find((d) => requestDetails[d]) !==
            undefined;
        if (condition) {
          dependendFields.push(name);
        }
      }
    });
    return dependendFields.length > 0
      ? `Missing depend field of ${dependendFields.join(', ')}`
      : null;
  }

  protected async validateFileType(details, prop) {
    if (prop.layout.props.types) {
      const types = prop.layout.props.types.split(',');
      for (const detail of details) {
        const mime = await this.fileValidationService.getMimeType(
          detail.content,
        );
        if (!(types.includes(detail.type) && mime === detail.type)) {
          return `${detail.name}.${detail.type}`;
        }
      }
    }
  }

  protected validateRegex(detail, pattern) {
    const regex: RegExp = new RegExp(pattern);
    return regex.test(detail);
  }

  protected getSchema(stages) {
    const schema = { required: [], properties: [], dependencies: [] };
    stages.forEach((stage) => {
      if (stage.schema.required) {
        schema.required.push(...Array.from(stage.schema.required));
      }
      if (stage.schema.properties) {
        schema.properties.push(...this.convertObject(stage.schema.properties));
      }
      if (stage.schema.dependencies) {
        schema.dependencies.push(
          ...this.convertObject(stage.schema.dependencies),
        );
      }
    });
    return schema;
  }

  protected convertObject(array) {
    return Object.entries(array).map(([key, value]) => ({ [key]: value }));
  }

  protected isInvalidType(field, schemaType, detailType): boolean {
    return (
      field &&
      ((schemaType === 'array' && detailType !== 'object') ||
        (detailType !== 'object' &&
          detailType !== schemaType &&
          schemaType !== 'object') ||
        (schemaType === 'object' && detailType !== 'string'))
    );
  }
}
