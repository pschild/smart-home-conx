import { Controller, Get, Param } from '@nestjs/common';
import { Ctx, MessagePattern, MqttContext, Payload } from '@nestjs/microservices';
import { InfluxService } from '@smart-home-conx/influx';

@Controller('voltage')
export class VoltageController {

  constructor(
    private readonly influx: InfluxService
  ) {}

  @MessagePattern('devices/+/voltage')
  create(@Payload() payload: number, @Ctx() context: MqttContext) {
    const deviceIdMatch = context.getTopic().match(/(ESP_\d+)/);
    if (!deviceIdMatch) {
      throw new Error(`Could not find a deviceId. Topic=${context.getTopic()}`);
    }
    const deviceId = deviceIdMatch[0];

    this.influx.insert({ measurement: 'voltage', fields: { value: payload }, tags: { deviceId } });
  }

  @Get('history')
  getHistory() {
    return this.influx.find(`select * from voltage WHERE time > now() - 1d`);
  }

  @Get(':chipId/latest')
  getLatest(@Param('chipId') chipId: string) {
    return this.influx.findOne(`select * from voltage where deviceId = '${chipId}' order by time desc limit 1`);
  }

}
