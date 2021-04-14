import { Controller, Get } from '@nestjs/common';
import { Client, ClientProxy, Ctx, MessagePattern, MqttContext, Payload, Transport } from '@nestjs/microservices';
import { forkJoin, Subject } from 'rxjs';
import { bufferTime, filter, mergeMap, tap, throttleTime } from 'rxjs/operators';
import { MotionSensorService } from './motion-sensor.service';
import { isDocker, log } from '@smart-home-conx/utils';
import { InfluxService } from '@smart-home-conx/influx';

@Controller()
export class MotionSensorController {

  messageStream$ = new Subject<any>();

  @Client({ transport: Transport.MQTT, options: { url: isDocker() ? `mqtt://mqtt-broker:1883` : `mqtt://localhost:1883` } })
  mqttClient: ClientProxy;

  constructor(
    private readonly motionSensorService: MotionSensorService,
    private readonly influx: InfluxService
  ) {
    this.messageStream$.pipe(
      bufferTime(1_000 * 60 * 1), // check period of 1 min
      filter(events => events.length >= 10), // send warning if trigger count is greater than 10 within checked period
    ).subscribe(events => {
      this.mqttClient.emit('telegram/message', `Bewegungsmelder zu oft ausgelöst (${events.length}x)!`);

      log(`PIR sensor triggered ${events.length}x within 1 min`);
      this.mqttClient.emit('log', {source: 'sensor-connector', message: `[ESP_7888034] PIR sensor triggered ${events.length}x within 1 min`});
    });

    this.messageStream$.pipe(
      filter(_ => this.motionSensorService.isNight(new Date())),
      tap(_ => log('Solar time check: OK')),
      throttleTime(1_000 * 60 * 5), // throttle for 5 min
      tap(_ => log(`Throttle check: OK`)),
      mergeMap(() => forkJoin([
        // TODO: replace static device name
        this.mqttClient.send('alexa/in/automation', { device: 'Philippes Echo Flex', message: 'Kleines Licht' }),
        this.mqttClient.send('relais/status', 'on')
      ]))
    ).subscribe(events => {
      // this.mqttClient.emit('telegram/message', `Nachtlicht ausgelöst`);

      log(`triggered`);
      this.mqttClient.emit('log', {source: 'sensor-connector', message: `[ESP_7888034] night light triggered`});
    });
  }

  @MessagePattern('+/movement')
  create(@Payload() payload: any, @Ctx() context: MqttContext) {
    const topic = context.getTopic();
    const deviceId = topic.substring(0, topic.lastIndexOf('/'));
    this.influx.insert({ measurement: 'movements', fields: { message: `movement detected` }, tags: { deviceId } });

    this.messageStream$.next(payload);
  }

  @Get('history')
  getHistory() {
    return this.influx.find(`select * from movements`);
  }

}
