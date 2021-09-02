import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PreferenceItem } from './preference.state';

@Injectable({
  providedIn: 'root'
})
export class PreferenceHttpService {

  constructor(private httpClient: HttpClient) { }

  loadLoggerPreferences(): Observable<PreferenceItem[]> {
    return this.httpClient.get<PreferenceItem[]>(`logger/preference`);
  }

  loadMessengerConnectorPreferences(): Observable<PreferenceItem[]> {
    return this.httpClient.get<PreferenceItem[]>(`messenger-connector/preference`);
  }

  loadCommutingWatcherPreferences(): Observable<PreferenceItem[]> {
    return this.httpClient.get<PreferenceItem[]>(`commuter/preference`);
  }

  update(endpointUrl: string, key: string, value: any ): Observable<any> {
    return this.httpClient.patch<any>(`${endpointUrl}/preference/${key}`, { value }).pipe(
      catchError(err => {
        console.error(err);
        return throwError(err);
      })
    );
  }

}
