import { Injectable } from '@angular/core';
import { Action, NgxsOnInit, Selector, State, StateContext, StateToken } from '@ngxs/store';
import { OneCallResponse } from '@smart-home-conx/api/shared/data-access/models';
import { map, tap } from 'rxjs/operators';
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

  constructor(
    private openWeatherMapHttpService: OpenWeatherMapHttpService,
    private eventMqttService: EventMqttService
  ) {}

  ngxsOnInit(ctx?: StateContext<any>): void {
    console.log('ngxsOnInit openweathermap.state');
    this.eventMqttService.observe(`third-party-api/openweathermap`).subscribe(payload => console.log(`weather was updated`, payload.toString()));
  }

  @Action(OpenWeatherMapActions.OneCall)
  loadPrices(ctx: StateContext<OpenWeatherMapStateModel>) {
    return this.openWeatherMapHttpService.oneCall().pipe(
      tap(weather => ctx.patchState({ weather }))
    );
  }

}
