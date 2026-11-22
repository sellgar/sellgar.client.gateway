import { Meta } from './meta';
import { StoreOfferEntity } from './store-offer-entity';

export interface StoreOfferResult {
  items: StoreOfferEntity[];
  meta: Meta;
}
