import { Controller, Get, Param } from '@nestjs/common';
import { Client, ClientProxy, Ctx, MessagePattern, MqttContext, Payload, Transport } from '@nestjs/microservices';
import { NotificationContext, NotificationModelUtil } from '@smart-home-conx/api/shared/data-access/models';
import { InfluxService } from '@smart-home-conx/influx';
import { isDocker } from '@smart-home-conx/utils';

@Controller('voltage')
export class VoltageController {

  @Client({ transport: Transport.MQTT, options: { url: isDocker() ? `mqtt://mqtt-broker:1883` : `mqtt://localhost:1883` } })
  mqttClient: ClientProxy;

  constructor(
    private readonly influx: InfluxService
  ) {}

  @MessagePattern('devices/+/voltage')
  create(@Payload() payload: { value: number }, @Ctx() context: MqttContext) {
    const chipIdMatch = context.getTopic().match(/devices\/(\d+)/);
    if (!chipIdMatch) {
      throw new Error(`Could not find a chipId. Topic=${context.getTopic()}`);
    }
    const chipId = chipIdMatch[1];

    // TODO: auslagern in private Methode oder besser Service
    if (+payload.value <= 2.91) {
      this.mqttClient.emit(
        'notification-manager/notification/create',
        NotificationModelUtil.createHighPriority(NotificationContext.SENSOR, `Akkustand niedrig`, `Akku von ESP ${chipId} umgehend aufladen! Stand: ${+payload.value}V`)
      );
      this.mqttClient.emit('telegram/message', `Akku von ESP ${chipId} umgehend aufladen! Stand: ${+payload.value}V`);
    }

    this.influx.insert({ measurement: 'voltage', fields: { value: payload.value }, tags: { chipId } });
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
