import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { DeviceActions } from './state/device.actions';

@Injectable({
  providedIn: 'root'
})
export class DeviceResolver implements Resolve<void> {

  constructor(private store: Store) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<void> | Promise<void> | void {
    return this.store.dispatch(new DeviceActions.LoadEspDevices()).pipe(
      mergeMap(() => this.store.dispatch(new DeviceActions.LoadAlexaDevices()))
    );
  }
}