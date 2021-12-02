import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { SensorModel, SensorType } from '@smart-home-conx/api/shared/data-access/models';
import { differenceInMinutes } from 'date-fns';
import { combineLatest, interval, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { EventMqttService } from '../../../event-mqtt.service';
import { SensorUtil } from '../sensor.util';
import { SensorActions } from '../state/sensor.actions';
import { SensorState } from '../state/sensor.state';

@Component({
  selector: 'smart-home-conx-sensor',
  templateUrl: './sensor.component.html',
  styles: [
    `
    .sensor {
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: move;
    }

    :host.cdk-drag-preview {
      width: 100% !important;
      opacity: 0.5;
    }

    .latest-info-container {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    `
  ]
})
export class SensorComponent implements OnInit {

  @Input() sensor: SensorModel;

  history$: Observable<{ time: string; value: number; chipId: string; pin: number; type: SensorType }[]>;
  latest$: Observable<{ time: string; value: number; chipId: string; pin: number; type: SensorType }>;
  isLoading$: Observable<boolean>;

  now$: Observable<Date>;

  SensorType = SensorType;

  constructor(
    private store: Store,
    private eventMqttService: EventMqttService,
  ) {
  }

  ngOnInit(): void {
    this.now$ = interval(1000).pipe(startWith(new Date()), map(_ => new Date()));

    this.history$ = this.store.select(SensorState.history(this.sensor._id.toString(), this.sensor.type));
    this.latest$ = this.store.select(SensorState.latest(this.sensor._id.toString(), this.sensor.type));
    this.isLoading$ = this.store.select(SensorState.isLoading(this.sensor._id.toString()));

    // TODO: wird zu oft geladen (bspw. wenn Sensor verschoben wird)
    this.store.dispatch(new SensorActions.LoadHistory(this.sensor._id.toString(), this.sensor.chipId, this.sensor.type, this.sensor.pin));
  }

  edit(): void {
    this.store.dispatch(new SensorActions.OpenEditDialog(this.sensor));
  }

  reloadHistory(): void {
    this.store.dispatch(new SensorActions.LoadHistory(this.sensor._id.toString(), this.sensor.chipId, this.sensor.type, this.sensor.pin));
  }

  // TODO: remove this method!
  sendMqttMessage(): void {
    this.eventMqttService.publish(`devices/${this.sensor.chipId}/${this.sensor.type}`, `{"value":42.3${!!this.sensor.pin ? ',"pin":' + this.sensor.pin : ''}}`).subscribe();
  }

  // TODO: remove this method!
  heaterOn(): void {
    this.eventMqttService.publish(`devices/${this.sensor.chipId}/heater`, `on`).subscribe();
  }

  // TODO: remove this method!
  heaterOff(): void {
    this.eventMqttService.publish(`devices/${this.sensor.chipId}/heater`, `off`).subscribe();
  }

  // TODO: remove this method!
  readnow(): void {
    this.eventMqttService.publish(`devices/${this.sensor.chipId}/readnow`, `readnow`).subscribe();
  }

  getIconName(type: SensorType): string {
    return SensorUtil.getIconNameByType(type);
  }

  getSuffix(type: SensorType): string {
    return SensorUtil.getSuffixByType(type);
  }

}
