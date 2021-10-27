import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { SensorActions } from './state/sensor.actions';

@Injectable({
  providedIn: 'root'
})
export class SensorResolver implements Resolve<void> {

  constructor(private store: Store) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<void> | Promise<void> | void {
    return this.store.dispatch(new SensorActions.LoadRooms()).pipe(
      mergeMap(() => this.store.dispatch(new SensorActions.LoadSensors()))
    );
  }
}