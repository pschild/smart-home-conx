import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private httpClient: HttpClient) { }

  commutingHistory(): Observable<any> {
    return this.httpClient.get(`commuter/history`);
  }

  triggerPioBuild(libName: string, releaseType: string, chipIds: number[]): Observable<any> {
    return this.httpClient.post(`ota/build/run`, { libName, releaseType, chipIds });
  }

  killPioBuild(): Observable<any> {
    return this.httpClient.get(`ota/build/kill`);
  }

  getEspRepos(): Observable<string[]> {
    return this.httpClient.get<string[]>(`ota/github/repos`);
  }

  getMovementLog(): Observable<any> {
    return this.httpClient.get<any>(`sensor-connector/movement/history`);
  }

  getLog(): Observable<any> {
    return this.httpClient.get<any>(`logger`);
  }

  getLatestVoltage(chipId: string): Observable<string> {
    return this.httpClient.get<any>(`sensor-connector/voltage/${chipId}/latest`).pipe(
      map(result => result?.value)
    );
  }

}
