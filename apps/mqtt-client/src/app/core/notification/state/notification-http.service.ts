import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NotificationModel } from '@smart-home-conx/api/shared/data-access/models';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationHttpService {

  constructor(private httpClient: HttpClient) { }

  loadAll(): Observable<NotificationModel[]> {
    return this.httpClient.get<NotificationModel[]>(`notification-manager/notification`);
  }

  remove(id: string): Observable<any> {
    return this.httpClient.delete<any>(`notification-manager/notification/${id}`).pipe(
      catchError(err => {
        console.error(err);
        return throwError(err);
      })
    );
  }

  removeAll(): Observable<any> {
    return this.httpClient.delete<any>(`notification-manager/notification`).pipe(
      catchError(err => {
        console.error(err);
        return throwError(err);
      })
    );
  }

}
