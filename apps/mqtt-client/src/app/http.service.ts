import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private httpClient: HttpClient) { }

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

  getEspRepos(): Observable<string[]> {
    return this.httpClient.get<string[]>(`${window.location.protocol}//${window.location.hostname}:3333/ota/github/repos`);
  }

  getMovementLog(): Observable<any> {
    return this.httpClient.get<any>(`${window.location.protocol}//${window.location.hostname}:3333/sensor-connector/movement/history`);
  }

  getLog(): Observable<any> {
    return this.httpClient.get<any>(`${window.location.protocol}//${window.location.hostname}:3333/logger`);
  }

  getLatestVoltage(chipId: string): Observable<string> {
    return this.httpClient.get<any>(`${window.location.protocol}//${window.location.hostname}:3333/sensor-connector/voltage/${chipId}/latest`).pipe(
      map(result => result.value)
    );
  }

}
