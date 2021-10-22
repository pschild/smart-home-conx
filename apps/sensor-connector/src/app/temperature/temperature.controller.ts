import { Controller, Get, Param, Query } from '@nestjs/common';
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
  getHistory(@Param('chipId') chipId: string, @Query('pin') pin: number) {
    return this.influx.find(`select * from temperature where time > now() - 1d AND chipId = '${chipId}' AND pin = ${pin}`);
    // return this.influx.find(`select * from (select * from temperature fill(-1)) where pin = -1`);
  }

  @Get(':chipId/latest')
  getLatest(@Param('chipId') chipId: string, @Query('pin') pin: number) {
    return this.influx.findOne(`select * from temperature where chipId = '${chipId}' AND pin = ${pin} order by time desc limit 1`);
  }

}
