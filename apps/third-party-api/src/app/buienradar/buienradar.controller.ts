import { Controller, Get, Logger } from '@nestjs/common';
import { Client, ClientProxy, Transport } from '@nestjs/microservices';
import { Cron } from '@nestjs/schedule';
import { BuienradarRainHistoryForecastResponse } from '@smart-home-conx/api/shared/data-access/models';
import { isDocker } from '@smart-home-conx/utils';
import { EMPTY, from, Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { BuienradarClient } from './buienradar-client.service';
import { BuienradarRainHistoryForecastMapper } from './buienradar-rain-history-forecast-mapper.service';
import { BuienradarRaintextMapper } from './buienradar-raintext-mapper.service';

@Controller('buienradar')
export class BuienradarController {

  @Client({ transport: Transport.MQTT, options: { url: isDocker() ? `mqtt://mqtt-broker:1883` : `mqtt://localhost:1883` } })
  mqttClient: ClientProxy;

  constructor(
    private readonly buienradarClient: BuienradarClient,
    private readonly raintextMapper: BuienradarRaintextMapper,
    private readonly rainHistoryForecastMapper: BuienradarRainHistoryForecastMapper,
  ) {
  }

  @Get('raintext')
  getRaintext(): Observable<{ datetime: Date; precipitation: number }[]> {
    return from(this.buienradarClient.raintextCached()).pipe(
      map(response => this.raintextMapper.mapToResponse(response))
    );
  }

  @Get('rainHistoryForecast')
  getRainHistoryForecast(): Observable<{ datetime: Date; precipitation: number }[]> {
    return from(this.buienradarClient.rainHistoryForecastCached()).pipe(
      map(response => this.rainHistoryForecastMapper.mapToResponse(response))
    );
  }

  @Cron('0 */10 5-23 * * *') // every 10 minutes between 5:00 and 23:50
  cron(): void {
    Logger.log(`Running cronjob for updating weather (raintext,buienradar)...`);
    this.buienradarClient.raintextCached().pipe(
      tap(response => this.mqttClient.emit('third-party-api/buienradar/raintext', response)),
      catchError(err => {
        Logger.error(`Cronjob for updating weather (raintext,buienradar) failed: ${err}`);
        this.mqttClient.emit('log', {source: 'third-party-api', message: `Cronjob for updating weather (raintext,buienradar) failed: ${err}`});
        return EMPTY;
      })
    ).subscribe(() => Logger.log('Success.'));

    Logger.log(`Running cronjob for updating weather (rainHistoryForecast,,buienradar)...`);
    this.buienradarClient.rainHistoryForecastCached().pipe(
      tap(response => this.mqttClient.emit('third-party-api/buienradar/rainHistoryForecast', response)),
      catchError(err => {
        Logger.error(`Cronjob for updating weather (rainHistoryForecast,buienradar) failed: ${err}`);
        this.mqttClient.emit('log', {source: 'third-party-api', message: `Cronjob for updating weather (rainHistoryForecast,buienradar) failed: ${err}`});
        return EMPTY;
      })
    ).subscribe(() => Logger.log('Success.'));
  }
}
