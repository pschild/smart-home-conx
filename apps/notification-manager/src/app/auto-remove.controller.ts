import { Controller, Logger } from '@nestjs/common';
import { Client, ClientProxy, Transport } from '@nestjs/microservices';
import { Cron } from '@nestjs/schedule';
import { isDocker } from '@smart-home-conx/utils';
import { from } from 'rxjs';
import { NotificationService } from './notification/notification.service';

@Controller()
export class AutoRemoveController {

  @Client({ transport: Transport.MQTT, options: { url: isDocker() ? `mqtt://mqtt-broker:1883` : `mqtt://localhost:1883` } })
  mqttClient: ClientProxy;

  constructor(
    private readonly notificationService: NotificationService
  ) {
  }

  @Cron('5 */1 * * * *') // 5 seconds after every minute
  cron(): void {
    Logger.log(`Running cronjob for checking expired notifications ...`);
    from(this.notificationService.removeAllExpired()).subscribe(removedIds => {
      Logger.log(`Removed ${removedIds.length} notification(s).`);
      if (removedIds.length > 0) {
        this.mqttClient.emit('notification-manager/notification/removed', { removedIds: removedIds });
      }
    });
  }
}
