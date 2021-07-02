import { ObjectID } from 'typeorm';
import { SensorModel } from './sensor.model';

export interface RoomModel {
  _id: ObjectID;
  createdAt: Date;
  name: string;
  width: number;
  height: number;
  position: { x: number; y: number };
}
