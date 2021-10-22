import { ObjectID } from 'typeorm';

export interface RoomModel {
  _id: ObjectID;
  createdAt: Date;
  name: string;
  width: number;
  height: number;
  position: { x: number; y: number };
}
