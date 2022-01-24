import { Controller, Get, Logger } from '@nestjs/common';
import { Client, ClientProxy, Transport } from '@nestjs/microservices';
import { Cron } from '@nestjs/schedule';
import { OneCallResponse } from '@smart-home-conx/api/shared/data-access/models';
import { isDocker } from '@smart-home-conx/utils';
import { EMPTY, from, Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { OpenWeatherMapClient } from './open-weather-map-client.service';
import { OpenWeatherMapMapper } from './open-weather-map-mapper.service';

@Controller('openweathermap')
export class OpenWeatherMapController {

  @Client({ transport: Transport.MQTT, options: { url: isDocker() ? `mqtt://mqtt-broker:1883` : `mqtt://localhost:1883` } })
  mqttClient: ClientProxy;

  constructor(
    private readonly openWeatherMapClient: OpenWeatherMapClient,
    private readonly mapper: OpenWeatherMapMapper
  ) {
  }

  @Get('onecall')
  getOneCall(): Observable<OneCallResponse> {
    return from(this.openWeatherMapClient.oneCallCached()).pipe(
      map(response => this.mapper.mapToResponse(response))
    );
  }

  @Cron('0 */10 5-23 * * *') // every 10 minutes between 5:00 and 23:50
  cron(): void {
    Logger.log(`Running cronjob for updating weather...`);
    this.openWeatherMapClient.oneCallCached().pipe(
      tap(response => this.mqttClient.emit('third-party-api/openweathermap', response)),
      catchError(err => {
        Logger.error(`Cronjob for updating weather failed: ${err}`);
        this.mqttClient.emit('log', {source: 'third-party-api', message: `Cronjob for updating weather failed: ${err}`});
        return EMPTY;
      })
    ).subscribe(() => Logger.log('Success.'));
  }
}
