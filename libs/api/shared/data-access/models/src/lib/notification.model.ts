import { ObjectID } from 'typeorm';
import { Priority } from './enum/notification/priority.enum';

export interface NotificationModel {
  _id: ObjectID;
  createdAt: Date;
  context: string;
  reference: string; // naming: relatesTo?
  title: string;
  message: string;
  priority: Priority;
  autoRemoveAfter: Date;
}
