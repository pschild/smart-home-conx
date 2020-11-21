import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private httpClient: HttpClient) { }

  speak(speachText: string): Observable<any> {
    return this.httpClient.get(`${window.location.protocol}//${window.location.hostname}:3333/alexa/speak/${encodeURI(speachText)}`);
  }

  commutingHistory(): Observable<any> {
    return this.httpClient.get(`${window.location.protocol}//${window.location.hostname}:3333/commuter/history`);
  }

  triggerPioBuild(libName: string): Observable<any> {
    return this.httpClient.post(`${window.location.protocol}//${window.location.hostname}:3333/ota/build/run`, {
      libName,
      chipIds: [3356673, 3356430]
    });
  }

  killPioBuild(): Observable<any> {
    return this.httpClient.get(`${window.location.protocol}//${window.location.hostname}:3333/ota/build/kill`);
  }

}
