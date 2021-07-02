import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { PlaygroundActions } from './state/playground.actions';

@Injectable({
  providedIn: 'root'
})
export class PlaygroundResolver implements Resolve<void> {

  constructor(private store: Store) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<void> | Promise<void> | void {
    return this.store.dispatch(new PlaygroundActions.LoadRooms()).pipe(
      mergeMap(() => this.store.dispatch(new PlaygroundActions.LoadSensors()))
    );
  }
}