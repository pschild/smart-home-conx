import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthHttpService {

  constructor(private httpClient: HttpClient) { }

  login(username: string, password: string): Observable<{ token: string; expiresAt: string }> {
    return this.httpClient.post<{ token: string; expiresAt: string }>(`authenticate`, { username, password });
  }

}
