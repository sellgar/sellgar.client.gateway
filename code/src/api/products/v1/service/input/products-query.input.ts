import { CursorQueryDto } from '@sellgar/pagination';

export interface ProductsQueryInput extends Partial<CursorQueryDto> {
  search?: string;
  categoryUuid?: string | string[];
  brandCode?: string | string[];
}
