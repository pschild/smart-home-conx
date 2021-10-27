import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DeviceModel } from '@smart-home-conx/api/shared/data-access/models';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DeviceHttpService {

  constructor(private httpClient: HttpClient) { }

  loadAll(): Observable<DeviceModel[]> {
    return this.httpClient.get<DeviceModel[]>(`device/device`);
  }

  create(dto: DeviceModel): Observable<DeviceModel> {
    return this.httpClient.post<DeviceModel>(`device/device`, dto).pipe(
      catchError(err => {
        console.error(err);
        return throwError(err);
      })
    );
  }

  update(id: string, dto: Partial<DeviceModel>): Observable<any> {
    return this.httpClient.patch<any>(`device/device/${id}`, dto).pipe(
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
