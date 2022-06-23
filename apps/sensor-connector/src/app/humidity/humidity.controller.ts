import { Controller, Get, Param, Query } from '@nestjs/common';
import { Client, ClientProxy, Ctx, MessagePattern, MqttContext, Payload, Transport } from '@nestjs/microservices';
import { DeviceModelUtil, HumiditySensorDetailModel, HumiditySensorPayload, NotificationContext, NotificationModelUtil, SensorModel, SensorType } from '@smart-home-conx/api/shared/data-access/models';
import { isDocker } from '@smart-home-conx/utils';
import { EspPayloadPipe } from '../esp-payload.pipe';
import { HumidityService } from './humidity.service';

@Controller('humidity')
export class HumiditySensorController {

  @Client({ transport: Transport.MQTT, options: { url: isDocker() ? `mqtt://mqtt-broker:1883` : `mqtt://localhost:1883` } })
  mqttClient: ClientProxy;

  @Client({ transport: Transport.TCP, options: { host: isDocker() ? 'device-manager' : 'localhost' } })
  deviceClient: ClientProxy;

  constructor(
    private readonly service: HumidityService
  ) {}

  @MessagePattern('devices/+/humidity')
  async create(@Payload(EspPayloadPipe) payload: HumiditySensorPayload, @Ctx() context: MqttContext) {
    const chipId = DeviceModelUtil.parseChipId(context.getTopic());

    const sensor = await this.deviceClient.send<SensorModel>('findSensor', { chipId, type: SensorType.HUMIDITY, pin: payload.pin }).toPromise();
    const details = sensor.details as HumiditySensorDetailModel;
    const aberrance = details?.aberrance || 0;
    const warningEnabled = details?.warningEnabled;
    const warningCriteria = details?.warningCriteria;
    const warningLimit = details?.warningLimit;

    const correctedValue = payload.value + aberrance;
    this.mqttClient.emit(`sensor-connector/devices/${chipId}/humidity/corrected`, { value: correctedValue });

    if (warningEnabled) {
      if (
        (warningCriteria === 'GREATER' && payload.value > warningLimit)
        || (warningCriteria === 'LOWER' && payload.value < warningLimit)
      ) {
        const notificationMessage = this.createNotificationMessage(payload.value, details, sensor.name);
        this.mqttClient.emit(
          'notification-manager/notification/create',
          NotificationModelUtil.createHighPriority(NotificationContext.SENSOR, `Luftfeuchtigkeit`, notificationMessage)
        );
        this.mqttClient.emit('telegram/message', notificationMessage);
      }
    }
    this.service.create(chipId, payload, correctedValue);
  }

  private createNotificationMessage(value: number, details: HumiditySensorDetailModel, name: string): string {
    return details.warningCriteria === 'GREATER'
      ? `Luftfeuchtigkeit zu hoch: ${value}%/${details.warningLimit}% (${name || '-'})`
      : `Luftfeuchtigkeit zu niedrig: ${value}%/${details.warningLimit}% (${name || '-'})`;
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
