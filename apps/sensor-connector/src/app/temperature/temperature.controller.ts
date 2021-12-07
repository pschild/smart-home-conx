import { Controller, Get, Param, Query } from '@nestjs/common';
import { Client, ClientProxy, Ctx, MessagePattern, MqttContext, Payload, Transport } from '@nestjs/microservices';
import { SensorModel, SensorType, TemperatureSensorDetailModel } from '@smart-home-conx/api/shared/data-access/models';
import { InfluxService } from '@smart-home-conx/influx';
import { isDocker } from '@smart-home-conx/utils';

@Controller('temperature')
export class TemperatureSensorController {

  @Client({ transport: Transport.MQTT, options: { url: isDocker() ? `mqtt://mqtt-broker:1883` : `mqtt://localhost:1883` } })
  mqttClient: ClientProxy;

  @Client({ transport: Transport.TCP, options: { host: isDocker() ? 'device-manager' : 'localhost' } })
  deviceClient: ClientProxy;

  constructor(
    private readonly influx: InfluxService
  ) {}

  @MessagePattern('devices/+/temperature')
  async create(@Payload() payload: { value: number; pin?: number }, @Ctx() context: MqttContext) {
    const chipIdMatch = context.getTopic().match(/devices\/(\d+)/);
    if (!chipIdMatch) {
      throw new Error(`Could not find a chipId. Topic=${context.getTopic()}`);
    }
    const chipId = +chipIdMatch[1];

    const sensor = await this.deviceClient.send<SensorModel>('findSensor', { chipId, type: SensorType.TEMPERATURE, pin: payload.pin }).toPromise();
    const aberrance = (sensor.details as TemperatureSensorDetailModel)?.aberrance || 0;
    const correctedValue = payload.value + aberrance;

    this.mqttClient.emit(`sensor-connector/devices/${chipId}/temperature/corrected`, { value: correctedValue });
    this.influx.insert({ measurement: 'temperature', fields: { value: correctedValue, raw: payload.value, pin: payload.pin || -1 }, tags: { chipId: chipId.toString() } });
  }

  @Get(':chipId/history')
  getHistory(@Param('chipId') chipId: string, @Query('pin') pin: number) {
    if (!pin) {
      pin = -1;
    }
    return this.influx.find(`select * from temperature where time > now() - 1d AND chipId = '${chipId}' AND pin = ${pin}`);
    // return this.influx.find(`select * from (select * from temperature fill(-1)) where pin = -1`);
  }

  @Get(':chipId/latest')
  getLatest(@Param('chipId') chipId: string, @Query('pin') pin: number) {
    return this.influx.findOne(`select * from temperature where chipId = '${chipId}' AND pin = ${pin} order by time desc limit 1`);
  }

}
