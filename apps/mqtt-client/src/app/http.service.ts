import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private httpClient: HttpClient) {}

  get(speachText: string): void {
    // TODO: interceptor
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${environment.env.SERVICE_USER}:${environment.env.SERVICE_PASSWORD}`)
      })
    };

    const formattedSpeachText = encodeURI(speachText);
    this.httpClient.get(`${environment.env.PUBLIC_ENDPOINT}:3333/alexa/speak/${formattedSpeachText}`, httpOptions).subscribe(console.log);
  }

}
