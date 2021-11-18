import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SensorModel, SensorType } from '@smart-home-conx/api/shared/data-access/models';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SensorHttpService {

  constructor(private httpClient: HttpClient) { }

  loadAll(): Observable<SensorModel[]> {
    return this.httpClient.get<SensorModel[]>(`device/sensor`);
  }

  create(dto: Partial<SensorModel>): Observable<SensorModel> {
    return this.httpClient.post<SensorModel>(`device/sensor`, dto).pipe(
      catchError(err => {
        console.error(err);
        return throwError(err);
      })
    );
  }

  update(id: string, dto: Partial<SensorModel>): Observable<any> {
    return this.httpClient.patch<any>(`device/sensor/${id}`, dto).pipe(
      catchError(err => {
        console.error(err);
        return throwError(err);
      })
    );
  }

  remove(id: string): Observable<any> {
    return this.httpClient.delete<any>(`device/sensor/${id}`).pipe(
      catchError(err => {
        console.error(err);
        return throwError(err);
      })
    );
  }

  loadHistory(chipId: number, type: SensorType, pin?: number): Observable<{ time: string; value: number; chipId: string; pin: number; type: SensorType }[]> {
    let params;
    if (!!pin) {
      params = new HttpParams().set('pin', pin);
    }

    return this.httpClient.get<{ time: string; value: number; chipId: string; pin: number; type: SensorType }[]>(`sensor-connector/${type}/${chipId}/history`, { params }).pipe(
      map(items => items.map(i => ({ ...i, type })))
    );
  }

}
