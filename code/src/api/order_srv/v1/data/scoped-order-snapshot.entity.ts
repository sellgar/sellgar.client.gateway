import { Expose } from 'class-transformer';
import { IsUUID } from 'class-validator';
import { OrderSnapshotEntity } from '../domain/order-snapshot.entity';

export class ScopedOrderSnapshotEntity extends OrderSnapshotEntity {
  @Expose()
  @IsUUID()
  ownerUuid: string;
}
