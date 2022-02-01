import { Column, CreateDateColumn, Entity, ObjectID, ObjectIdColumn } from 'typeorm';
import { NotificationModel, Priority } from '@smart-home-conx/api/shared/data-access/models';

@Entity()
export class Notification implements NotificationModel {

  @ObjectIdColumn()
  _id: ObjectID;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Column()
  context: string;

  @Column()
  reference: string;

  @Column()
  title: string;

  @Column()
  message: string;

  @Column({ type: 'enum', enum: Priority })
  priority: Priority;

  @Column({ type: 'timestamp' })
  autoRemoveAfter: Date;

}
