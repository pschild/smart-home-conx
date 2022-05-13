import { ObjectID } from 'typeorm';
import { SensorType } from './enum';

export interface SensorModel {
  _id: ObjectID;
  createdAt: Date;
  type: SensorType;
  name: string;
  chipId: number;
  roomId: string;
  pin: number;
  position: { x: number; y: number };
  details: SensorDetailModel;
}

export interface TemperatureSensorDetailModel {
  aberrance: number;
  warningEnabled: boolean;
  warningCriteria: 'GREATER' | 'LOWER';
  warningLimit: number;
}

export interface HumiditySensorDetailModel {
  aberrance: number;
  warningEnabled: boolean;
  warningCriteria: 'GREATER' | 'LOWER';
  warningLimit: number;
}

export interface VoltageSensorDetailModel {
  warningEnabled: boolean;
  warningCriteria: 'GREATER' | 'LOWER';
  warningLimit: number;
}

export interface MovementSensorDetailModel {
  lockTime: number;
  warningEnabled: boolean;
}

export interface SwitchSensorDetailModel {
  warningEnabled: boolean;
  warningCriteria: 'OPENED' | 'CLOSED';
}

export type SensorDetailModel =
  TemperatureSensorDetailModel
  | HumiditySensorDetailModel
  | VoltageSensorDetailModel
  | MovementSensorDetailModel
  | SwitchSensorDetailModel
;