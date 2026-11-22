import { CursorQueryDto } from '@sellgar/pagination';

export interface StoreQueryInput extends Partial<CursorQueryDto> {
  search?: string;
  shopUuid?: string;
  productUuid?: string;
  categoryUuid?: string | string[];
  brandCode?: string | string[];
  productStatus?: 'active' | 'disabled' | 'archived';
  variantStatus?: 'active' | 'disabled' | 'archived';
  productShowing?: boolean;
  variantShowing?: boolean;
  quantityMin?: number;
  quantityMax?: number;
  reservedMin?: number;
  reservedMax?: number;
  availableMin?: number;
  availableMax?: number;
}
