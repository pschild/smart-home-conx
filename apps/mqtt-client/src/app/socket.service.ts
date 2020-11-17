import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private socket: Socket;

  constructor(private authenticationService: AuthenticationService) {
    if (!this.authenticationService.isLoggedIn()) {
      return;
    }
    this.socket = io(`${window.location.protocol}//${window.location.hostname}:3333`, {
      path: '/pio-ws',
      extraHeaders: {
        Authorization: `Bearer ${this.authenticationService.getToken()}`
      }
    });
    this.socket.on('connect', () => console.log('my ID:', this.socket.id));
  }

  listen(channel: string): Observable<any> {
    return new Observable(observer => {
      this.socket.on(channel, data => observer.next(data));
    });
  }

}
