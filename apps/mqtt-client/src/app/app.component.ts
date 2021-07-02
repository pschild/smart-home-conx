import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { AuthActions } from './auth/state/auth.actions';

@Component({
  selector: 'smart-home-conx-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

  constructor(
    private router: Router,
    private store: Store
  ) {
  }

  ngOnInit(): void {
  }

  logout() {
    this.store.dispatch(new AuthActions.Logout()).pipe(
      tap(() => this.router.navigate(['/login']))
    );
  }

}
