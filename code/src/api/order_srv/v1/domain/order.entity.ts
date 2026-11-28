import { Expose, Type } from 'class-transformer';
import {
  Equals,
  IsDateString,
  IsDefined,
  IsEmail,
  IsIn,
  IsString,
  IsUUID,
  Matches,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { OrderSnapshotEntity } from './order-snapshot.entity';

export class OrderEntity {
  @Expose()
  @IsUUID()
  uuid: string;
  @Expose()
  @IsString()
  @Matches(/^[1-9]\d*$/)
  version: string;
  @Expose()
  @IsIn(['draft', 'confirming', 'rejecting', 'rejected', 'ready', 'processing', 'paid', 'expiring', 'expired'])
  status: string;
  @Expose()
  @Equals(1)
  snapshotVersion: number;
  @Expose()
  @IsDefined()
  @ValidateNested()
  @Type(() => OrderSnapshotEntity)
  snapshot: OrderSnapshotEntity;
  @Expose()
  @ValidateIf((_object, value) => value !== null)
  @IsEmail()
  email: string | null;
  @Expose()
  @ValidateIf((_object, value) => value !== null)
  @IsUUID()
  paymentUuid: string | null;
  @Expose()
  @ValidateIf((_object, value) => value !== null)
  @IsString()
  paymentProvider: string | null;
  @Expose()
  @ValidateIf((_object, value) => value !== null)
  @IsDateString()
  paymentDueAt: string | null;
  @Expose()
  @ValidateIf((_object, value) => value !== null)
  @IsString()
  failureCode: string | null;
  @Expose()
  @IsDateString()
  createdAt: string;
  @Expose()
  @IsDateString()
  updatedAt: string;
}
