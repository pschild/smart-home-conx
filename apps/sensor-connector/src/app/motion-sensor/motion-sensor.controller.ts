import { Controller, Get, Param, Query } from '@nestjs/common';
import { Client, ClientProxy, Ctx, MessagePattern, MqttContext, Payload, Transport } from '@nestjs/microservices';
import { forkJoin, Subject } from 'rxjs';
import { bufferTime, filter, mergeMap, tap, throttleTime } from 'rxjs/operators';
import { MotionSensorService } from './motion-sensor.service';
import { isDocker, log } from '@smart-home-conx/utils';
import { DeviceModelUtil, MovementSensorDetailModel, MovementSensorPayload, NotificationContext, NotificationModelUtil, SensorModel, SensorType } from '@smart-home-conx/api/shared/data-access/models';
import { EspPayloadPipe } from '../esp-payload.pipe';
import { format, isAfter, isBefore } from 'date-fns';
import * as SunCalc from 'suncalc2';

@Controller('movement')
export class MotionSensorController {

  messageStream$ = new Subject<any>();

  @Client({ transport: Transport.MQTT, options: { url: isDocker() ? `mqtt://mqtt-broker:1883` : `mqtt://localhost:1883` } })
  mqttClient: ClientProxy;

  @Client({ transport: Transport.TCP, options: { host: isDocker() ? 'device-manager' : 'localhost' } })
  deviceClient: ClientProxy;

  constructor(
    private readonly service: MotionSensorService
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
      filter(_ => this.isNight(new Date())),
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
  async create(@Payload(EspPayloadPipe) payload: MovementSensorPayload, @Ctx() context: MqttContext) {
    const chipId = DeviceModelUtil.parseChipId(context.getTopic());

    const sensor = await this.deviceClient.send<SensorModel>('findSensor', { chipId, type: SensorType.MOVEMENT, pin: payload.pin }).toPromise();
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
    this.service.create(chipId, payload);

    this.messageStream$.next(payload);
  }

  private createNotificationMessage(name: string): string {
    return `${name} hat Bewegung erkannt`;
  }

  /**
   * Checks whether the time of the given date is between the times for sunset and sunrise.
   * In other words, it checks, whether it is "night"/"dark".
   */
   private isNight(date: Date): boolean {
    const { dusk, dawn } = SunCalc.getTimes(date, process.env.HOME_POSITION_LAT, process.env.HOME_POSITION_LON);
    log(`SunCalc times for ${format(date, 'yyyy-MM-dd HH:mm')}: ${JSON.stringify(SunCalc.getTimes(date, process.env.HOME_POSITION_LAT, process.env.HOME_POSITION_LON))}`);
    log(`isNight=${isAfter(date, new Date(dusk)) || isBefore(date, new Date(dawn))}`);
    return isAfter(date, new Date(dusk)) || isBefore(date, new Date(dawn));
  }

  @Get(':chipId/history')
  getHistory(@Param('chipId') chipId: string, @Query('pin') pin: number) {
    return this.service.getHistory(chipId, pin);
  }

}
