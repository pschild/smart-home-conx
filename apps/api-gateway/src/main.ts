import * as express from 'express';
import * as cors from 'cors';
import { Application } from 'express';
import { json, urlencoded } from 'body-parser';
import { createProxyMiddleware } from 'http-proxy-middleware';
import * as expressJwt from 'express-jwt';
import * as dotenv from 'dotenv';
import { log } from '@smart-home-conx/utils';
import { UnauthorizedError, authErrorHandler, authenticate } from '@smart-home-conx/auth';

dotenv.config();

const MQTT_BROKER_TARGET = `http://mqtt-broker:1884`;

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
  try {
    const token = authenticate(username, password);
    return res.json({ token });
  } catch(err) {
    log(`Unauthorized request detected!
      hostname=${req.hostname}
      ip=${req.ip}
      originalUrl=${req.originalUrl}
      user-agent=${req.headers['user-agent']}
      auth=${req.headers['authorization']}
    `);
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

const wsProxy = createProxyMiddleware({
  target: MQTT_BROKER_TARGET,
  ws: true,
  // auth: `${process.env.SERVICE_USER}:${process.env.SERVICE_PASSWORD}`,
  headers: {
    'X-Gateway-Secret': 's3cr3t'
  }
});
app.use(wsProxy);

app.use(authErrorHandler);

app
  .listen(port, () => log(`running at http://localhost:${port}`))
  .on('upgrade', wsProxy.upgrade);
