import { ObjectID } from 'typeorm';

export interface StationDetailModel {
  _id: ObjectID;
  updatedAt: Date;
  id: string;
  name: string;
  brand: string;
  street: string;
  houseNumber: string;
  postCode: number;
  place: string;
  lat: number;
  lng: number;
}
