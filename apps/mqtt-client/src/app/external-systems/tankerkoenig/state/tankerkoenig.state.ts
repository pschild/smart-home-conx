import { Injectable } from '@angular/core';
import { Action, NgxsOnInit, Selector, State, StateContext, StateToken } from '@ngxs/store';
import { PricesAtDate, StationDetailModel } from '@smart-home-conx/api/shared/data-access/models';
import { tap } from 'rxjs/operators';
import { EventMqttService } from '../../../event-mqtt.service';
import { TankerkoenigHttpService } from './tankerkoenig-http.service';
import * as TankerkoenigActions from './tankerkoenig.actions';

export const TANKERKOENIG_STATE_NAME = new StateToken<TankerkoenigStateModel>('tankerkoenig');

export interface TankerkoenigStateModel {
  stations: StationDetailModel[];
  prices: PricesAtDate;
  filter: { place?: string; fuelsort?: string };
}

@State<TankerkoenigStateModel>({
  name: TANKERKOENIG_STATE_NAME,
  defaults: {
    stations: [],
    prices: null,
    filter: null
  }
})
@Injectable()
export class TankerkoenigState implements NgxsOnInit {

  @Selector()
  static stations(state: TankerkoenigStateModel) {
    return state.stations;
  }

  @Selector()
  static prices(state: TankerkoenigStateModel) {
    return state.prices;
  }

  @Selector()
  static places(state: TankerkoenigStateModel) {
    return new Set(state.stations.map(station => station.place.toUpperCase()));
  }

  @Selector([TankerkoenigState])
  static lowestDieselPrice(state: TankerkoenigStateModel) {
    const sortedByPrice = Object.entries(state.prices.prices)
      .map(([stationId, prices]) => ({
        station: { ...state.stations.find(s => s.id === stationId) },
        prices
      }))
      .filter(item => (!state.filter || state.filter.place === 'all') || item.station.place.toUpperCase() === state.filter.place)
      .filter(item => item.prices.status === 'open')
      .map(item => ({ ...item, price: item.prices.diesel }))
      .sort((a, b) => a.price > b.price ? 1 : -1);
    return { datetime: state.prices.datetime, prices: sortedByPrice };
  }

  constructor(
    private tankerkoenigHttpService: TankerkoenigHttpService,
    private eventMqttService: EventMqttService
  ) {}

  ngxsOnInit(ctx?: StateContext<any>): void {
    console.log('ngxsOnInit tankerkoenig.state');
    ctx.dispatch(new TankerkoenigActions.LoadStations());

    this.eventMqttService.observe(`third-party-api/tankerkoenig`).subscribe(payload => console.log(`fuel prices were updated`, payload.toString()));
  }

  @Action(TankerkoenigActions.LoadStations)
  loadStations(ctx: StateContext<TankerkoenigStateModel>) {
    return this.tankerkoenigHttpService.loadStations().pipe(
      tap(stations => ctx.patchState({ stations }))
    );
  }

  @Action(TankerkoenigActions.LoadPrices)
  loadPrices(ctx: StateContext<TankerkoenigStateModel>) {
    return this.tankerkoenigHttpService.loadPrices().pipe(
      tap(prices => ctx.patchState({ prices }))
    );
  }

  @Action(TankerkoenigActions.SetFilter)
  setFilter(ctx: StateContext<TankerkoenigStateModel>, action: TankerkoenigActions.SetFilter) {
    ctx.patchState({ filter: action.filter });
  }

}
