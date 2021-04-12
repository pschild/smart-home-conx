import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs';
import { Socket } from 'net';
import * as express from 'express';
import * as cors from 'cors';
import { Application } from 'express';
import { json, urlencoded } from 'body-parser';
import { createProxyMiddleware } from 'http-proxy-middleware';
import * as expressJwt from 'express-jwt';
import * as dotenv from 'dotenv';
import { isDocker, log } from '@smart-home-conx/utils';
import { UnauthorizedError, authErrorHandler, authenticate } from '@smart-home-conx/auth';
import { addMilliseconds } from 'date-fns';
import { environment } from './environments/environment';
import * as mqtt from 'async-mqtt';

dotenv.config();

const mqttClient = mqtt.connect(isDocker() ? `http://mqtt-broker:1883` : `http://localhost:1883`, { clientId: 'api-gateway' });

const TOKEN_LIFETIME: number = 1 * 24 * 60 * 60 * 1000; // 1 day, given in ms

const routes = [
  {
    route: `/commuter`,
    address: isDocker() ? `http://adesso-commuter-server:9062` : `http://localhost:9062`
  },
  {
    route: `/alexa`,
    address: isDocker() ? `http://alexa-connector:9072` : `http://localhost:9072`
  },
  {
    route: `/ota`,
    address: isDocker() ? `http://ota-server:9042` : `http://localhost:9042`
  },
  {
    route: `/device`,
    address: isDocker() ? `http://device-manager:9092` : `http://localhost:9092`
  },
  {
    route: `/logger`,
    address: isDocker() ? `http://logger:9032` : `http://localhost:9032`
  }
];

const app: Application = express();
app.use(cors()); // cors also needed for proxied routes!
app.use(expressJwt({ secret: process.env.SERVICE_SECRET, algorithms: ['HS256'] }).unless({ path: ['/authenticate', /\/pio-ws\/.*/] }));

const port = 3333;

for (const route of routes) {
  app.use(route.route,
    createProxyMiddleware({
      target: route.address,
      auth: `${process.env.SERVICE_USER}:${process.env.SERVICE_PASSWORD}`,
      headers: {
        'X-Gateway-Secret': 's3cr3t'
      },
      logLevel: 'debug',
      // remove the service name from path
      pathRewrite: (path, req) => path.replace(route.route, '')
    })
  );
}

const brokerProxy = createProxyMiddleware('/broker', {
  target: isDocker() ? `ws://mqtt-broker:1884` : `ws://localhost:1884`,
  // auth: `${process.env.SERVICE_USER}:${process.env.SERVICE_PASSWORD}`,
  headers: {
    'X-Gateway-Secret': 's3cr3t'
  },
  logLevel: 'debug'
});
app.use('/broker', brokerProxy);

const espUpdateServerProxy = createProxyMiddleware('/pio-ws', {
  target: isDocker() ? `http://ota-server:9042` : `http://localhost:9042`,
  ws: true,
  // auth: `${process.env.SERVICE_USER}:${process.env.SERVICE_PASSWORD}`,
  headers: {
    'X-Gateway-Secret': 's3cr3t'
  },
  logLevel: 'debug'
});
app.use(espUpdateServerProxy);

// put bodyParser after all proxy middlewares and routes without proxy after bodyParser
// see https://github.com/chimurai/http-proxy-middleware/issues/320
app.use(urlencoded({ extended: false }));
app.use(json());

app.post('/authenticate', (req, res) => {
  const { username, password } = req.body;

  log(`Try to authenticate:
      hostname=${req.hostname}
      ip=${req.ip}
      originalUrl=${req.originalUrl}
      user-agent=${req.headers['user-agent']}
      auth=${req.headers['authorization']}
      username=${username}
      password=${password}
  `);

  try {
    const token = authenticate(username, password, TOKEN_LIFETIME);
    log(`Success! Token: ${token}`);
    return res.json({ token, expiresAt: addMilliseconds(new Date(), TOKEN_LIFETIME) });
  } catch(err) {
    // manually publish a mqtt message in the format of NestJs' abstraction: { pattern: string, data: any }
    mqttClient.publish('telegram/message', JSON.stringify({
      pattern: 'telegram/message',
      data: `Login für Benutzer "${username}" fehlgeschlagen!`
    }));
    log(`Unauthorized request detected! Error: ${err.message}`);
    throw new UnauthorizedError(err.message);
  }
});

app.use(authErrorHandler);

let server;
if (environment.production) {
  const key = fs.readFileSync('./ssl/privkey.pem', 'utf8');
  const cert = fs.readFileSync('./ssl/cert.pem', 'utf8');
  const ca = fs.readFileSync('./ssl/chain.pem', 'utf8');
  const credentials = { key, cert, ca };
  server = https.createServer(credentials, app);
} else {
  server = http.createServer(app);
}

mqttClient.on('connect', () => {
  log(`connected with MQTT broker`);

  server
    .listen(port, () => {
      log(`running at http://localhost:${port}`);
      log(`running in ${environment.production ? 'PRODUCTION' : 'DEVELOPMENT'}`);
      environment.production ? log(`SSL enabled`) : log(`SSL disabled`);
    })
    .on('upgrade', (req: express.Request, socket: Socket, head: any) => {
      // we need to proxy WebSockets for broker without initial http request, so we subscribe to the upgrade event manually
      brokerProxy.upgrade(req, socket, head);
    });
});
