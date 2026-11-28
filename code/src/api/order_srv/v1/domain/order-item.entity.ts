import { Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsDefined,
  IsInt,
  ValidateIf,
  IsString,
  IsUUID,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

import { OrderPriceEntity } from './order-price.entity';

export class OrderItemEntity {
  @Expose()
  @IsUUID()
  recordUuid: string;
  @Expose()
  @IsUUID()
  offerUuid: string;
  @Expose()
  @IsUUID()
  productUuid: string;
  @Expose()
  @IsUUID()
  variantUuid: string;
  @Expose()
  @IsString()
  productName: string;
  @Expose()
  @IsString()
  variantName: string;
  @Expose()
  @ValidateIf((_object, value) => value !== null)
  @IsString()
  article: string | null;
  @Expose()
  @IsArray()
  @IsString({ each: true })
  clarifications: string[];
  @Expose()
  @ValidateIf((_object, value) => value !== null)
  @IsUUID()
  imageUuid: string | null;
  @Expose()
  @IsInt()
  @Min(1)
  @Max(2147483647)
  quantity: number;
  @Expose()
  @IsDefined()
  @ValidateNested()
  @Type(() => OrderPriceEntity)
  unitPrice: OrderPriceEntity;
  @Expose()
  @IsString()
  @Matches(/^\d+\.\d{2}$/)
  subtotal: string;
}
