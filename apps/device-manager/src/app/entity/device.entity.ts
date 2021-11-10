import { Column, CreateDateColumn, Entity, ObjectID, ObjectIdColumn } from 'typeorm';
import { DeviceModel, ConnectionStatus } from '@smart-home-conx/api/shared/data-access/models';

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
  firmware: string;

  @Column()
  chipId: number;

  @Column()
  place: string;

  @Column()
  batteryPowered: boolean;

  @Column({ type: 'enum', enum: ConnectionStatus })
  connectionStatus: ConnectionStatus;

  @Column({ type: 'timestamp' })
  connectionStatusChangedAt: Date;

  @Column({ type: 'timestamp' })
  lastPing: Date;

}
