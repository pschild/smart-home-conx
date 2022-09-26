import { Injectable } from '@angular/core';
import { Action, NgxsOnInit, Selector, State, StateContext, StateToken } from '@ngxs/store';
import { OneCallResponse } from '@smart-home-conx/api/shared/data-access/models';
import { addHours, isAfter, isBefore } from 'date-fns';
import { tap } from 'rxjs/operators';
import { EventMqttService } from '../../../event-mqtt.service';
import { BuienradarHttpService } from './buienradar-http.service';
import { OpenWeatherMapHttpService } from './openweathermap-http.service';
import * as WeatherActions from './weather.actions';

export const WEATHER_STATE_NAME = new StateToken<WeatherStateModel>('weather');

export interface WeatherStateModel {
  openweathermap: OneCallResponse;
  buienradar: { precipitation: any[] };
}

@State<WeatherStateModel>({
  name: WEATHER_STATE_NAME,
  defaults: {
    openweathermap: null,
    buienradar: null
  },
})
@Injectable()
export class WeatherState implements NgxsOnInit {

  @Selector()
  static openweathermap(state: WeatherStateModel) {
    return state.openweathermap;
  }

  @Selector()
  static precipitationWithinNextHour(state: WeatherStateModel): boolean {
    return state.openweathermap.forecast.minutely?.some(entry => !!entry.precipitation)
      || state.buienradar.precipitation.some(entry => !!entry.precipitation && isAfter(new Date(entry.datetime), new Date()));
  }

  @Selector()
  static precipitationChartData(state: WeatherStateModel) {
    const fromDate = new Date();
    const toDate = addHours(new Date(), 1);

    const openweathermapSeries = state.openweathermap.forecast.minutely
      .filter(entry => isAfter(new Date(entry.datetime), fromDate) && isBefore(new Date(entry.datetime), toDate))
      .map(entry => ({ name: new Date(entry.datetime), value: entry.precipitation }));

    const buienradarSeries = state.buienradar.precipitation
      .filter(entry => isAfter(new Date(entry.datetime), fromDate) && isBefore(new Date(entry.datetime), toDate))
      .map(entry => ({ name: new Date(entry.datetime), value: entry.precipitation }));

    // TODO: Was ist, wenn eine Quelle null ist? Was ist, wenn die Daten in einer Quelle anders sind als in der anderen?

    return [
      { name: 'OpenWeatherMap', series: openweathermapSeries },
      { name: 'Buienradar', series: buienradarSeries }
    ];
  }

  constructor(
    private openWeatherMapHttpService: OpenWeatherMapHttpService,
    private buienradarHttpService: BuienradarHttpService,
    private eventMqttService: EventMqttService
  ) {}

  ngxsOnInit(ctx?: StateContext<any>): void {
    console.log('ngxsOnInit weathermap.state');
    this.eventMqttService.observe(`third-party-api/openweathermap`).subscribe(res => console.log(`weather was updated (openweathermap)`, JSON.parse(res.payload.toString()).data));
  }

  @Action(WeatherActions.OneCall)
  oneCall(ctx: StateContext<WeatherStateModel>) {
    return this.openWeatherMapHttpService.oneCall().pipe(
      tap(weather => ctx.patchState({ openweathermap: weather }))
    );
  }

  @Action(WeatherActions.LoadBuienradarRaintext)
  loadBuienradarRaintext(ctx: StateContext<WeatherStateModel>) {
    return this.buienradarHttpService.rainHistoryForecast().pipe(
      tap(precipitation => ctx.patchState({ buienradar: { precipitation } }))
    );
  }

}
