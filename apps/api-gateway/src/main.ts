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
import { log } from '@smart-home-conx/utils';
import { UnauthorizedError, authErrorHandler, authenticate } from '@smart-home-conx/auth';
import { addMilliseconds } from 'date-fns';
import { environment } from './environments/environment';

dotenv.config();

const TOKEN_LIFETIME: number = 1 * 24 * 60 * 60 * 1000; // 1 day, given in ms

const routes = [
  {
    "route": "/commuter",
    "address": "http://adesso-commuter-server:9062"
  },
  {
    "route": "/alexa",
    "address": "http://alexa-connector:9072"
  },
  {
    "route": "/ota",
    "address": "http://esp-update-server:9042"
  }
];

const app: Application = express();
app.use(urlencoded({ extended: false }));
app.use(json());
app.use(cors());
app.use(expressJwt({ secret: process.env.SERVICE_SECRET, algorithms: ['HS256'] }).unless({ path: ['/authenticate'] }));

const port = 3333;

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
    log(`Unauthorized request detected! Error: ${err.message}`);
    throw new UnauthorizedError(err.message);
  }
});

for (const route of routes) {
  app.use(route.route,
    createProxyMiddleware({
      target: route.address,
      auth: `${process.env.SERVICE_USER}:${process.env.SERVICE_PASSWORD}`,
      headers: {
        'X-Gateway-Secret': 's3cr3t'
      },
      // remove the service name from path
      pathRewrite: (path, req) => path.replace(route.route, '')
    })
  );
}

const brokerProxy = createProxyMiddleware({
  target: `http://mqtt-broker:1884`,
  ws: true,
  // auth: `${process.env.SERVICE_USER}:${process.env.SERVICE_PASSWORD}`,
  headers: {
    'X-Gateway-Secret': 's3cr3t'
  }
});
app.use('/broker', brokerProxy);

const espUpdateServerProxy = createProxyMiddleware({
  target: `http://esp-update-server:9042`,
  ws: true,
  // auth: `${process.env.SERVICE_USER}:${process.env.SERVICE_PASSWORD}`,
  headers: {
    'X-Gateway-Secret': 's3cr3t'
  }
});
app.use('/pio-ws', espUpdateServerProxy);

app.use(authErrorHandler);

let server;
if (environment.production) {
  const key = fs.readFileSync('./ssh/privkey.pem', 'utf8');
  const cert = fs.readFileSync('./ssh/cert.pem', 'utf8');
  const ca = fs.readFileSync('./ssh/chain.pem', 'utf8');
  const credentials = { key, cert, ca };
  server = https.createServer(credentials, app);
} else {
  server = http.createServer(app);
}

server
  .listen(port, () => {
    log(`running at http://localhost:${port}`);
    log(`running in ${environment.production ? 'PRODUCTION' : 'DEVELOPMENT'}`);
    environment.production ? log(`SSL enabled`) : log(`SSL diabled`);
  })
  .on('upgrade', (req: express.Request, socket: Socket, head: any) => {
    brokerProxy.upgrade(req, socket, head);
    espUpdateServerProxy.upgrade(req, socket, head);
  });
