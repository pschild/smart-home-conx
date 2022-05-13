import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RoomModel } from '@smart-home-conx/api/shared/data-access/models';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoomHttpService {

  constructor(private httpClient: HttpClient) { }

  loadAll(): Observable<RoomModel[]> {
    return this.httpClient.get<RoomModel[]>(`device/room`);
  }

  update(id: string, dto: Partial<RoomModel>): Observable<any> {
    return this.httpClient.patch<any>(`device/room/${id}`, dto).pipe(
      catchError(err => {
        console.error(err);
        return throwError(err);
      })
    );
  }

}
