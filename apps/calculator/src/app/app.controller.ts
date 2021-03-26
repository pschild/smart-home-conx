import { Controller, Get, Param } from '@nestjs/common';
import { Client, ClientProxy, Transport } from '@nestjs/microservices';
import { map } from 'rxjs/operators';
import { LogEntryModel } from '@smart-home-conx/log';

import { AppService } from './app.service';

@Controller()
export class AppController {

  @Client({ transport: Transport.TCP, options: { port: 3334 } })
  senseClient: ClientProxy;

  @Client({ transport: Transport.MQTT, options: { url: 'mqtt://192.168.178.28:1883' } })
  loggerClient: ClientProxy;

  constructor(private readonly appService: AppService) {}

  @Get('sum/:first/:second')
  sum(@Param('first') first: string, @Param('second') second: string) {
    return this.appService.sum(+first, +second);
  }

  @Get('sumPlusSense/:first')
  sumPlusSense(@Param('first') first: string) {
    const log: LogEntryModel = {
      origin: 'calculator',
      message: 'sum was requested'
    };
    this.loggerClient.emit('log', log);
    return this.senseClient.send<number>('getSense', {}).pipe(
      map(sense => this.appService.sum(+first, sense))
    );
  }
}
