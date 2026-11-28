import { Expose, Type } from 'class-transformer';
import { IsDefined, IsString, Matches, ValidateNested } from 'class-validator';
import { OrderEntity } from './order.entity';

export class OrderConfirmationEntity {
  @Expose()
  @IsDefined()
  @ValidateNested()
  @Type(() => OrderEntity)
  order: OrderEntity;
  @Expose()
  @IsString()
  @Matches(/^[A-Za-z0-9_-]{43}$/)
  accessToken: string;
}
