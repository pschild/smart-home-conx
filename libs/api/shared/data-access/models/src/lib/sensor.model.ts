import { ObjectID } from 'typeorm';
import { SensorType } from './enum';

export interface SensorModel {
  _id: ObjectID;
  createdAt: Date;
  type: SensorType;
  chipId: number;
  roomId: string;
  pin: number;
  position: { x: number; y: number };
}
