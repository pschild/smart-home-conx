import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Action, createSelector, NgxsOnInit, Selector, State, StateContext, StateToken, Store } from '@ngxs/store';
import { insertItem, patch, updateItem } from '@ngxs/store/operators';
import { SensorType } from '@smart-home-conx/api/shared/data-access/models';
import { EMPTY, merge } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { EventMqttService } from '../../event-mqtt.service';
import { PlaygroundActions } from './playground.actions';

export const PLAYGROUND_STATE_NAME = new StateToken<PlaygroundStateModel>('playground');

export interface PlaygroundStateModel {
  history: { [sensorId: string]: { time: string; value: number; chipId: string; pin: number; type: SensorType }[] };
  loadingStates: { sensorId: string; loading: boolean; lastRefresh?: string }[];
  rooms: any[];
  sensors: any[];
}

@State<PlaygroundStateModel>({
  name: PLAYGROUND_STATE_NAME,
  defaults: {
    history: {},
    loadingStates: [],
    rooms: [],
    sensors: []
  }
})
@Injectable()
export class PlaygroundState implements NgxsOnInit {

  constructor(
    private httpClient: HttpClient,
    private eventMqttService: EventMqttService,
    private store: Store
  ) {}

  @Selector()
  static rooms(state: PlaygroundStateModel) {
    return state.rooms;
  }

  static sensorsOfRoom(roomId: string) {
    return createSelector([PlaygroundState], (state: PlaygroundStateModel) => state.sensors.filter(s => s.roomId === roomId));
  }

  @Selector()
  static unassignedSensors(state: PlaygroundStateModel) {
    return state.sensors.filter(s => !s.roomId);
  }

  static sensorId(chipId: string, type: SensorType, pin?: number) {
    return createSelector([PlaygroundState], (state: PlaygroundStateModel) => {
      // TODO: Typen von chipId => string vs. number
      const sensorsByChipIdAndType = state.sensors.filter(s => s.chipId === +chipId && s.type === type);
      const result = !!pin ? sensorsByChipIdAndType.find(s => s.pin === pin) : sensorsByChipIdAndType[0];
      return result._id;
    });
  }

  static history(sensorId: string, type: SensorType) {
    return createSelector([PlaygroundState], (state: PlaygroundStateModel) =>
      state.history[sensorId]
        .filter(e => e.type === type)
        .sort((a, b) => a.time.localeCompare(b.time) * - 1)
    );
  }

  static latest(sensorId: string, type: SensorType) {
    return createSelector([PlaygroundState.history(sensorId, type)], (history: any[]) => {
      return !!history && history.length > 0 ? history[0] : null;
    });
  }

  static lastRefresh(sensorId: string) {
    return createSelector([PlaygroundState], (state: PlaygroundStateModel) => state.loadingStates.find(i => i.sensorId === sensorId)?.lastRefresh);
  }

  static isLoading(sensorId: string) {
    return createSelector([PlaygroundState], (state: PlaygroundStateModel) => state.loadingStates.find(i => i.sensorId === sensorId)?.loading);
  }

  ngxsOnInit(ctx?: StateContext<any>): any {
    const obsList$ = [SensorType.TEMPERATURE, SensorType.HUMIDITY, SensorType.VOLTAGE]
      .map(type => this.eventMqttService.observe(`devices/+/${type}`).pipe(
        map(res => ({ type, chipId: res.topic.match(/devices\/(\d+)/)[1], payload: JSON.parse(res.payload.toString()) }))
      ));
    merge(...obsList$).subscribe(result => {
      const sensorId = this.store.selectSnapshot(PlaygroundState.sensorId(result.chipId, result.type as SensorType, result.payload.pin));
      if (!sensorId) {
        throw new Error(`Could not find a sensor by criteria chipId=${result.chipId}, pin=${result.payload.pin}, type=${result.type}`);
      }
      ctx.setState(patch({
        history: patch({
          [sensorId]: insertItem({
            time: new Date().toISOString(),
            value: result.payload.value,
            chipId: result.chipId,
            pin: result.payload.pin,
            type: result.type as SensorType
          })
        })
      }));
    });
  }

  @Action(PlaygroundActions.LoadHistory)
  loadHistory(ctx: StateContext<PlaygroundStateModel>, action: PlaygroundActions.LoadHistory) {
    // const lastRefresh = this.store.selectSnapshot(PlaygroundState.lastRefresh(action.sensorId));
    // if (!!lastRefresh && differenceInMinutes(new Date(), new Date(lastRefresh)) <= 10) {
    //   return;
    // }

    let params;
    if (!!action.pin) {
      params = new HttpParams().set('pin', action.pin);
    }
    return this.httpClient.get<any>(`sensor-connector/${action.type}/${action.chipId}/history`, { params }).pipe(
      map(items => items.map(i => ({ ...i, type: action.type }))),
      tap(items => {
        ctx.setState(patch({
          history: patch({
            [action.sensorId]: items
          })
        }));
      })
    );
  }

  @Action(PlaygroundActions.LoadRooms)
  loadRooms(ctx: StateContext<PlaygroundStateModel>) {
    return this.httpClient.get(`device/room`).pipe(
      tap((rooms: any[]) => ctx.patchState({ rooms }))
    );
  }

  @Action(PlaygroundActions.LoadSensors)
  loadSensors(ctx: StateContext<PlaygroundStateModel>) {
    return this.httpClient.get(`device/sensor`).pipe(
      tap((sensors: any[]) => ctx.patchState({ sensors }))
    );
  }

  @Action(PlaygroundActions.UpdateSensor)
  updateSensor(ctx: StateContext<PlaygroundStateModel>, action: PlaygroundActions.UpdateSensor) {
    const sensor = ctx.getState().sensors.find(s => s._id === action.sensorId);

    // optimistic update
    ctx.setState(patch({
      sensors: updateItem(item => item._id === action.sensorId, { ...sensor, roomId: action.newRoomId, position: action.position })
    }));

    return this.httpClient.patch(`device/sensor/${sensor._id}`, { roomId: action.newRoomId, position: action.position }).pipe(
      catchError(err => {
        // reset to old values in case of error
        ctx.setState(patch({
          sensors: updateItem(item => item._id === action.sensorId, { ...sensor })
        }));
        return EMPTY;
      })
    );
  }

  @Action(PlaygroundActions.SensorDropped)
  dropSensor(ctx: StateContext<PlaygroundStateModel>, action: PlaygroundActions.SensorDropped) {
    const event = action.dropEvent;
    const sensorId = event.item.data._id;
    const newRoomId = event.container.id === 'unassigned-list' ? null : event.container.data._id;
    const newPosition = event.container.id === 'unassigned-list' ? null : this.getNewPosition(event);
    return ctx.dispatch(new PlaygroundActions.UpdateSensor(sensorId, newRoomId, newPosition));
  }

  private getNewPosition(event: CdkDragDrop<any>): { x: number; y: number } {
    if (event.container.id === event.previousContainer.id) {
      return {
        x: event.isPointerOverContainer ? event.item.data.position.x + event.distance.x : event.item.data.position.x,
        y: event.isPointerOverContainer ? event.item.data.position.y + event.distance.y : event.item.data.position.y
      };
    }
    const dragRect = event.item.element.nativeElement.getBoundingClientRect();
    const dropRect = event.container.element.nativeElement.getBoundingClientRect();
    return {
      x: event.isPointerOverContainer ? event.dropPoint.x - dropRect.x - dragRect.width / 2 : 0,
      y: event.isPointerOverContainer ? event.dropPoint.y - dropRect.y - dragRect.height / 2 : 0
    };
  }

  private updateLoadingState(ctx: StateContext<PlaygroundStateModel>, sensorId: string, loading: boolean, lastRefresh?: string): void {
    if (!!ctx.getState().loadingStates.find(i => i.sensorId === sensorId)) {
      ctx.setState(patch({
        loadingStates: updateItem<{ sensorId: string; loading: boolean; lastRefresh?: string }>(i => i.sensorId === sensorId, { sensorId, loading, lastRefresh })
      }));
    } else {
      ctx.setState(patch({
        loadingStates: insertItem<{ sensorId: string; loading: boolean; lastRefresh?: string }>({ sensorId, loading, lastRefresh })
      }));
    }
  }

}
