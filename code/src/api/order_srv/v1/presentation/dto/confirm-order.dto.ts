import { Transform } from 'class-transformer';
import { IsEmail, MaxLength } from 'class-validator';
import { OrderCommandDto } from './order-command.dto';
export class ConfirmOrderDto extends OrderCommandDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsEmail()
  @MaxLength(254)
  email: string;
}
