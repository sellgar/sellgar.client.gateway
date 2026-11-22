import { Meta } from './meta';
import { PublicOfferCard } from './public-offer-card';

export interface PublicProductResult {
  items: PublicOfferCard[];
  meta: Meta;
}
