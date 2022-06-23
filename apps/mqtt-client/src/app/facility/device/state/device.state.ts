import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Action, createSelector, NgxsOnInit, Selector, State, StateContext, StateToken } from '@ngxs/store';
import { patch, updateItem, removeItem, insertItem } from '@ngxs/store/operators';
import { DeviceModel, DeviceModelUtil } from '@smart-home-conx/api/shared/data-access/models';
import { of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { EventMqttService } from '../../../event-mqtt.service';
import { DeviceActions } from './device.actions';
import { DeviceHttpService } from './device-http.service';

export const DEVICE_STATE_NAME = new StateToken<DeviceStateModel>('device');

export interface DeviceStateModel {
  espList: DeviceModel[];
  alexaList: { accountName: string }[];
}

@State<DeviceStateModel>({
  name: DEVICE_STATE_NAME,
  defaults: {
    espList: [],
    alexaList: []
  }
})
@Injectable()
export class DeviceState implements NgxsOnInit {

  @Selector()
  static espList(state: DeviceStateModel) {
    return state.espList;
  }

  @Selector()
  static alexaList(state: DeviceStateModel) {
    return state.alexaList;
  }

  static lastPing(deviceId: string) {
    return createSelector([DeviceState], (state: DeviceStateModel) => state.espList.find(i => i._id.toString() === deviceId)?.lastPing);
  }

  constructor(
    private httpClient: HttpClient,
    private deviceHttpService: DeviceHttpService,
    private eventMqttService: EventMqttService
  ) {}

  ngxsOnInit(ctx?: StateContext<any>): void {
    console.log('ngxsOnInit device.state');
    ctx.dispatch([
      new DeviceActions.LoadEspDevices(),
      new DeviceActions.LoadAlexaDevices()
    ]);

    this.eventMqttService.observe(`devices/+/ping`).pipe(
      map(res => {
        const chipId = +DeviceModelUtil.parseChipId(res.topic);
        const firmware = res.payload.toString();
        console.log(`[PING] ESP ${chipId} is using Firmware ${firmware}`);
        ctx.setState(patch({
          espList: updateItem<DeviceModel>(item => item.chipId === chipId, patch({ lastPing: new Date() }))
        }));
      })
    ).subscribe();
  }

  @Action(DeviceActions.LoadEspDevices)
  loadEspDevices(ctx: StateContext<DeviceStateModel>) {
    return this.deviceHttpService.loadAll().pipe(
      tap(espList => ctx.patchState({espList}))
    );
  }

  @Action(DeviceActions.CreateEspDevice)
  createEspDevice(ctx: StateContext<DeviceStateModel>, action: DeviceActions.CreateEspDevice) {
    return this.deviceHttpService.create(action.dto).pipe(
      tap(createdDevice => {
        ctx.setState(patch({ espList: insertItem<DeviceModel>(createdDevice) }));
      })
    );
  }

  @Action(DeviceActions.UpdateEspDevice)
  updateEspDevice(ctx: StateContext<DeviceStateModel>, action: DeviceActions.UpdateEspDevice) {
    return this.deviceHttpService.update(action.id, action.dto).pipe(
      tap(_ => {
        const currentDevice = ctx.getState().espList.find(item => item._id.toString() === action.id);
        const patchedDevice = { ...currentDevice, ...action.dto };
        ctx.setState(patch({ espList: updateItem<DeviceModel>(item => item._id.toString() === action.id, patchedDevice) }));
      })
    );
  }

  @Action(DeviceActions.RemoveEspDevice)
  removeEspDevice(ctx: StateContext<DeviceStateModel>, action: DeviceActions.RemoveEspDevice) {
    return this.deviceHttpService.remove(action.id).pipe(
      tap(_ => ctx.setState(patch({ espList: removeItem<DeviceModel>(item => item._id.toString() === action.id) })))
    );
  }

  @Action(DeviceActions.StartOtaUpdate)
  startOtaUpdate(ctx: StateContext<DeviceStateModel>, action: DeviceActions.StartOtaUpdate) {
    const target = action.chipId || 'all';
    return this.eventMqttService.publish(`ota/${target}`, null);
  }

  @Action(DeviceActions.LoadAlexaDevices)
  loadAlexaDevices(ctx: StateContext<DeviceStateModel>) {
    return this.httpClient.get<any>(`alexa/devices`).pipe(
      catchError(err => {
        console.error(err);
        return of([]);
      }),
      map(response => response && response.devices ? response.devices : response),
      tap(alexaList => ctx.patchState({alexaList}))
    );
  }

  @Action(DeviceActions.SendAlexaSpeech)
  sendAlexaSpeech(ctx: StateContext<DeviceStateModel>, action: DeviceActions.SendAlexaSpeech) {
    return this.httpClient.post(`alexa/speak`, { device: action.alexaDeviceName, message: encodeURI(action.text) });
  }

  @Action(DeviceActions.SendAlexaCommand)
  sendAlexaCommand(ctx: StateContext<DeviceStateModel>, action: DeviceActions.SendAlexaCommand) {
    return this.httpClient.post(`alexa/textcommand`, { device: action.alexaDeviceName, message: encodeURI(action.command) });
  }

}
