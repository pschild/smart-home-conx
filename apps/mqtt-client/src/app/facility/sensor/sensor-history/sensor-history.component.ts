import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { SensorModel } from '@smart-home-conx/api/shared/data-access/models';
import { map, Observable, of } from 'rxjs';
import { SensorActions } from '../state/sensor.actions';
import { SensorState } from '../state/sensor.state';
import * as shape from 'd3-shape';
import { format } from 'date-fns';

@Component({
  selector: 'smart-home-conx-sensor-history',
  templateUrl: 'sensor-history.component.html'
})
export class SensorHistoryComponent implements OnInit {

  @Input() sensor: SensorModel;

  @Input() min: number;
  @Input() max: number;
  @Input() curve = shape.curveMonotoneX;
  @Input() yAxisTicks: number[];
  @Input() formatYAxis: (value: number) => string;

  history$: Observable<any>;
  min$: Observable<number>;
  max$: Observable<number>;

  constructor(
    private store: Store
  ) {
  }

  ngOnInit(): void {
    this.history$ = this.store.select(SensorState.chartData(this.sensor._id.toString()));
    this.min$ = this.min ? of(this.min) : this.store.select(SensorState.min(this.sensor._id.toString(), this.sensor.type)).pipe(map(value => Math.floor(value)));
    this.max$ = this.max ? of(this.max) : this.store.select(SensorState.max(this.sensor._id.toString(), this.sensor.type)).pipe(map(value => Math.ceil(value)));
  }

  formatXAxis(value: Date): string {
    return format(value, 'dd.MM. HH:mm');
  }

  reloadHistory(): void {
    this.store.dispatch(new SensorActions.LoadHistory(this.sensor._id.toString(), this.sensor.chipId, this.sensor.type, this.sensor.pin));
  }

}
