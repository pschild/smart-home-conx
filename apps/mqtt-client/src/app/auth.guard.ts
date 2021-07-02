
import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngxs/store';
import { mapTo, tap } from 'rxjs/operators';
import { AuthActions } from './auth/state/auth.actions';
import { AuthState } from './auth/state/auth.state';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private store: Store
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.store.selectSnapshot(AuthState.isLoggedIn)) {
      return true;
    }

    return this.store.dispatch(new AuthActions.Logout()).pipe(
      tap(() => this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } })),
      mapTo(false)
    );
  }
}
