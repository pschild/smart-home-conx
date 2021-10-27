import { Injectable } from '@angular/core';
import { Action, NgxsOnInit, Selector, State, StateContext, StateToken } from '@ngxs/store';
import { AuthActions } from './auth.actions';
import { AuthHttpService } from './auth-http.service';
import { tap } from 'rxjs/operators';
import { isBefore } from 'date-fns';

export const AUTH_STATE_NAME = new StateToken<AuthStateModel>('auth');

export interface AuthStateModel {
  token: string;
  expiresAt: Date;
}

@State<AuthStateModel>({
  name: AUTH_STATE_NAME,
  defaults: {
    token: null,
    expiresAt: null
  }
})
@Injectable()
export class AuthState implements NgxsOnInit {

  @Selector()
  static isLoggedIn(state: AuthStateModel) {
    return isBefore(new Date(), new Date(state.expiresAt));
  }

  @Selector()
  static expiration(state: AuthStateModel) {
    return state.expiresAt;
  }

  @Selector()
  static token(state: AuthStateModel) {
    return state.token;
  }

  constructor(
    private authService: AuthHttpService
  ) {}

  ngxsOnInit(ctx?: StateContext<any>): void {
    console.log('ngxsOnInit auth.state');
  }

  @Action(AuthActions.Login)
  login(ctx: StateContext<AuthStateModel>, action: AuthActions.Login) {
    return this.authService.login(action.username, action.password).pipe(
      tap(authResult => {
        ctx.patchState({
          token: authResult.token,
          expiresAt: new Date(authResult.expiresAt)
        });
      })
    );
  }

  @Action(AuthActions.Logout)
  logout(ctx: StateContext<AuthStateModel>) {
    ctx.patchState({ token: null, expiresAt: null });
  }
}
