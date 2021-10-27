import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { SensorModel, SensorType } from '@smart-home-conx/api/shared/data-access/models';
import { differenceInMinutes } from 'date-fns';
import { combineLatest, interval, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
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
    `
  ]
})
export class SensorComponent implements OnInit {

  @Input() sensor: SensorModel;

  history$: Observable<{ time: string; value: number; chipId: string; pin: number; type: SensorType }[]>;
  latest$: Observable<{ time: string; value: number; chipId: string; pin: number; type: SensorType }>;
  timeAgoLabel$: Observable<string>;
  isLoading$: Observable<boolean>;

  now$: Observable<Date>;

  constructor(
    private store: Store
  ) {
  }

  ngOnInit(): void {
    this.now$ = interval(1000).pipe(startWith(new Date()), map(_ => new Date()));

    this.history$ = this.store.select(SensorState.history(this.sensor._id.toString(), this.sensor.type));
    this.latest$ = this.store.select(SensorState.latest(this.sensor._id.toString(), this.sensor.type));
    this.timeAgoLabel$ = combineLatest([this.latest$, this.now$]).pipe(map(([latest, now]) => `${differenceInMinutes(now, new Date(latest.time))}m`));
    this.isLoading$ = this.store.select(SensorState.isLoading(this.sensor._id.toString()));

    // TODO: wird zu oft geladen (bspw. wenn Sensor verschoben wird)
    this.store.dispatch(new SensorActions.LoadHistory(this.sensor._id.toString(), this.sensor.chipId, this.sensor.type, this.sensor.pin));
  }

  reloadHistory(): void {
    this.store.dispatch(new SensorActions.LoadHistory(this.sensor._id.toString(), this.sensor.chipId, this.sensor.type, this.sensor.pin));
  }

  getIconName(type: SensorType): string {
    return SensorUtil.getIconNameByType(type);
  }

  getSuffix(type: SensorType): string {
    return SensorUtil.getSuffixByType(type);
  }

}
