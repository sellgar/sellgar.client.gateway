import { Expose, Type } from 'class-transformer';
import { IsArray, IsDefined, IsString, Matches, ValidateNested } from 'class-validator';
import { OrderItemEntity } from './order-item.entity';
import { OrderShopEntity } from './order-shop.entity';

export class OrderSnapshotEntity {
  @Expose()
  @IsDefined()
  @ValidateNested()
  @Type(() => OrderShopEntity)
  shop: OrderShopEntity;
  @Expose()
  @IsString()
  @Matches(/^[A-Z]{3}$/)
  currencyCode: string;
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemEntity)
  items: OrderItemEntity[];
  @Expose()
  @IsString()
  @Matches(/^\d+\.\d{2}$/)
  itemsTotal: string;
}
