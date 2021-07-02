import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { PreferenceActions } from './state/preference.actions';

@Injectable({
  providedIn: 'root'
})
export class PreferenceResolver implements Resolve<void> {

  constructor(private store: Store) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<void> | Promise<void> | void {
    return this.store.dispatch(new PreferenceActions.LoadPreferences());
  }
}