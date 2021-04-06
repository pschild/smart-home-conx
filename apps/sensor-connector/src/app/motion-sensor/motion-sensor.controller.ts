import { Controller } from '@nestjs/common';
import { Client, ClientProxy, Ctx, MessagePattern, MqttContext, Payload, Transport } from '@nestjs/microservices';
import { forkJoin, Subject } from 'rxjs';
import { bufferTime, filter, mergeMap, tap, throttleTime } from 'rxjs/operators';
import { MotionSensorService } from './motion-sensor.service';
import { log } from '@smart-home-conx/utils';
import { Telegram } from '@smart-home-conx/messenger-connector';

@Controller()
export class MotionSensorController {

  messageStream$ = new Subject<any>();

  @Client({ transport: Transport.MQTT, options: { url: 'mqtt://192.168.178.28:1883' } })
  mqttClient: ClientProxy;

  constructor(private motionSensorService: MotionSensorService) {
    this.messageStream$.pipe(
      bufferTime(1_000 * 60 * 1), // check period of 1 min
      filter(events => events.length >= 10), // send warning if trigger count is greater than 10 within checked period
    ).subscribe(events => {
      Telegram.sendMessage(`Bewegungsmelder zu oft ausgelöst (${events.length}x)!`);

      log(`PIR sensor triggered ${events.length}x within 1 min`);
      this.mqttClient.emit('log', {source: 'sensor-connector', message: `[ESP_7888034] PIR sensor triggered ${events.length}x within 1 min`});
    });

    this.messageStream$.pipe(
      filter(_ => this.motionSensorService.isNight(new Date())),
      tap(_ => log('Solar time check: OK')),
      throttleTime(1_000 * 60 * 5), // throttle for 5 min
      tap(_ => log(`Throttle check: OK`)),
      mergeMap(() => forkJoin([
        this.mqttClient.send('alexa/in/automation', 'Kleines Licht'),
        this.mqttClient.send('relais/status', 'on')
      ]))
    ).subscribe(events => {
      // Telegram.sendMessage(`Nachtlicht ausgelöst`);

      log(`triggered`);
      this.mqttClient.emit('log', {source: 'sensor-connector', message: `[ESP_7888034] triggered`});
    });
  }

  @MessagePattern('ESP_7888034/movement')
  create(@Payload() payload: any, @Ctx() context: MqttContext) {
    this.mqttClient.emit('log', {source: 'sensor-connector', message: `[ESP_7888034] movement detected`});
    this.messageStream$.next(payload);
  }

}
