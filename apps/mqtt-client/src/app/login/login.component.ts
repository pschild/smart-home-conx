import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Store } from '@ngxs/store';
import { AuthActions } from '../auth/state/auth.actions';

@Component({
  selector: 'smart-home-conx-login',
  templateUrl: 'login.component.html'
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  returnUrl: string;
  errorMessage: string;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store
  ) {
    // if (this.authenticationService.isLoggedIn()) {
    //   this.router.navigate(['/playground']);
    // }
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  onSubmit() {
    this.store.dispatch(new AuthActions.Login(
      this.loginForm.get('username').value,
      this.loginForm.get('password').value
    )).pipe(
      catchError(err => {
        if (err.status === 401) {
          this.errorMessage = `Falscher Benutzername oder falsches Passwort.`;
        }
        return throwError(err);
      })
    ).subscribe(() => this.router.navigate([this.returnUrl]));
  }
}