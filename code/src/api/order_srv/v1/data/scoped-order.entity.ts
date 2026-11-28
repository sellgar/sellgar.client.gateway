import { Expose, Type } from 'class-transformer';
import { IsDefined, ValidateNested } from 'class-validator';
import { OrderEntity } from '../domain/order.entity';
import { ScopedOrderSnapshotEntity } from './scoped-order-snapshot.entity';

export class ScopedOrderEntity extends OrderEntity {
  @Expose()
  @IsDefined()
  @ValidateNested()
  @Type(() => ScopedOrderSnapshotEntity)
  declare snapshot: ScopedOrderSnapshotEntity;
}
