import * as express from 'express';
import { Application } from 'express';
import { json } from 'body-parser';
const { exec } = require('child_process');
import * as path from 'path';
import { promises as fsPromises } from 'fs';
import * as mqtt from 'async-mqtt';
import { EMPTY, fromEvent, Observable } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { log, ofTopicEquals, isAuthorized, isDocker } from '@smart-home-conx/utils';
import * as dotenv from 'dotenv';
import { environment } from './environments/environment';

dotenv.config();

const mqttClient = mqtt.connect(isDocker() ? `http://mqtt-broker:1883` : `http://localhost:1883`, { clientId: 'alexa-connector' });
// const mqttClient = mqtt.connect('http://broker.emqx.io', { clientId: 'alexa-connector' }); // testing
mqttClient.subscribe('alexa/in/automation');
mqttClient.subscribe('alexa/in/speak');
mqttClient.subscribe('alexa/in/textcommand');

const app: Application = express();
app.use(json());
const port = 9072;

// app.use((req, res, next) => {
//   if (!isAuthorized(req)) {
//     return res.status(401).send(`Not authorized`);
//   }
//   return next();
// });

function execCommand(device: string, command: { action: 'speak' | 'automation' | 'textcommand', param: string }): Observable<string> {
  return new Observable<string>(subscriber => {
    let commandStr = `./assets/alexa-remote-control/alexa_remote_control.sh -d '${device}'`;
    switch (command.action) {
      case 'speak':
        commandStr += ` -e speak:'${command.param}'`;
        break;
      case 'automation':
        commandStr += ` -e automation:'${command.param}'`;
        break;
      case 'textcommand':
        commandStr += ` -e textcommand:'${command.param}'`;
        break;
    }

    log(`executing command: ${commandStr}`);
    exec(commandStr, (error, stdout, stderr) => {
      if (error) {
        subscriber.error(error);
      }
      if (stderr) {
        subscriber.error(stderr.toString());
      }
      subscriber.next(stdout);
      subscriber.complete();
    });
  }).pipe(
    catchError(error => {
      console.error('exec errored with error: ', error);
      return EMPTY;
    })
  );
}

const messages$ = fromEvent(mqttClient, 'message').pipe(
  map(([topic, message]) => [topic, message.toString()]),
  tap(([topic, message]) => log(`Received MQTT message with topic=${topic}, message=${message}`))
);

// automation commands
messages$.pipe(
  ofTopicEquals('alexa/in/automation'),
  mergeMap(([topic, message]) => execCommand('Philippes Echo Flex', { action: 'automation', param: message }))
).subscribe(result => log(`Result: ${result}`));

// speak commands
messages$.pipe(
  ofTopicEquals('alexa/in/speak'),
  map(([topic, message]) => JSON.parse(message)),
  mergeMap(message => execCommand(message.device, { action: 'speak', param: message.message }))
).subscribe(result => log(`Result: ${result}`));

// textcommand commands
messages$.pipe(
  ofTopicEquals('alexa/in/textcommand'),
  map(([topic, message]) => JSON.parse(message)),
  mergeMap(message => execCommand(message.device, { action: 'textcommand', param: message.message }))
).subscribe(result => log(`Result: ${result}`));

app.post('/speak', (req, res) => {
  const { device, message } = req.body;
  mqttClient.publish('alexa/in/speak', JSON.stringify({ device, message }));
  res.status(200).end();
});

app.post('/textcommand', (req, res) => {
  const { device, message } = req.body;
  mqttClient.publish('alexa/in/textcommand', JSON.stringify({ device, message }));
  res.status(200).end();
});

app.get('/show-alexa-devices', (req, res) => {
  exec(`./assets/alexa-remote-control/alexa_remote_control.sh -a`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).json({ status: 'error', error });
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return res.status(500).json({ status: 'stderr', stderr });
    }
    log(`stdout: ${stdout}`);
    return res.status(200).json({ status: 'success', stdout });
  });
});

app.get('/devices', async (req, res) => {
  try {
    const content = await fsPromises.readFile(path.join('/tmp', '.alexa.devicelist.json'), 'utf8');
    return res.status(200).json(JSON.parse(content));
  } catch (err) {
    return res.status(500).json({ error: err && err.message ? err.message : `Could not read devicelist.` });
  }
});

mqttClient.on('connect', () => {
  log(`connected with MQTT broker`);

  app.listen(port, () => {
    log(`running at http://localhost:${port}`);
    log(`running in ${environment.production ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  });
});
