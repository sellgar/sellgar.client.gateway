import { IsUUID } from 'class-validator';
export class OrderCommandDto {
  @IsUUID()
  commandId: string;
}
