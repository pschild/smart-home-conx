import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommutingHttpService {

  constructor(private httpClient: HttpClient) { }

  load(): Observable<any[]> {
    return this.httpClient.get<any[]>(`commuting/x`);
  }

}
