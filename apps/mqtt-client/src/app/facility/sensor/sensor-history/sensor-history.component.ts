import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { SensorModel } from '@smart-home-conx/api/shared/data-access/models';
import * as shape from 'd3-shape';
import { format } from 'date-fns';
import { map, Observable, of } from 'rxjs';
import { SensorUtil } from '../sensor.util';
import { SensorActions } from '../state/sensor.actions';
import { SensorChartState } from './state/sensor-chart.state';

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

  suffix: string;

  constructor(
    private store: Store
  ) {
  }

  ngOnInit(): void {
    this.suffix = SensorUtil.getSuffixByType(this.sensor.type);

    this.history$ = this.store.select(SensorChartState.chartData(this.sensor._id.toString(), this.sensor.type));
    this.min$ = this.min ? of(this.min) : this.store.select(SensorChartState.min(this.sensor._id.toString(), this.sensor.type)).pipe(map(value => Math.floor(value)));
    this.max$ = this.max ? of(this.max) : this.store.select(SensorChartState.max(this.sensor._id.toString(), this.sensor.type)).pipe(map(value => Math.ceil(value)));
  }

  formatXAxis(value: Date): string {
    return format(value, 'dd.MM. HH:mm');
  }

  reloadHistory(): void {
    this.store.dispatch(new SensorActions.LoadHistory(this.sensor._id.toString(), this.sensor.chipId, this.sensor.type, this.sensor.pin));
  }

}
