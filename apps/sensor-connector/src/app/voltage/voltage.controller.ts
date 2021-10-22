import { Controller, Get, Param } from '@nestjs/common';
import { Ctx, MessagePattern, MqttContext, Payload } from '@nestjs/microservices';
import { InfluxService } from '@smart-home-conx/influx';

@Controller('voltage')
export class VoltageController {

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
