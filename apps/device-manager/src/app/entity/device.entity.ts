import { Column, CreateDateColumn, Entity, ObjectID, ObjectIdColumn } from 'typeorm';
import { DeviceModel } from '../model/device.model';

@Entity()
export class Device implements DeviceModel {

  @ObjectIdColumn()
  _id: ObjectID;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Column()
  model: string;

  @Column()
  description: string;

  @Column()
  pioEnv: string;

  @Column()
  chipId: number;

}
