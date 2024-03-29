import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { StationDetailModel } from '@smart-home-conx/api/shared/data-access/models';
import { interval, Observable, Subject, takeUntil } from 'rxjs';
import { map, startWith, withLatestFrom } from 'rxjs/operators';
import { TankerkoenigState } from './state/tankerkoenig.state';
import * as TankerkoenigActions from './state/tankerkoenig.actions';
import { FormControl } from '@angular/forms';
import { differenceInSeconds } from 'date-fns';

@Component({
  selector: 'smart-home-conx-tankerkoenig-prices',
  templateUrl: './prices.component.html',
  styles: []
})
export class PricesComponent implements OnInit, OnDestroy {

  destroy$: Subject<void> = new Subject();

  refreshable$: Observable<boolean>;

  @Select(TankerkoenigState.places)
  places$: Observable<string[]>;

  @Select(TankerkoenigState.lowestDieselPrice)
  prices$: Observable<{ datetime: Date; prices: { station: StationDetailModel; price: number; }[] }>;

  place = new FormControl('all');

  constructor(
    private store: Store
  ) {
  }

  ngOnInit(): void {
    this.store.dispatch(new TankerkoenigActions.LoadPrices());

    this.place.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(place => this.store.dispatch(new TankerkoenigActions.SetFilter({ place })));

    this.refreshable$ = interval(5000).pipe(
      withLatestFrom(this.prices$),
      map(([_, prices]) => prices && differenceInSeconds(new Date(), new Date(prices.datetime)) > 5 * 60),
      startWith(false),
      takeUntil(this.destroy$)
    );
  }

  refresh(): void {
    this.store.dispatch(new TankerkoenigActions.LoadPrices());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
