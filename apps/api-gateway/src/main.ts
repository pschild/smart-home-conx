import * as express from 'express';
import * as cors from 'cors';
import { Application } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import * as dotenv from 'dotenv';
import { log, isAuthorized } from '@smart-home-conx/utils';

dotenv.config();

const MQTT_BROKER_TARGET = `${process.env.PUBLIC_ENDPOINT}:1884`;

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
app.use(cors());
const port = 3333;

app.use((req, res, next) => {
  if (!isAuthorized(req)) {
    log(`Unauthorized request detected!
      hostname=${req.hostname}
      ip=${req.ip}
      originalUrl=${req.originalUrl}
      user-agent=${req.headers['user-agent']}
      auth=${req.headers['authorization']}
    `);
    return res.status(401).send(`Not authorized`);
  }
  return next();
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

const wsProxy = createProxyMiddleware({
  target: MQTT_BROKER_TARGET,
  ws: true,
  // auth: `${process.env.SERVICE_USER}:${process.env.SERVICE_PASSWORD}`,
  headers: {
    'X-Gateway-Secret': 's3cr3t'
  }
});
app.use(wsProxy);

app
  .listen(port, () => log(`running at http://localhost:${port}`))
  .on('upgrade', wsProxy.upgrade);
