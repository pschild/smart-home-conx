interface FuelPriceDetail {
  status: 'open' | 'closed' | 'no prices';
  e5: boolean | number;
  e10: boolean | number;
  diesel: boolean | number;
}

export interface StationPrices {
  [id: string]: FuelPriceDetail;
}