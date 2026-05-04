export class CreateRequestDto {
  readonly requestTypeId: string;
  readonly requestDetails: JSON;
  readonly reason: string;
}
