import { Controller, Get, Param, Query } from '@nestjs/common';
import { Client, ClientProxy, Ctx, MessagePattern, MqttContext, Payload, Transport } from '@nestjs/microservices';
import { forkJoin, Subject } from 'rxjs';
import { bufferTime, filter, mergeMap, tap, throttleTime } from 'rxjs/operators';
import { MotionSensorService } from './motion-sensor.service';
import { isDocker, log } from '@smart-home-conx/utils';
import { InfluxService } from '@smart-home-conx/influx';
import { MovementSensorDetailModel, NotificationContext, NotificationModelUtil, SensorModel, SensorType } from '@smart-home-conx/api/shared/data-access/models';

@Controller('movement')
export class MotionSensorController {

  messageStream$ = new Subject<any>();

  @Client({ transport: Transport.MQTT, options: { url: isDocker() ? `mqtt://mqtt-broker:1883` : `mqtt://localhost:1883` } })
  mqttClient: ClientProxy;

  @Client({ transport: Transport.TCP, options: { host: isDocker() ? 'device-manager' : 'localhost' } })
  deviceClient: ClientProxy;

  constructor(
    private readonly motionSensorService: MotionSensorService,
    private readonly influx: InfluxService
  ) {
    this.messageStream$.pipe(
      bufferTime(1_000 * 60 * 1), // check period of 1 min
      filter(events => events.length >= 10), // send warning if trigger count is greater than 10 within checked period
    ).subscribe(events => {
      this.mqttClient.emit('telegram/message', `Bewegungsmelder zu oft ausgelöst (${events.length}x)!`);
      this.mqttClient.emit(
        'notification-manager/notification/create',
        NotificationModelUtil.createHighPriority(NotificationContext.SENSOR, 'Bewegungsmelder', `Bewegungsmelder zu oft ausgelöst (${events.length}x)!`)
      );

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
        this.mqttClient.send('alexa/in/automation', { device: 'Philippes Echo Flex', message: 'SHC3MinLicht' }),
        this.mqttClient.send('relais/status', 'on')
      ]))
    ).subscribe(events => {
      // this.mqttClient.emit('telegram/message', `Nachtlicht ausgelöst`);

      log(`triggered`);
      this.mqttClient.emit('log', {source: 'sensor-connector', message: `[ESP_7888034] night light triggered`});
    });
  }

  @MessagePattern('devices/+/movement')
  async create(@Payload() payload: { pin?: number }, @Ctx() context: MqttContext) {
    const chipIdMatch = context.getTopic().match(/devices\/(\d+)/);
    if (!chipIdMatch) {
      throw new Error(`Could not find a chipId. Topic=${context.getTopic()}`);
    }
    const chipId = +chipIdMatch[1];

    const sensor = await this.deviceClient.send<SensorModel>('findSensor', { chipId, type: SensorType.MOVEMENT, pin: +payload.pin }).toPromise();
    const details = sensor.details as MovementSensorDetailModel;
    const warningEnabled = details?.warningEnabled;

    if (warningEnabled) {
      const notificationMessage = this.createNotificationMessage(sensor.name);
      this.mqttClient.emit(
        'notification-manager/notification/create',
        NotificationModelUtil.createHighPriority(NotificationContext.SENSOR, `Bewegungsmelder`, notificationMessage)
      );
      this.mqttClient.emit('telegram/message', notificationMessage);
    }

    this.influx.insert({ measurement: 'movements', fields: { pin: +payload.pin || -1 }, tags: { chipId: chipId.toString() } });

    this.messageStream$.next(payload);
  }

  private createNotificationMessage(name: string): string {
    return `${name} hat Bewegung erkannt`;
  }

  @Get(':chipId/history')
  getHistory(@Param('chipId') chipId: string, @Query('pin') pin: number) {
    if (!pin) {
      pin = -1;
    }
    return this.influx.find(`select * from movements where time > now() - 1d AND chipId = '${chipId}' AND pin = ${pin}`);
  }

}
