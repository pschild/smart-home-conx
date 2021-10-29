import { FloorType, RoomModel } from '@smart-home-conx/api/shared/data-access/models';
import { Column, CreateDateColumn, Entity, ObjectID, ObjectIdColumn } from 'typeorm';

@Entity()
export class Room implements RoomModel {

  @ObjectIdColumn()
  _id: ObjectID;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Column()
  name: string;

  @Column()
  width: number;

  @Column()
  height: number;

  @Column()
  floor: FloorType;

  @Column()
  position: { x: number; y: number };

}

