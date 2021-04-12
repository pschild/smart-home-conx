import { ObjectID } from 'typeorm';

export interface DeviceModel {
  _id: ObjectID;
  createdAt: Date;
  model: string;
  description: string;
  pioEnv: string;
  chipId: number;
}
