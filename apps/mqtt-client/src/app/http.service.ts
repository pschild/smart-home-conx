import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private httpClient: HttpClient) { }

  triggerPioBuild(libName: string, releaseType: string, chipIds: number[]): Observable<any> {
    return this.httpClient.post(`ota/build/run`, { libName, releaseType, chipIds });
  }

  killPioBuild(): Observable<any> {
    return this.httpClient.get(`ota/build/kill`);
  }

  getEspRepos(): Observable<string[]> {
    return this.httpClient.get<string[]>(`ota/github/repos`);
  }

  getLog(): Observable<any> {
    return this.httpClient.get<any>(`logger`);
  }

}
