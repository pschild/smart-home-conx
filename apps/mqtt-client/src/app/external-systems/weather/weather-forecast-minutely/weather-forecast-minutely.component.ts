import { Component } from '@angular/core';
import { Select } from '@ngxs/store';
import * as shape from 'd3-shape';
import { format } from 'date-fns';
import { Observable, Subject } from 'rxjs';
import { WeatherState } from '../state/weather.state';

@Component({
  selector: 'smart-home-conx-weather-forecast-minutely',
  templateUrl: './weather-forecast-minutely.component.html',
  styleUrls: ['./weather-forecast-minutely.component.scss']
})
export class WeatherForecastMinutelyComponent {

  destroy$: Subject<void> = new Subject();

  @Select(WeatherState.precipitationWithinNextHour)
  precipitationWithinNextHour$: Observable<boolean>;

  @Select(WeatherState.precipitationChartData)
  precipitationChartData$: Observable<{ name: Date; value: number; }[]>;

  colorScheme = { domain: ['#255276', '#6aade2'] };
  curve = shape.curveMonotoneX;

  formatXAxis(value: Date): string {
    return format(value, 'HH:mm');
  }

  formatYAxis(value: number): string {
    return `${value} mm`;
  }

}
