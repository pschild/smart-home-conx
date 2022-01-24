import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PricesAtDate, StationDetailModel } from '@smart-home-conx/api/shared/data-access/models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TankerkoenigHttpService {

  constructor(private httpClient: HttpClient) { }

  loadStations(): Observable<StationDetailModel[]> {
    return this.httpClient.get<StationDetailModel[]>(`third-party-api/tankerkoenig/stations`);
  }

  loadPrices(): Observable<PricesAtDate> {
    return this.httpClient.get<PricesAtDate>(`third-party-api/tankerkoenig/prices`);
  }

}
