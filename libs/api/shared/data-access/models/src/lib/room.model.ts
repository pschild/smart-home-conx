import { ObjectID } from 'typeorm';
import { FloorType } from '..';

export interface RoomModel {
  _id: ObjectID;
  createdAt: Date;
  name: string;
  width: number;
  height: number;
  floor: FloorType;
  position: { x: number; y: number };
}
