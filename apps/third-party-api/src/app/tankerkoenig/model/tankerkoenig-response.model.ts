import { StationPrices } from "@smart-home-conx/api/shared/data-access/models";

export interface Station {
  id: string;
  name: string;
  brand: string;
  street: string;
  houseNumber: string;
  postCode: number;
  place: string;
  lat: number;
  lng: number;
  dist: number;
  price: number;
  isOpen: true;
}

interface OpeningTimes {
  openingTimes: { text: string; start: string; end: string; }[];
  wholeDay: boolean;
}

interface FuelPrices {
  e5: number;
  e10: number;
  diesel: number;
}

export type StationDetail = Station & OpeningTimes & FuelPrices;

export interface TankerkoenigErrorResponse {
  status: 'error';
  ok: false;
  message: string;
}

export interface TankerkoenigSuccessResponse {
  ok: true;
  license: string;
  data: string;
}

export interface DetailResponse extends TankerkoenigSuccessResponse {
  station: StationDetail;
}

export interface ListResponse extends TankerkoenigSuccessResponse {
  stations: Station[];
}

export interface PricesResponse extends TankerkoenigSuccessResponse {
  prices: StationPrices;
}
