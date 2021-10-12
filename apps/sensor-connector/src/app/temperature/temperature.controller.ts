import { Controller, Get, Param } from '@nestjs/common';
import { Ctx, MessagePattern, MqttContext, Payload } from '@nestjs/microservices';
import { InfluxService } from '@smart-home-conx/influx';

@Controller('temperature')
export class TemperatureSensorController {

  constructor(
    private readonly influx: InfluxService
  ) {}

  @MessagePattern('devices/+/temperature')
  create(@Payload() payload: { value: number; pin?: number }, @Ctx() context: MqttContext) {
    const chipIdMatch = context.getTopic().match(/devices\/(\d+)/);
    if (!chipIdMatch) {
      throw new Error(`Could not find a chipId. Topic=${context.getTopic()}`);
    }
    const chipId = chipIdMatch[1];

    this.influx.insert({ measurement: 'temperature', fields: { value: payload.value, pin: payload.pin }, tags: { chipId } });
  }

  @Get(':chipId/history')
  getHistory(@Param('chipId') chipId: string) {
    return this.influx.find(`select * from temperature WHERE time > now() - 1d AND chipId = '${chipId}'`);
  }

  @Get(':chipId/latest')
  getLatest(@Param('chipId') chipId: string) {
    return this.influx.findOne(`select * from temperature where chipId = '${chipId}' order by time desc limit 1`);
  }

}
