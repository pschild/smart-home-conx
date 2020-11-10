import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { isBefore } from 'date-fns';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(private http: HttpClient) {
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${window.location.protocol}//${window.location.hostname}:3333/authenticate`, { username, password }).pipe(
      map(authResult => this.setSession(authResult))
    );
  }

  logout(): void {
    localStorage.removeItem('conx_token');
    localStorage.removeItem('conx_expires_at');
  }

  getToken(): string {
    return localStorage.getItem('conx_token');
  }

  isLoggedIn(): boolean {
    return isBefore(new Date(), this.getExpiration());
  }

  isLoggedOut(): boolean {
    return !this.isLoggedIn();
  }

  private setSession(authResult): void {
    localStorage.setItem('conx_token', authResult.token);
    localStorage.setItem('conx_expires_at', authResult.expiresAt);
  }

  private getExpiration(): Date {
    const expiresAt = localStorage.getItem('conx_expires_at');
    return new Date(expiresAt);
  }
}
