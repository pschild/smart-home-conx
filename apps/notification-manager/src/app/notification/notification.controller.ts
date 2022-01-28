import { Body, Controller, Delete, Get, Logger, Param, Patch, Post } from '@nestjs/common';
import { Client, ClientProxy, MessagePattern, Payload, Transport } from '@nestjs/microservices';
import { Interval, Timeout } from '@nestjs/schedule';
import { NotificationModelUtil, Priority } from '@smart-home-conx/api/shared/data-access/models';
import { isDocker } from '@smart-home-conx/utils';
import { addHours } from 'date-fns';
import { from } from 'rxjs';
import { filter, mergeMap, tap } from 'rxjs/operators';
import { CreateNotificationDto, UpdateNotificationDto } from './dto';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {

  @Client({ transport: Transport.MQTT, options: { url: isDocker() ? `mqtt://mqtt-broker:1883` : `mqtt://localhost:1883` } })
  mqttClient: ClientProxy;

  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.create(createNotificationDto);
  }

  @Get(':id')
  findOne(@Param('id') notificationId: string) {
    return this.notificationService.findOne(notificationId);
  }

  @Get()
  findAll() {
    return this.notificationService.findAll();
  }

  @Patch(':id')
  update(@Param('id') notificationId: string, @Body() updateNotificationDto: UpdateNotificationDto) {
    return this.notificationService.update(notificationId, updateNotificationDto);
  }

  @Delete(':id')
  remove(@Param('id') notificationId: string) {
    return this.notificationService.remove(notificationId);
  }

  @Delete()
  removeAll() {
    return this.notificationService.removeAll();
  }

  @MessagePattern('notification-manager/notification/create')
  createNotification(@Payload() payload: { context: string; title: string; message: string, priority?: Priority, autoRemoveAfter?: Date }) {
    return from(this.notificationService.findByCriteria(payload)).pipe(
      tap(found => found && Logger.warn(`Found notification with id ${found._id} attributes: ${JSON.stringify(payload)}. Skipping creation.`)),
      filter(found => !found),
      mergeMap(() => from(this.notificationService.create({
        context: payload.context,
        title: payload.title,
        message: payload.message,
        priority: payload.priority || Priority.LOW,
        autoRemoveAfter: payload.autoRemoveAfter ? new Date(payload.autoRemoveAfter) : null
      }))),
      tap(notification => this.mqttClient.emit('notification-manager/notification/created', { notification }))
    );
  }

  // @Timeout(100)
  // test(): void {
  //   this.mqttClient.emit('notification-manager/notification/create', NotificationModelUtil.create('test', `title Test-${(new Date()).toISOString()}`, `message Test-${(new Date()).toISOString()}`, Priority.LOW, addHours(new Date(), 1)));
  //   setTimeout(() => this.mqttClient.emit('notification-manager/notification/create', NotificationModelUtil.create('test', `title Test-${(new Date()).toISOString()}`, `message Test-${(new Date()).toISOString()}`, Priority.LOW, addHours(new Date(), 1))), 2000);
  //   setTimeout(() => this.mqttClient.emit('notification-manager/notification/create', NotificationModelUtil.create('test', `title Test-${(new Date()).toISOString()}`, `message Test-${(new Date()).toISOString()}`, Priority.MEDIUM, addHours(new Date(), 1))), 4000);
  //   setTimeout(() => this.mqttClient.emit('notification-manager/notification/create', NotificationModelUtil.create('test', `title Test-${(new Date()).toISOString()}`, `message Test-${(new Date()).toISOString()}`, Priority.HIGH, addHours(new Date(), 3))), 6000);
  // }

  // @Interval(10000)
  // test1(): void {
  //   this.mqttClient.emit(
  //     'notification-manager/notification/create',
  //     NotificationModelUtil.createShort('test', `title Test-${(new Date()).toISOString()}`, `message Test-${(new Date()).toISOString()}`)
  //   );
  // }

}
