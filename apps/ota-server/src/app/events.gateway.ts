import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { log } from '@smart-home-conx/utils';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ path: '/pio-ws' })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  private server: Server;

  handleConnection(client: Socket, ...args: any[]) {
    log(`client ${client.id} connected`);
  }

  handleDisconnect(client: Socket) {
    log(`client ${client.id} disconnected`);
  }

  broadcast(topic: string, payload: any) {
    this.server.emit(topic, payload);
  }

}
