import { Controller, Get } from '@nestjs/common';
import { Ctx, MessagePattern, MqttContext, Payload } from '@nestjs/microservices';
import { InfluxService } from '@smart-home-conx/influx';

@Controller('dht')
export class DhtSensorController {

  constructor(
    private readonly influx: InfluxService
  ) {}

  @MessagePattern('devices/+/dht')
  create(@Payload() payload: { temperature: number; humidity: number }, @Ctx() context: MqttContext) {
    const deviceIdMatch = context.getTopic().match(/(ESP_\d+)/);
    if (!deviceIdMatch) {
      throw new Error(`Could not find a deviceId. Topic=${context.getTopic()}`);
    }
    const deviceId = deviceIdMatch[0];
    const { temperature, humidity } = payload;

    this.influx.insert({ measurement: 'dht', fields: { temperature, humidity }, tags: { deviceId } });
  }

  @Get('history')
  getHistory() {
    return this.influx.find(`select * from dht WHERE time > now() - 1d`);
  }

}
