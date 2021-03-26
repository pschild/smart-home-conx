import { Controller, Get } from '@nestjs/common';
import { Client, ClientProxy, MessagePattern, Transport } from '@nestjs/microservices';
import { LogEntryModel } from '@smart-home-conx/log';

import { AppService } from './app.service';

@Controller()
export class AppController {

  @Client({ transport: Transport.MQTT, options: { url: 'mqtt://192.168.178.28:1883' } })
  loggerClient: ClientProxy;

  constructor(private readonly appService: AppService) {}

  @Get('sense')
  getSense() {
    return this.appService.getSense();
  }

  @MessagePattern('getSense')
  getSenseInternal() {
    console.log(arguments);
    const log: LogEntryModel = {
      origin: 'sense',
      message: 'sense was read'
    };
    this.loggerClient.emit('log', log);
    return this.appService.getSense();
  }
}
