import { RoomModel } from '@smart-home-conx/api/shared/data-access/models';
import { Column, CreateDateColumn, Entity, ObjectID, ObjectIdColumn } from 'typeorm';
import { Sensor } from './sensor.entity';

@Entity()
export class Room implements RoomModel {

  @ObjectIdColumn()
  _id: ObjectID;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Column()
  name: string;

  @Column()
  sensors: { sensorId: string; sensor?: Sensor; position: { x: number; y: number } }[];

  @Column()
  width: number;

  @Column()
  height: number;

  @Column()
  position: { x: number; y: number };

}

