import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { OneCallResponse } from '@smart-home-conx/api/shared/data-access/models';
import { differenceInSeconds } from 'date-fns';
import { interval, Observable, Subject, takeUntil } from 'rxjs';
import { map, startWith, withLatestFrom } from 'rxjs/operators';
import * as OpenWeatherMapActions from './state/openweathermap.actions';
import { OpenWeatherMapState } from './state/openweathermap.state';

@Component({
  selector: 'smart-home-conx-openweathermap-weather',
  templateUrl: './weather.component.html',
  styles: []
})
export class WeatherComponent implements OnInit, OnDestroy {

  destroy$: Subject<void> = new Subject();

  refreshable$: Observable<boolean>;

  @Select(OpenWeatherMapState.weather)
  weather$: Observable<OneCallResponse>;

  constructor(
    private store: Store
  ) {
  }

  ngOnInit(): void {
    this.store.dispatch(new OpenWeatherMapActions.OneCall());

    this.refreshable$ = interval(5000).pipe(
      withLatestFrom(this.weather$),
      map(([_, weather]) => weather && differenceInSeconds(new Date(), new Date(weather.current.datetime)) > 5 * 60),
      startWith(false),
      takeUntil(this.destroy$)
    );
  }

  refresh(): void {
    this.store.dispatch(new OpenWeatherMapActions.OneCall());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
