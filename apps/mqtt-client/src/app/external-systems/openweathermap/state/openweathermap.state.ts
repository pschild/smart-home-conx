import { Injectable } from '@angular/core';
import { Action, NgxsOnInit, Selector, State, StateContext, StateToken } from '@ngxs/store';
import { OneCallResponse } from '@smart-home-conx/api/shared/data-access/models';
import { tap } from 'rxjs/operators';
import { EventMqttService } from '../../../event-mqtt.service';
import { OpenWeatherMapHttpService } from './openweathermap-http.service';
import * as OpenWeatherMapActions from './openweathermap.actions';

export const OPEN_WEATHER_MAP_STATE_NAME = new StateToken<OpenWeatherMapStateModel>('openweathermap');

export interface OpenWeatherMapStateModel {
  weather: OneCallResponse;
}

@State<OpenWeatherMapStateModel>({
  name: OPEN_WEATHER_MAP_STATE_NAME,
  defaults: {
    weather: null
  }
})
@Injectable()
export class OpenWeatherMapState implements NgxsOnInit {

  @Selector()
  static weather(state: OpenWeatherMapStateModel) {
    return state.weather;
  }

  @Selector()
  static precipitationWithinNextHour(state: OpenWeatherMapStateModel): boolean {
    return state.weather.forecast.minutely?.some(entry => !!entry.precipitation);
  }

  @Selector()
  static precipitationChartData(state: OpenWeatherMapStateModel) {
    const series = state.weather.forecast.minutely.map(entry => ({ name: new Date(entry.datetime), value: entry.precipitation }));
    return [{ name: 'Niederschlag', series }];
  }

  constructor(
    private openWeatherMapHttpService: OpenWeatherMapHttpService,
    private eventMqttService: EventMqttService
  ) {}

  ngxsOnInit(ctx?: StateContext<any>): void {
    console.log('ngxsOnInit openweathermap.state');
    this.eventMqttService.observe(`third-party-api/openweathermap`).subscribe(res => console.log(`weather was updated`, JSON.parse(res.payload.toString()).data));
  }

  @Action(OpenWeatherMapActions.OneCall)
  loadWeather(ctx: StateContext<OpenWeatherMapStateModel>) {
    return this.openWeatherMapHttpService.oneCall().pipe(
      tap(weather => ctx.patchState({ weather }))
    );
  }

}
