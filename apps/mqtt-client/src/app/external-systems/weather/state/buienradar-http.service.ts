import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BuienradarHttpService {

  constructor(private httpClient: HttpClient) { }

  raintext(): Observable<any[]> {
    return this.httpClient.get<any[]>(`third-party-api/buienradar/raintext`);
  }

  rainHistoryForecast(): Observable<any[]> {
    return this.httpClient.get<any[]>(`third-party-api/buienradar/rainHistoryForecast`);
  }

}
