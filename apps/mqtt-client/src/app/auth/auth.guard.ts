
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanLoad, Route, RouterStateSnapshot, UrlSegment } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { mapTo } from 'rxjs/operators';
import { AuthActions } from './state/auth.actions';
import { AuthState } from './state/auth.state';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanLoad {

  constructor(
    private store: Store
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.grantOrLogout(state.url);
  }

  canLoad(route: Route, segments: UrlSegment[]) {
    const fullPath = segments.reduce((path, currentSegment) => `${path}/${currentSegment.path}`, '');
    return this.grantOrLogout(fullPath);
  }

  private grantOrLogout(returnUrl: string): boolean | Observable<boolean> {
    if (this.store.selectSnapshot(AuthState.isLoggedIn)) {
      return true;
    }

    return this.store.dispatch(new AuthActions.Logout(returnUrl)).pipe(
      mapTo(false)
    );
  }
}
