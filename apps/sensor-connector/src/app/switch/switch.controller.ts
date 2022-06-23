import { Controller, Get, Param, Query } from '@nestjs/common';
import { Client, ClientProxy, Ctx, MessagePattern, MqttContext, Payload, Transport } from '@nestjs/microservices';
import { DeviceModelUtil, NotificationContext, NotificationModelUtil, SensorModel, SensorType, SwitchSensorDetailModel, SwitchSensorPayload } from '@smart-home-conx/api/shared/data-access/models';
import { isDocker } from '@smart-home-conx/utils';
import { lastValueFrom } from 'rxjs';
import { EspPayloadPipe } from '../esp-payload.pipe';
import { SwitchService } from './switch.service';

@Controller('switch')
export class SwitchController {

  @Client({ transport: Transport.MQTT, options: { url: isDocker() ? `mqtt://mqtt-broker:1883` : `mqtt://localhost:1883` } })
  mqttClient: ClientProxy;

  @Client({ transport: Transport.TCP, options: { host: isDocker() ? 'device-manager' : 'localhost' } })
  deviceClient: ClientProxy;

  constructor(
    private readonly service: SwitchService
  ) {}

  @MessagePattern('devices/+/switch')
  async create(@Payload(EspPayloadPipe) payload: SwitchSensorPayload, @Ctx() context: MqttContext) {
    const chipId = DeviceModelUtil.parseChipId(context.getTopic());

    const sensor = await this.deviceClient.send<SensorModel>('findSensor', { chipId, type: SensorType.SWITCH, pin: payload.pin }).toPromise();
    const details = sensor.details as SwitchSensorDetailModel;
    const warningEnabled = details?.warningEnabled;
    const warningCriteria = details?.warningCriteria;

    if (warningEnabled) {
      /**
       * 1 = Schalter ist geschlossen
       * 0 = Schalter ist geoeffnet
       * Achtung: Je nach Anwendungsfall und Positionierung des Schalters kann sich die Logik umdrehen.
       */
      const latest = await lastValueFrom(this.service.getLatest(chipId, payload.pin));
      if (
        payload.value !== latest?.value &&
        (
          payload.value === 1 && warningCriteria === 'CLOSED'
          || payload.value === 0 && warningCriteria === 'OPENED'
        )
      ) {
        const notificationMessage = this.createNotificationMessage(warningCriteria, sensor.name);
        this.mqttClient.emit(
          'notification-manager/notification/create',
          NotificationModelUtil.createHighPriority(NotificationContext.SENSOR, `Schalter`, notificationMessage)
        );
        this.mqttClient.emit('telegram/message', notificationMessage);
      }
    }
    this.service.create(chipId, payload);
  }

  private createNotificationMessage(warningCriteria: 'OPENED' | 'CLOSED', name: string): string {
    return warningCriteria === 'OPENED'
      ? `${name} ist geöffnet worden`
      : `${name} ist geschlossen worden`;
  }

  @Get(':chipId/history')
  getHistory(@Param('chipId') chipId: string, @Query('pin') pin: number) {
    return this.service.getHistory(chipId, pin);
  }

  @Get(':chipId/latest')
  getLatest(@Param('chipId') chipId: string, @Query('pin') pin: number) {
    return this.service.getLatest(chipId, pin);
  }

}
