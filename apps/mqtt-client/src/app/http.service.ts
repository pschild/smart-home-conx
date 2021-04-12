import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { EspConfig } from '@smart-home-conx/utils';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private httpClient: HttpClient) { }

  getDeviceList(): Observable<any> {
    return this.httpClient.get<any>(`${window.location.protocol}//${window.location.hostname}:3333/alexa/devices`).pipe(
      catchError(err => {
        console.error(err);
        return of([]);
      }),
      map(response => response && response.devices ? response.devices : response)
    );
  }

  speak(device: string, speachText: string): Observable<any> {
    return this.httpClient.post(`${window.location.protocol}//${window.location.hostname}:3333/alexa/speak`, { device, message: encodeURI(speachText) });
  }

  command(device: string, commandText: string): Observable<any> {
    return this.httpClient.post(`${window.location.protocol}//${window.location.hostname}:3333/alexa/textcommand`, { device, message: encodeURI(commandText) });
  }

  commutingHistory(): Observable<any> {
    return this.httpClient.get(`${window.location.protocol}//${window.location.hostname}:3333/commuter/history`);
  }

  triggerPioBuild(libName: string, releaseType: string, chipIds: number[]): Observable<any> {
    return this.httpClient.post(`${window.location.protocol}//${window.location.hostname}:3333/ota/build/run`, { libName, releaseType, chipIds });
  }

  killPioBuild(): Observable<any> {
    return this.httpClient.get(`${window.location.protocol}//${window.location.hostname}:3333/ota/build/kill`);
  }

  getEspConfig(): Observable<EspConfig[]> {
    return this.httpClient.get<EspConfig[]>(`${window.location.protocol}//${window.location.hostname}:3333/device`);
  }

}
