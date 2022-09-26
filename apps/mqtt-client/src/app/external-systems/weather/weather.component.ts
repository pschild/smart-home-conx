import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { OneCallResponse } from '@smart-home-conx/api/shared/data-access/models';
import { differenceInSeconds } from 'date-fns';
import { interval, Observable, Subject, takeUntil } from 'rxjs';
import { map, startWith, withLatestFrom } from 'rxjs/operators';
import * as WeatherActions from './state/weather.actions';
import { WeatherState } from './state/weather.state';

@Component({
  selector: 'smart-home-conx-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.scss']
})
export class WeatherComponent implements OnInit, OnDestroy {

  destroy$: Subject<void> = new Subject();

  refreshable$: Observable<boolean>;

  @Select(WeatherState.openweathermap)
  weather$: Observable<OneCallResponse>;

  constructor(
    private store: Store
  ) {
  }

  ngOnInit(): void {
    this.store.dispatch([
      new WeatherActions.OneCall(),
      new WeatherActions.LoadBuienradarRaintext(),
    ]);

    this.refreshable$ = interval(5000).pipe(
      withLatestFrom(this.weather$),
      map(([_, weather]) => weather && differenceInSeconds(new Date(), new Date(weather.current.datetime)) > 5 * 60),
      startWith(false),
      takeUntil(this.destroy$)
    );
  }

  refresh(): void {
    this.store.dispatch([
      new WeatherActions.OneCall(),
      new WeatherActions.LoadBuienradarRaintext(),
    ]);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
