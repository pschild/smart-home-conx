import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SensorModel } from '@smart-home-conx/api/shared/data-access/models';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SensorHttpService {

  constructor(private httpClient: HttpClient) { }

  loadAll(): Observable<SensorModel[]> {
    return this.httpClient.get<SensorModel[]>(`xxx`);
  }

  create(dto: SensorModel): Observable<SensorModel> {
    return this.httpClient.post<SensorModel>(`xxx`, dto).pipe(
      catchError(err => {
        console.error(err);
        return throwError(err);
      })
    );
  }

  update(id: string, dto: SensorModel): Observable<any> {
    return this.httpClient.patch<any>(`xxx/${id}`, dto).pipe(
      catchError(err => {
        console.error(err);
        return throwError(err);
      })
    );
  }

  remove(id: string): Observable<any> {
    return this.httpClient.delete<any>(`device/device/${id}`).pipe(
      catchError(err => {
        console.error(err);
        return throwError(err);
      })
    );
  }

}
