import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Injectable } from '@angular/core';
import { Action, createSelector, Selector, State, StateContext, StateToken, Store } from '@ngxs/store';
import { insertItem, patch, removeItem, updateItem } from '@ngxs/store/operators';
import { RoomModel, SensorModel, SensorType } from '@smart-home-conx/api/shared/data-access/models';
import { EMPTY, merge } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { EventMqttService } from '../../../event-mqtt.service';
import { RoomHttpService } from './room-http.service';
import { SensorHttpService } from './sensor-http.service';
import { SensorActions } from './sensor.actions';

export const DEVICE_STATE_NAME = new StateToken<SensorStateModel>('sensor');

export interface SensorStateModel {
  history: { [sensorId: string]: { time: string; value: number; chipId: string; pin: number; type: SensorType }[] };
  loadingStates: { sensorId: string; loading: boolean; lastRefresh?: string }[];
  rooms: RoomModel[];
  sensors: SensorModel[];
}

@State<SensorStateModel>({
  name: DEVICE_STATE_NAME,
  defaults: {
    history: {},
    loadingStates: [],
    rooms: [],
    sensors: []
  }
})
@Injectable()
export class SensorState {

  constructor(
    private sensorHttpService: SensorHttpService,
    private roomHttpService: RoomHttpService,
    private eventMqttService: EventMqttService,
    private store: Store
  ) {}

  @Selector()
  static rooms(state: SensorStateModel) {
    return state.rooms;
  }

  @Selector()
  static sensors(state: SensorStateModel) {
    return state.sensors;
  }

  static sensorsOfRoom(roomId: string) {
    return createSelector([SensorState], (state: SensorStateModel) => state.sensors.filter(s => s.roomId === roomId));
  }

  @Selector()
  static unassignedSensors(state: SensorStateModel) {
    return state.sensors.filter(s => !s.roomId);
  }

  static sensorId(chipId: string, type: SensorType, pin?: number) {
    return createSelector([SensorState], (state: SensorStateModel) => {
      // TODO: Typen von chipId => string vs. number
      if (typeof pin === 'undefined') {
        pin = null;
      }
      const sensor = state.sensors.find(s => s.chipId === +chipId && s.type === type && s.pin === pin);
      return sensor._id.toString();
    });
  }

  static history(sensorId: string, type: SensorType) {
    return createSelector([SensorState], (state: SensorStateModel) =>
      state.history[sensorId]
        .filter(e => e.type === type)
        .sort((a, b) => a.time.localeCompare(b.time) * - 1)
    );
  }

  static latest(sensorId: string, type: SensorType) {
    return createSelector([SensorState.history(sensorId, type)], (history: { time: string; value: number; chipId: string; pin: number; type: SensorType }[]) => {
      return !!history && history.length > 0 ? history[0] : null;
    });
  }

  static lastRefresh(sensorId: string) {
    return createSelector([SensorState], (state: SensorStateModel) => state.loadingStates.find(i => i.sensorId === sensorId)?.lastRefresh);
  }

  static isLoading(sensorId: string) {
    return createSelector([SensorState], (state: SensorStateModel) => state.loadingStates.find(i => i.sensorId === sensorId)?.loading);
  }

  ngxsOnInit(ctx?: StateContext<any>): void {
    console.log('ngxsOnInit sensor.state');
    ctx.dispatch([
      new SensorActions.LoadRooms(),
      new SensorActions.LoadSensors()
    ]);

    const obsList$ = [SensorType.TEMPERATURE, SensorType.HUMIDITY, SensorType.VOLTAGE, SensorType.MOVEMENT]
      .map(type => this.eventMqttService.observe(`devices/+/${type}`).pipe(
        map(res => ({ type, chipId: res.topic.match(/devices\/(\d+)/)[1], payload: this.parsePayload(res.payload.toString()) }))
      ));
    merge(...obsList$).subscribe(result => {
      const sensorId = this.store.selectSnapshot(SensorState.sensorId(result.chipId, result.type as SensorType, result.payload.pin));
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

  private parsePayload(rawPayload: string): { value?: number; pin?: number } {
    let result;
    try {
      result = JSON.parse(rawPayload)
    } catch (error) {
      console.error(`Could not parse JSON payload "${rawPayload}"`);
      result = {};
    }
    return result;
  }

  @Action(SensorActions.LoadHistory)
  loadHistory(ctx: StateContext<SensorStateModel>, action: SensorActions.LoadHistory) {
    // const lastRefresh = this.store.selectSnapshot(SensorState.lastRefresh(action.sensorId));
    // if (!!lastRefresh && differenceInMinutes(new Date(), new Date(lastRefresh)) <= 10) {
    //   return;
    // }

    return this.sensorHttpService.loadHistory(action.chipId, action.type, action.pin).pipe(
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

  @Action(SensorActions.LoadRooms)
  loadRooms(ctx: StateContext<SensorStateModel>) {
    return this.roomHttpService.loadAll().pipe(
      tap((rooms: RoomModel[]) => ctx.patchState({ rooms }))
    );
  }

  @Action(SensorActions.LoadSensors)
  loadSensors(ctx: StateContext<SensorStateModel>) {
    return this.sensorHttpService.loadAll().pipe(
      tap((sensors: SensorModel[]) => ctx.patchState({ sensors }))
    );
  }

  @Action(SensorActions.CreateSensor)
  createSensor(ctx: StateContext<SensorStateModel>, action: SensorActions.CreateSensor) {
    return this.sensorHttpService.create(action.dto).pipe(
      tap(createdSensor => {
        ctx.setState(patch({ sensors: insertItem<SensorModel>(createdSensor) }));
      })
    );
  }

  @Action(SensorActions.UpdateSensor)
  updateSensor(ctx: StateContext<SensorStateModel>, action: SensorActions.UpdateSensor) {
    const sensor = ctx.getState().sensors.find(s => s._id.toString() === action.id);

    // optimistic update
    ctx.setState(patch({
      sensors: updateItem(item => item._id.toString() === action.id, { ...sensor, ...action.dto })
    }));

    return this.sensorHttpService.update(sensor._id.toString(), action.dto).pipe(
      catchError(err => {
        // reset to old values in case of error
        ctx.setState(patch({
          sensors: updateItem(item => item._id.toString() === action.id, { ...sensor })
        }));
        return EMPTY;
      })
    );
  }

  @Action(SensorActions.RemoveSensor)
  removeSensor(ctx: StateContext<SensorStateModel>, action: SensorActions.RemoveSensor) {
    return this.sensorHttpService.remove(action.id).pipe(
      tap(_ => ctx.setState(patch({ sensors: removeItem<SensorModel>(item => item._id.toString() === action.id) })))
    );
  }

  @Action(SensorActions.SensorDropped)
  dropSensor(ctx: StateContext<SensorStateModel>, action: SensorActions.SensorDropped) {
    const event = action.dropEvent;
    const sensorId = event.item.data._id;
    const newRoomId = event.container.id === 'unassigned-list' ? null : event.container.data._id;
    const newPosition = event.container.id === 'unassigned-list' ? null : this.getNewPosition(event);
    return ctx.dispatch(new SensorActions.UpdateSensor(sensorId, { roomId: newRoomId, position: newPosition }));
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

  private updateLoadingState(ctx: StateContext<SensorStateModel>, sensorId: string, loading: boolean, lastRefresh?: string): void {
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
