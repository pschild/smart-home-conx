import * as express from 'express';
import { Application } from 'express';
import * as mqtt from 'async-mqtt';
import { isAfter, isBefore } from 'date-fns';
import { forkJoin, fromEvent } from 'rxjs';
import { filter, map, mergeMap, tap, throttleTime } from 'rxjs/operators';
import { log, ofTopicEquals } from '@smart-home-conx/utils';
import { environment } from './environments/environment';
import { getSolarTimesForDate$, SolarTimes } from './app/solar-times';

const app: Application = express();
const port = 9052;

const mqttClient = mqtt.connect('http://mqtt-broker:1883', { clientId: 'esp-pir-manager' });
// const mqttClient = mqtt.connect('http://broker.emqx.io', { clientId: 'esp-pir-manager' }); // testing
mqttClient.subscribe('ESP_7888034/movement');

const messages$ = fromEvent(mqttClient, 'message').pipe(
  map(([topic, message]) => [topic, message.toString()]),
  tap(([topic, message]) => log(`Received MQTT message with topic=${topic}, message=${message}`))
);

// movements
messages$.pipe(
  ofTopicEquals('ESP_7888034/movement'),
  tap(_ => log('Detected topic...')),
  mergeMap(([topic, message]) => getSolarTimesForDate$(new Date())),
  filter((sunriseSunsetData: SolarTimes) => isAfter(new Date(), sunriseSunsetData.sunset) || isBefore(new Date(), sunriseSunsetData.sunrise)),
  // filter(([topic, message]) => getHours(new Date()) >= 22 || getHours(new Date()) <= 6), // only trigger between 22:00 and 06:59
  tap(_ => log('Passed solar time check...')),
  throttleTime(1000 * 60 * 5), // throttle for 5 min
  tap(_ => log('Passed throttle check...')),
  mergeMap(() => forkJoin([
    mqttClient.publish('alexa/in/automation', 'Kleines Licht'),
    mqttClient.publish('relais/status', 'on')
  ])),
  tap(publishedTopics => log(`Published MQTT ${publishedTopics.length} messages...`))
).subscribe(result => log(`Result: [${result}]`));

mqttClient.on('connect', () => {
  log(`connected with MQTT broker`);

  app.listen(port, () => {
    log(`running at http://localhost:${port}`);
    log(`running in ${environment.production ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  });
});
