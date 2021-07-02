import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { AuthActions } from './auth/state/auth.actions';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(
    private router: Router,
    private store: Store
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError(err => {
        // if the user is logged in but receives a 401 code, logout and redirect to login page
        if (this.router.url.search('login') < 0 && err.status === 401) {
          this.store.dispatch(new AuthActions.Logout());
          this.router.navigate(['/login']);
        }
        const error = err.error.message || err.statusText;
        return throwError(error);
      })
    );
  }
}
