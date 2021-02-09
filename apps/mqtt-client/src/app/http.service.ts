import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EspConfig } from '@smart-home-conx/utils';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private httpClient: HttpClient) { }

  speak(device: string, speachText: string): Observable<any> {
    // return this.httpClient.get(`${window.location.protocol}//${window.location.hostname}:3333/alexa/speak/${encodeURI(speachText)}`);
    return this.httpClient.post(`${window.location.protocol}//${window.location.hostname}:3333/alexa/speak`, {
      device,
      message: encodeURI(speachText)
    });
  }

  command(commandText: string): Observable<any> {
    return this.httpClient.get(`${window.location.protocol}//${window.location.hostname}:3333/alexa/textcommand/${encodeURI(commandText)}`);
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

  getEspConfig(): Observable<EspConfig[]> {
    return this.httpClient.get<EspConfig[]>(`${window.location.protocol}//${window.location.hostname}:3333/ota/esp-config`);
  }

}
