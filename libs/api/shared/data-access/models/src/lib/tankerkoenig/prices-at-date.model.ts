import { StationPrices } from './station-prices.model';

export interface PricesAtDate {
  datetime: Date;
  prices: StationPrices;
}
