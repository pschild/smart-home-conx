import { Controller, Get, Param, Query } from '@nestjs/common';
import { Client, ClientProxy, Ctx, MessagePattern, MqttContext, Payload, Transport } from '@nestjs/microservices';
import { HumiditySensorDetailModel, NotificationContext, NotificationModelUtil, SensorModel, SensorType } from '@smart-home-conx/api/shared/data-access/models';
import { InfluxService } from '@smart-home-conx/influx';
import { isDocker } from '@smart-home-conx/utils';

@Controller('humidity')
export class HumiditySensorController {

  @Client({ transport: Transport.MQTT, options: { url: isDocker() ? `mqtt://mqtt-broker:1883` : `mqtt://localhost:1883` } })
  mqttClient: ClientProxy;

  @Client({ transport: Transport.TCP, options: { host: isDocker() ? 'device-manager' : 'localhost' } })
  deviceClient: ClientProxy;

  constructor(
    private readonly influx: InfluxService
  ) {}

  @MessagePattern('devices/+/humidity')
  async create(@Payload() payload: { value: number; pin?: number }, @Ctx() context: MqttContext) {
    const chipIdMatch = context.getTopic().match(/devices\/(\d+)/);
    if (!chipIdMatch) {
      throw new Error(`Could not find a chipId. Topic=${context.getTopic()}`);
    }
    const chipId = +chipIdMatch[1];

    const sensor = await this.deviceClient.send<SensorModel>('findSensor', { chipId, type: SensorType.HUMIDITY, pin: +payload.pin }).toPromise();
    const details = sensor.details as HumiditySensorDetailModel;
    const aberrance = details?.aberrance || 0;
    const warningEnabled = details?.warningEnabled;
    const warningCriteria = details?.warningCriteria;
    const warningLimit = details?.warningLimit;

    const correctedValue = payload.value + aberrance;
    this.mqttClient.emit(`sensor-connector/devices/${chipId}/humidity/corrected`, { value: correctedValue });

    if (warningEnabled) {
      if (
        (warningCriteria === 'GREATER' && +payload.value > warningLimit)
        || (warningCriteria === 'LOWER' && +payload.value < warningLimit)
      ) {
        const notificationMessage = this.createNotificationMessage(+payload.value, details, sensor.name);
        this.mqttClient.emit(
          'notification-manager/notification/create',
          NotificationModelUtil.createHighPriority(NotificationContext.SENSOR, `Luftfeuchtigkeit`, notificationMessage)
        );
        this.mqttClient.emit('telegram/message', notificationMessage);
      }
    }

    this.influx.insert({ measurement: 'humidity', fields: { value: correctedValue, raw: payload.value, pin: +payload.pin || -1 }, tags: { chipId: chipId.toString() } });
  }

  private createNotificationMessage(value: number, details: HumiditySensorDetailModel, name: string): string {
    return details.warningCriteria === 'GREATER'
      ? `Luftfeuchtigkeit zu hoch: ${value}%/${details.warningLimit}% (${name || '-'})`
      : `Luftfeuchtigkeit zu niedrig: ${value}%/${details.warningLimit}% (${name || '-'})`;
  }

  @Get(':chipId/history')
  getHistory(@Param('chipId') chipId: string, @Query('pin') pin: number) {
    if (!pin) {
      pin = -1;
    }
    return this.influx.find(`select * from humidity where time > now() - 1d AND chipId = '${chipId}' AND pin = ${pin}`);
  }

  @Get(':chipId/latest')
  getLatest(@Param('chipId') chipId: string, @Query('pin') pin: number) {
    return this.influx.findOne(`select * from humidity where chipId = '${chipId}' AND pin = ${pin} order by time desc limit 1`);
  }

}
