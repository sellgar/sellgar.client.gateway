import { IsUUID } from 'class-validator';
import { OrderLinkDto } from './order-link.dto';
export class PayLinkedOrderDto extends OrderLinkDto {
  @IsUUID()
  commandId: string;
}
