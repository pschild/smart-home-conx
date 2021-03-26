import { ObjectID } from 'typeorm';

export interface LogEntryModel {
  _id: ObjectID;
  createdAt: Date;
  origin: string;
  message: string;
}
