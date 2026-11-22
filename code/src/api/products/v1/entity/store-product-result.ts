import { Meta } from './meta';
import { StoreProductEntity } from './store-product-entity';

export interface StoreProductResult {
  items: StoreProductEntity[];
  meta: Meta;
}
