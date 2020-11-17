import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3333', { path: '/pio-ws' });
    this.socket.on('connect', () => console.log('my ID:', this.socket.id));
  }

  listen(channel: string): Observable<any> {
    return new Observable(observer => {
      this.socket.on(channel, data => observer.next(data));
    });
  }

}
