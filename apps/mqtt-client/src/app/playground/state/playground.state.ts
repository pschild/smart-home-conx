import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext, StateToken, NgxsOnInit } from '@ngxs/store';
import { map, tap } from 'rxjs/operators';
import { EventMqttService } from '../../event-mqtt.service';
import { PlaygroundActions } from './playground.actions';

export const PLAYGROUND_STATE_NAME = new StateToken<PlaygroundStateModel>('playground');

export interface PlaygroundStateModel {
  dhtValues: { deviceId: string; temperature: number; humidity: number; time: Date; }[];
}

@State<PlaygroundStateModel>({
  name: PLAYGROUND_STATE_NAME,
  defaults: {
    dhtValues: []
  }
})
@Injectable()
export class PlaygroundState implements NgxsOnInit {

  constructor(
    private httpClient: HttpClient,
    private eventMqttService: EventMqttService
  ) {}

  @Selector()
  static dhtValues(state: PlaygroundStateModel) {
    return state.dhtValues;
  }

  @Selector()
  static latestTemperature(state: PlaygroundStateModel) {
    if (!state.dhtValues || state.dhtValues.length < 2) {
      return null;
    }
    const latest = state.dhtValues[state.dhtValues.length - 1];
    const beforeLatest = state.dhtValues[state.dhtValues.length - 2];
    let trend;
    if (latest.temperature > beforeLatest.temperature) {
      trend = '⬆';
    } else if (latest.temperature < beforeLatest.temperature) {
      trend = '⬇';
    } else {
      trend = '=';
    }
    return { ...latest, trend };
  }

  ngxsOnInit(ctx?: StateContext<any>): any {
    this.eventMqttService.observe('devices/+/dht').pipe(
      map(res => ({ deviceId: res.topic.match(/(ESP_\d+)/)[0], payload: JSON.parse(res.payload.toString()) }))
    ).subscribe(result => ctx.dispatch(new PlaygroundActions.AddDhtValue(result.deviceId, result.payload)));
  }

  @Action(PlaygroundActions.AddDhtValue)
  addDhtValue(ctx: StateContext<PlaygroundStateModel>, action: PlaygroundActions.AddDhtValue) {
    ctx.patchState({dhtValues: [...ctx.getState().dhtValues, {...action.payload, deviceId: action.deviceId, time: new Date().toISOString()}]});
  }

  @Action(PlaygroundActions.LoadDhtHistory)
  loadDhtHistory(ctx: StateContext<PlaygroundStateModel>) {
    return this.httpClient.get<any>(`sensor-connector/dht/history`).pipe(
      tap(dhtValues => ctx.patchState({dhtValues}))
    );
  }

}