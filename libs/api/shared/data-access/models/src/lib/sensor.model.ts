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
  details: SensorDetailModel;
}

export interface TemperatureSensorDetailModel {
  aberrance: number;
}

export interface HumiditySensorDetailModel {
  aberrance: number;
}

export interface MovementSensorDetailModel {
  lockTime: number;
}

export type SensorDetailModel = TemperatureSensorDetailModel | HumiditySensorDetailModel | MovementSensorDetailModel;