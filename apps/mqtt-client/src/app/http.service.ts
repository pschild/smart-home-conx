import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private httpClient: HttpClient) {}

  get(speachText: string): void {
    const formattedSpeachText = encodeURI(speachText);
    this.httpClient.get(`${environment.env.PUBLIC_ENDPOINT}:3333/alexa/speak/${formattedSpeachText}`).subscribe(console.log);
  }

}
