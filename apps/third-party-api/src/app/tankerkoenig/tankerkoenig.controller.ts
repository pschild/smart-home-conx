import { Controller, Get, Logger } from '@nestjs/common';
import { Client, ClientProxy, Transport } from '@nestjs/microservices';
import { Cron } from '@nestjs/schedule';
import { isDocker } from '@smart-home-conx/utils';
import { catchError, EMPTY } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TankerkoenigStationService } from './station/station.service';
import { TankerkoenigClient } from './tankerkoenig-client.service';

@Controller('tankerkoenig')
export class TankerkoenigController {

  @Client({ transport: Transport.MQTT, options: { url: isDocker() ? `mqtt://mqtt-broker:1883` : `mqtt://localhost:1883` } })
  mqttClient: ClientProxy;

  constructor(
    private readonly tankerkoenigClient: TankerkoenigClient,
    private readonly stationService: TankerkoenigStationService,
  ) {
  }
  
  @Get('stations')
  getStations() {
    return this.stationService.findAll();
  }

  @Get('prices')
  getPrice() {
    return this.tankerkoenigClient.getPricesCached();
  }

  @Cron('0 */10 5-23 * * *') // every 10 minutes between 5:00 and 23:50
  cron(): void {
    Logger.log(`Running cronjob for updating prices...`);
    this.tankerkoenigClient.getPricesCached().pipe(
      tap(response => this.mqttClient.emit('third-party-api/tankerkoenig', response)),
      catchError(err => {
        Logger.error(`Cronjob for updating prices failed: ${err}`);
        this.mqttClient.emit('log', {source: 'third-party-api', message: `Cronjob for updating prices failed: ${err}`});
        return EMPTY;
      })
    ).subscribe(() => Logger.log('Success.'));
  }

  @Cron('0 3 1 * *') // every 1st day of month at 3am
  updateStations(): void {
    Logger.log(`Running cronjob for updating stations...`);
    this.tankerkoenigClient.updateStations().pipe(
      catchError(err => {
        Logger.error(`Cronjob for updating stations failed: ${err}`);
        this.mqttClient.emit('log', {source: 'third-party-api', message: `Cronjob for updating stations failed: ${err}`});
        return EMPTY;
      })
    ).subscribe(() => {
      Logger.log('Success.');
      this.mqttClient.emit('telegram/message', `Cronjob for updating stations executed successfully.`);
      this.mqttClient.emit('log', {source: 'third-party-api', message: `Cronjob for updating stations executed successfully.`});
    });
  }
}
