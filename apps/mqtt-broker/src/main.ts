import * as net from 'net';
import * as http from 'http';

import * as aedes from 'aedes';
import * as ws from 'websocket-stream';
import { format } from 'date-fns';
import { environment } from './environments/environment';

// const mongodb = require('mongodb');
// const mongoUri = `mongodb://192.168.178.28:27017/`;

const instance = aedes();
const httpServer = net.createServer(instance.handle);
const wsServer = http.createServer();

const PORT_HTTP = 1883;
const PORT_WS = 1884;

// start http server
httpServer.listen(PORT_HTTP, () => {
  log(`HTTP server listening on port ${PORT_HTTP}`);
  log(`running in ${environment.production ? 'PRODUCTION' : 'DEVELOPMENT'}`);
});

// start ws server
ws.createServer({ server: wsServer }, instance.handle as any);
wsServer.listen(PORT_WS, () => {
  log(`WS server listening on port ${PORT_WS}`);
  log(`running in ${environment.production ? 'PRODUCTION' : 'DEVELOPMENT'}`);
});

instance.on('subscribe', (subscriptions, client) => {
  // tslint:disable-next-line:max-line-length
  log(`MQTT client \x1b[32m${client ? client.id : client}\x1b[0m subscribed to topics: ${subscriptions.map(s => s.topic).join(',')} from broker ${instance.id}`);
});

instance.on('unsubscribe', (subscriptions, client) => {
  // tslint:disable-next-line:max-line-length
  log(`MQTT client \x1b[32m${client ? client.id : client}\x1b[0m unsubscribed to topics: ${subscriptions.join(',')} from broker ${instance.id}`);
});

// fired when a client connects
instance.on('client', (client) => {
  log(`Client Connected: \x1b[33m${client ? client.id : client}\x1b[0m to broker ${instance.id}`);
});

// fired when a client disconnects
instance.on('clientDisconnect', (client) => {
  log(`Client Disconnected: \x1b[31m${client ? client.id : client}\x1b[0m to broker ${instance.id}`);
});

// fired when a message is published
instance.on('publish', (packet, client) => {
  // tslint:disable-next-line:max-line-length
  log(`Client \x1b[31m${client ? client.id : 'BROKER_' + instance.id}\x1b[0m has published ${packet.payload.toString()} on ${packet.topic} to broker ${instance.id}`);

  if (packet.topic.search(/heartbeat/) < 0) {
    persist(packet);
  }
});

function log(logMessage: string) {
  console.log(`${format(new Date(), 'dd.MM.yyyy HH:mm:ss.SSS')}: ${logMessage}`);
}

function persist(packet) {
  /*
  mongodb.MongoClient.connect(mongoUri, (error, database) => {
    if (error != null) {
      throw error;
    }
    const db = database.db('mydb');
    const collection = db.collection(`mycoll`);
    collection.createIndex({ topic: 1 });
    const messageObject = {
      topic: packet.topic,
      datetime: new Date(),
      message: packet.payload.toString()
    };
    collection.insertOne(messageObject, (error, result) => {
      if (error != null) {
        console.log('ERROR inserting to mongoDb: ' + error);
      }
    });
  });
  */
}
