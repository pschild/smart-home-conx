import { Injectable } from '@nestjs/common';
import { DeleteResult, MongoRepository, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from './entity/notification.entity';
import { CreateNotificationDto, UpdateNotificationDto } from './dto';

@Injectable()
export class NotificationService {

  constructor(
    @InjectRepository(Notification) private repository: MongoRepository<Notification>
  ) {}

  create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    return this.repository.save(createNotificationDto);
  }

  findAll(): Promise<Notification[]> {
    return this.repository.find();
  }

  findOne(notificationId: string): Promise<Notification> {
    return this.repository.findOne(notificationId);
  }

  findByCriteria(criteria: Partial<Notification>): Promise<Notification> {
    const { context, title, message, priority } = criteria;
    return this.repository.findOne({ where: { context, title, message, priority } });
  }

  update(notificationId: string, updateNotificationDto: UpdateNotificationDto): Promise<UpdateResult> {
    return this.repository.update(notificationId, updateNotificationDto);
  }

  remove(notificationId: string): Promise<DeleteResult> {
    return this.repository.delete(notificationId);
  }

  removeAll(): Promise<void> {
    return this.repository.clear();
  }

  async removeAllExpired(): Promise<string[]> {
    const expiredNotifications = await this.repository.find({ where: { autoRemoveAfter: { '$lte': new Date() } } });
    const expiredNotificationIds = expiredNotifications.map(n => n._id.toString());
    await this.repository.remove([...expiredNotifications]);
    return expiredNotificationIds;
  }

}
