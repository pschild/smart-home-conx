import * as express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import * as dotenv from 'dotenv';

dotenv.config();

const API_GATEWAY_PORT = 3333;
const MQTT_BROKER_TARGET = `${process.env.PUBLIC_ENDPOINT}:1884`;

const routes = [
  {
    "route": "/adesso",
    "address": "http://adesso-commuter-server:9062"
  },
  {
    "route": "/alexa",
    "address": "http://alexa-connector:9072"
  }
];

const app = express();
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

const server = app.listen(API_GATEWAY_PORT);
server.on('upgrade', wsProxy.upgrade);
