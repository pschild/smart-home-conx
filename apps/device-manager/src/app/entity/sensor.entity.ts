import { Column, CreateDateColumn, Entity, ObjectID, ObjectIdColumn } from 'typeorm';
import { SensorDetailModel, SensorModel, SensorType } from '@smart-home-conx/api/shared/data-access/models';

@Entity()
export class Sensor implements SensorModel {

  @ObjectIdColumn()
  _id: ObjectID;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Column({ type: 'enum', enum: SensorType })
  type: SensorType;

  @Column()
  name: string;

  @Column()
  chipId: number;

  @Column()
  roomId: string;

  @Column()
  pin: number;

  @Column()
  position: { x: number; y: number };

  @Column()
  details: SensorDetailModel;

}