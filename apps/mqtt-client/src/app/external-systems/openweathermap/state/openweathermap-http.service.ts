import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OneCallResponse } from '@smart-home-conx/api/shared/data-access/models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OpenWeatherMapHttpService {

  constructor(private httpClient: HttpClient) { }

  oneCall(): Observable<OneCallResponse> {
    return this.httpClient.get<OneCallResponse>(`third-party-api/openweathermap/onecall`);
  }

}
