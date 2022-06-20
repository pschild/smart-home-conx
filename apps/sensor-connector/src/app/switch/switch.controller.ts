import { Controller, Get, Param, Query } from '@nestjs/common';
import { Client, ClientProxy, Ctx, MessagePattern, MqttContext, Payload, Transport } from '@nestjs/microservices';
import { NotificationContext, NotificationModelUtil, SensorModel, SensorType, SwitchSensorDetailModel } from '@smart-home-conx/api/shared/data-access/models';
import { InfluxService } from '@smart-home-conx/influx';
import { isDocker } from '@smart-home-conx/utils';

@Controller('switch')
export class SwitchController {

  @Client({ transport: Transport.MQTT, options: { url: isDocker() ? `mqtt://mqtt-broker:1883` : `mqtt://localhost:1883` } })
  mqttClient: ClientProxy;

  @Client({ transport: Transport.TCP, options: { host: isDocker() ? 'device-manager' : 'localhost' } })
  deviceClient: ClientProxy;

  constructor(
    private readonly influx: InfluxService
  ) {}

  @MessagePattern('devices/+/switch')
  async create(@Payload() payload: { switchId: string; value: string; pin?: number }, @Ctx() context: MqttContext) {
    const chipIdMatch = context.getTopic().match(/devices\/(\d+)/);
    if (!chipIdMatch) {
      throw new Error(`Could not find a chipId. Topic=${context.getTopic()}`);
    }
    const chipId = +chipIdMatch[1];

    const sensor = await this.deviceClient.send<SensorModel>('findSensor', { chipId, type: SensorType.SWITCH, pin: +payload.pin }).toPromise();
    const details = sensor.details as SwitchSensorDetailModel;
    const warningEnabled = details?.warningEnabled;
    const warningCriteria = details?.warningCriteria;

    if (warningEnabled) {
      /**
       * 1 = Schalter ist geschlossen
       * 0 = Schalter ist geoeffnet
       * Achtung: Je nach Anwendungsfalls und Positionierung des Schalters kann sich die Logik umdrehen.
       */
      // TODO: Logik erweitern: Notification nur dann senden wenn vorheriger Status geschlossen und neuer Status offen. Ggf. `triggeredByChange` mit einbeziehen.
      // this.influx.findOne(`select * from switch where chipId = '${chipId}' AND pin = ${payload.pin || -1} order by time desc limit 1`);

      if (
        (+payload.value === 1 && warningCriteria === 'CLOSED')
        || (+payload.value === 0 && warningCriteria === 'OPENED')
      ) {
        const notificationMessage = this.createNotificationMessage(warningCriteria, sensor.name);
        this.mqttClient.emit(
          'notification-manager/notification/create',
          NotificationModelUtil.createHighPriority(NotificationContext.SENSOR, `Schalter`, notificationMessage)
        );
        this.mqttClient.emit('telegram/message', notificationMessage);
      }
    }

    this.influx.insert({ measurement: 'switch', fields: { switchId: payload.switchId, value: +payload.value, pin: +payload.pin || -1 }, tags: { chipId: chipId.toString() } });
  }

  private createNotificationMessage(warningCriteria: 'OPENED' | 'CLOSED', name: string): string {
    return warningCriteria === 'OPENED'
      ? `${name} ist geöffnet worden`
      : `${name} ist geschlossen worden`;
  }

  @Get(':chipId/history')
  getHistory(@Param('chipId') chipId: string, @Query('pin') pin: number) {
    if (!pin) {
      pin = -1;
    }
    return this.influx.find(`select * from switch where time > now() - 1d AND chipId = '${chipId}' AND pin = ${pin}`);
  }

  @Get(':chipId/latest')
  getLatest(@Param('chipId') chipId: string, @Query('pin') pin: number) {
    return this.influx.findOne(`select * from switch where chipId = '${chipId}' AND pin = ${pin} order by time desc limit 1`);
  }

}
