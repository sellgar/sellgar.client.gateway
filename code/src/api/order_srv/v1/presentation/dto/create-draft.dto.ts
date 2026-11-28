import { Transform, Type } from 'class-transformer';
import { ArrayMinSize, ArrayUnique, IsArray, IsUUID, ValidateNested } from 'class-validator';

import { SelectedItemDto } from './selected-item.dto';

export class CreateDraftDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase() : value))
  @IsUUID()
  commandId: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase() : value))
  @IsUUID()
  cartUuid: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique((item: SelectedItemDto) => item.recordUuid)
  @ValidateNested({ each: true })
  @Type(() => SelectedItemDto)
  items: SelectedItemDto[];
}
