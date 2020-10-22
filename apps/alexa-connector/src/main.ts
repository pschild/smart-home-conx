import * as express from 'express';
import { Application } from 'express';
const { exec } = require('child_process');
import * as mqtt from 'async-mqtt';
import { EMPTY, fromEvent, Observable } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { log, ofTopicEquals } from '@smart-home-conx/utils';

const app: Application = express();
const port = 9072;

const mqttClient = mqtt.connect('http://mqtt-broker:1883', { clientId: 'alexa-connector' });
// const mqttClient = mqtt.connect('http://broker.emqx.io', { clientId: 'alexa-connector' }); // testing
mqttClient.subscribe('alexa/in/automation');
mqttClient.subscribe('alexa/in/speak');

function execCommand(device: string, command: { action: 'speak' | 'automation', param: string }): Observable<string> {
  return new Observable<string>(subscriber => {
    let commandStr = `./assets/alexa-remote-control/alexa_remote_control.sh -d '${device}'`;
    switch (command.action) {
      case 'speak':
        commandStr += ` -e speak:'${command.param}'`;
        break;
      case 'automation':
        commandStr += ` -e automation:'${command.param}'`;
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
  mergeMap(([topic, message]) => execCommand('Philippes Echo Flex', { action: 'speak', param: message }))
).subscribe(result => log(`Result: ${result}`));

app.get('/speak/:speech', (req, res) => {
  mqttClient.publish('alexa/in/speak', req.params.speech);
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

mqttClient.on('connect', () => {
  log(`connected with MQTT broker`);

  app.listen(port, () => {
    log(`running at http://localhost:${port}`);
  });
});
