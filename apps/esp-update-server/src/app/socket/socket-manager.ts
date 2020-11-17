import { Server } from 'http';
import * as socketIo from 'socket.io';
import { Singleton } from 'typescript-ioc';

@Singleton
export class SocketManager {

  private io: socketIo.Server;
  private sockets: socketIo.Socket[] = [];

  constructor() {
    this.io = new socketIo.Server();
  }

  init(server: Server): void {
    this.io.listen(server, { path: '/pio-ws' });

    this.io.on('connect', (socket: socketIo.Socket) => {
      console.log('connected!', socket.id);
      this.sockets.push(socket);

      socket.on('message', (msg) => {
        console.log('[server](message): %s', JSON.stringify(msg));
        this.io.emit('message', msg);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected');
        const index = this.sockets.findIndex(connectedSocket => connectedSocket.id === socket.id);
        if (index > -1) {
          this.sockets.splice(index, 1);
        }
      });
    });
  }

  broadcast(channel: string, message: any): void {
    console.log(`emitting to ${this.sockets.length} client(s)...`);
    // sending to all clients, include sender
    this.io.emit(channel, message);
  }
}
