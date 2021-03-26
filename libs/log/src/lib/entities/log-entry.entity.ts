import { Column, CreateDateColumn, Entity, ObjectID, ObjectIdColumn } from 'typeorm';
import { LogEntryModel } from '../model/log-entry.model';

@Entity()
export class LogEntry implements LogEntryModel {

  @ObjectIdColumn()
  _id: ObjectID;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Column()
  origin: string;

  @Column()
  message: string;

}