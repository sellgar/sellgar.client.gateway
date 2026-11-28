import { IsString, IsUUID, Matches } from 'class-validator';
export class OrderLinkDto {
  @IsUUID()
  orderUuid: string;
  @IsString()
  @Matches(/^[A-Za-z0-9_-]{43}$/)
  accessToken: string;
}
