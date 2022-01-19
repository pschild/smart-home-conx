import { ObjectID } from 'typeorm';
import { ConnectionStatus } from './enum';

export interface DeviceModel {
  _id: ObjectID;
  createdAt: Date;
  model: string;
  description: string;
  pioEnv: string;
  firmware: string;
  chipId: number;
  place: string;
  batteryPowered: boolean;
  expectedPingInterval: number;
  connectionStatus: ConnectionStatus;
  connectionStatusChangedAt: Date;
  lastPing: Date;
}
