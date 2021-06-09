import { ObjectID } from 'typeorm';
import { SensorType } from './enum';

export interface SensorModel {
  _id: ObjectID;
  createdAt: Date;
  type: SensorType;
  deviceId: string;
}
