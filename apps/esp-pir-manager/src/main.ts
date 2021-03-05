import * as express from 'express';
import { Application } from 'express';
import * as mqtt from 'async-mqtt';
import { isAfter, isBefore } from 'date-fns';
import { forkJoin, fromEvent } from 'rxjs';
import { bufferTime, filter, map, mergeMap, share, tap, throttleTime } from 'rxjs/operators';
import { isDocker, log, ofTopicEquals } from '@smart-home-conx/utils';
import { environment } from './environments/environment';
import { getSolarTimesForDate$, isNight, SolarTimes } from './app/solar-times';
import { Telegram } from '@smart-home-conx/messenger-connector';

const app: Application = express();
const port = 9052;

const mqttClient = mqtt.connect(isDocker() ? `http://mqtt-broker:1883` : `http://localhost:1883`, { clientId: 'esp-pir-manager' });
// const mqttClient = mqtt.connect('http://broker.emqx.io', { clientId: 'esp-pir-manager' }); // testing
mqttClient.subscribe('ESP_7888034/movement');

const messages$ = fromEvent(mqttClient, 'message').pipe(
  map(([topic, message]) => [topic, message.toString()]),
  tap(([topic, message]) => log(`Received MQTT message with topic=${topic}, message=${message}`)),
  share() // share the same observable for each topic and avoid multiple emits
);

messages$.pipe(
  bufferTime(1_000 * 60 * 1), // check period of 1 min
  filter(events => events.length >= 10), // send warning if trigger count is greater than 10 within checked period of 1 min
  tap(events => log(`PIR sensor triggered ${events.length}x within 1 min!`))
).subscribe(events => Telegram.sendMessage(`Bewegungsmelder zu oft ausgelöst (${events.length}x)!`));

// movements
messages$.pipe(
  ofTopicEquals('ESP_7888034/movement'),
  filter(_ => isNight(new Date())),
  // mergeMap(([topic, message]) => getSolarTimesForDate$(new Date())),
  // filter((sunriseSunsetData: SolarTimes) => isAfter(new Date(), sunriseSunsetData.civilTwilightEnd) || isBefore(new Date(), sunriseSunsetData.civilTwilightBegin)),
  // filter(([topic, message]) => getHours(new Date()) >= 22 || getHours(new Date()) <= 6), // only trigger between 22:00 and 06:59
  tap(_ => log('Passed solar time check...')),
  throttleTime(1000 * 60 * 5), // throttle for 5 min
  tap(_ => log('Passed throttle check...')),
  mergeMap(() => forkJoin([
    mqttClient.publish('alexa/in/automation', 'Kleines Licht'),
    mqttClient.publish('relais/status', 'on')
  ])),
  tap(publishedTopics => log(`Published MQTT ${publishedTopics.length} messages...`)),
  // tap(_ => Telegram.sendMessage(`Nachtlicht ausgelöst`))
).subscribe(result => log(`Done.`));

mqttClient.on('connect', () => {
  log(`connected with MQTT broker`);

  app.listen(port, () => {
    log(`running at http://localhost:${port}`);
    log(`running in ${environment.production ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  });
});
