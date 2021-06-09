import { ObjectID } from 'typeorm';
import { SensorModel } from './sensor.model';

export interface RoomModel {
  _id: ObjectID;
  createdAt: Date;
  name: string;
  sensors: { sensorId: string; sensor?: SensorModel; position: { x: number; y: number } }[];
  width: number;
  height: number;
  position: { x: number; y: number };
}
