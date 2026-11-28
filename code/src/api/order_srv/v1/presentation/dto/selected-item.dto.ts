import { Transform } from 'class-transformer';
import { IsInt, IsString, IsUUID, Matches, Max, Min } from 'class-validator';

export class SelectedItemDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase() : value))
  @IsUUID()
  recordUuid: string;

  @IsInt()
  @Min(1)
  @Max(2147483647)
  quantity: number;
  @IsString()
  @Matches(/^[1-9]\d*$/)
  expectedItemVersion: string;
}
