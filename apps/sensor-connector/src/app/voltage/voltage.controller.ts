import { Controller, Get, Param } from '@nestjs/common';
import { Client, ClientProxy, Ctx, MessagePattern, MqttContext, Payload, Transport } from '@nestjs/microservices';
import { NotificationContext, NotificationModelUtil, SensorModel, SensorType, VoltageSensorDetailModel } from '@smart-home-conx/api/shared/data-access/models';
import { InfluxService } from '@smart-home-conx/influx';
import { isDocker } from '@smart-home-conx/utils';

@Controller('voltage')
export class VoltageController {

  @Client({ transport: Transport.MQTT, options: { url: isDocker() ? `mqtt://mqtt-broker:1883` : `mqtt://localhost:1883` } })
  mqttClient: ClientProxy;

  @Client({ transport: Transport.TCP, options: { host: isDocker() ? 'device-manager' : 'localhost' } })
  deviceClient: ClientProxy;

  constructor(
    private readonly influx: InfluxService
  ) {}

  @MessagePattern('devices/+/voltage')
  async create(@Payload() payload: { value: number }, @Ctx() context: MqttContext) {
    const chipIdMatch = context.getTopic().match(/devices\/(\d+)/);
    if (!chipIdMatch) {
      throw new Error(`Could not find a chipId. Topic=${context.getTopic()}`);
    }
    const chipId = +chipIdMatch[1];

    const sensor = await this.deviceClient.send<SensorModel>('findSensor', { chipId, type: SensorType.VOLTAGE }).toPromise();
    const details = sensor.details as VoltageSensorDetailModel;
    const warningEnabled = details?.warningEnabled;
    const warningCriteria = details?.warningCriteria;
    const warningLimit = details?.warningLimit;

    if (warningEnabled) {
      if (
        (warningCriteria === 'GREATER' && +payload.value > warningLimit)
        || (warningCriteria === 'LOWER' && +payload.value < warningLimit)
      ) {
        const notificationMessage = this.createNotificationMessage(+payload.value, details, sensor.name, chipId);
        this.mqttClient.emit(
          'notification-manager/notification/create',
          NotificationModelUtil.createHighPriority(NotificationContext.SENSOR, `Akkustand`, notificationMessage)
        );
        this.mqttClient.emit('telegram/message', notificationMessage);
      }
    }

    this.influx.insert({ measurement: 'voltage', fields: { value: payload.value }, tags: { chipId: chipId.toString() } });
  }

  private createNotificationMessage(value: number, details: VoltageSensorDetailModel, name: string, chipId: number): string {
    return details.warningCriteria === 'GREATER'
      ? `Spannung zu hoch: ${value}V/${details.warningLimit}V (ESP ${chipId}, ${name || '-'})`
      : `Spannung zu niedrig: ${value}V/${details.warningLimit}V (ESP ${chipId}, ${name || '-'})`;
  }

  @Get(':chipId/history')
  getHistory(@Param('chipId') chipId: string) {
    return this.influx.find(`select * from voltage where time > now() - 1d AND chipId = '${chipId}'`);
  }

  @Get(':chipId/latest')
  getLatest(@Param('chipId') chipId: string) {
    return this.influx.findOne(`select * from voltage where chipId = '${chipId}' order by time desc limit 1`);
  }

}
