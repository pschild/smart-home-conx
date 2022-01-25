import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { Client, ClientProxy, MessagePattern, Payload, Transport } from '@nestjs/microservices';
import { Interval, Timeout } from '@nestjs/schedule';
import { NotificationModelUtil, Priority } from '@smart-home-conx/api/shared/data-access/models';
import { isDocker } from '@smart-home-conx/utils';
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
  async createNotification(@Payload() payload: { context: string; title: string; message: string, priority?: Priority, autoRemoveAfter?: Date }) {
    const notification = await this.notificationService.create({
      context: payload.context,
      title: payload.title,
      message: payload.message,
      priority: payload.priority || Priority.LOW,
      autoRemoveAfter: payload.autoRemoveAfter ? new Date(payload.autoRemoveAfter) : null
    });
    this.mqttClient.emit('notification-manager/notification/created', { notification });
  }

  // @Timeout(100)
  // test(): void {
  //   this.mqttClient.emit(
  //     'notification-manager/notification/create',
  //     NotificationModelUtil.createSticky('test', `title Test-${(new Date()).toISOString()}`, `message Test-${(new Date()).toISOString()}`)
  //   );
  // }

  // @Interval(10000)
  // test1(): void {
  //   this.mqttClient.emit(
  //     'notification-manager/notification/create',
  //     NotificationModelUtil.createShort('test', `title Test-${(new Date()).toISOString()}`, `message Test-${(new Date()).toISOString()}`)
  //   );
  // }

}
