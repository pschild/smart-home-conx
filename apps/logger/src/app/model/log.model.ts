import { ObjectID } from 'typeorm';

export interface LogModel {
  _id: ObjectID;
  createdAt: Date;
  source: string;
  message: string;
}
