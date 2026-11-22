import { Expose, Transform } from 'class-transformer';
import { IsOptional, IsString, IsUUID, MaxLength, MinLength, ValidateIf } from 'class-validator';

export class ProductsQueryDto {
  @Expose()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString()
  @MaxLength(256)
  search?: string;

  @Expose()
  @ValidateIf((_object, value) => value !== undefined)
  @IsUUID(undefined, { each: true })
  categoryUuid?: string | string[];

  @Expose()
  @ValidateIf((_object, value) => value !== undefined)
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @MaxLength(256, { each: true })
  brandCode?: string | string[];
}
