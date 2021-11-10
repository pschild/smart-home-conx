import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AuthActions } from './auth/state/auth.actions';
import { AuthState } from './auth/state/auth.state';

@Component({
  selector: 'smart-home-conx-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

  @Select(AuthState.isLoggedIn)
  isLoggedIn$: Observable<boolean>;

  constructor(
    private store: Store
  ) {
  }

  ngOnInit(): void {
  }

  logout(event: MouseEvent) {
    event.preventDefault();
    this.store.dispatch(new AuthActions.Logout());
  }

}
