import { Controller, Get, Param } from '@nestjs/common';
import { Client, ClientProxy, Ctx, MessagePattern, MqttContext, Payload, Transport } from '@nestjs/microservices';
import { DeviceModelUtil, NotificationContext, NotificationModelUtil, SensorModel, SensorType, VoltageSensorDetailModel, VoltageSensorPayload } from '@smart-home-conx/api/shared/data-access/models';
import { isDocker } from '@smart-home-conx/utils';
import { EspPayloadPipe } from '../esp-payload.pipe';
import { VoltageService } from './voltage.service';

@Controller('voltage')
export class VoltageController {

  @Client({ transport: Transport.MQTT, options: { url: isDocker() ? `mqtt://mqtt-broker:1883` : `mqtt://localhost:1883` } })
  mqttClient: ClientProxy;

  @Client({ transport: Transport.TCP, options: { host: isDocker() ? 'device-manager' : 'localhost' } })
  deviceClient: ClientProxy;

  constructor(
    private readonly service: VoltageService
  ) {}

  @MessagePattern('devices/+/voltage')
  async create(@Payload(EspPayloadPipe) payload: VoltageSensorPayload, @Ctx() context: MqttContext) {
    const chipId = DeviceModelUtil.parseChipId(context.getTopic());

    const sensor = await this.deviceClient.send<SensorModel>('findSensor', { chipId, type: SensorType.VOLTAGE }).toPromise();
    const details = sensor.details as VoltageSensorDetailModel;
    const warningEnabled = details?.warningEnabled;
    const warningCriteria = details?.warningCriteria;
    const warningLimit = details?.warningLimit;

    if (warningEnabled) {
      if (
        (warningCriteria === 'GREATER' && payload.value > warningLimit)
        || (warningCriteria === 'LOWER' && payload.value < warningLimit)
      ) {
        const notificationMessage = this.createNotificationMessage(payload.value, details, sensor.name, chipId);
        this.mqttClient.emit(
          'notification-manager/notification/create',
          NotificationModelUtil.createHighPriority(NotificationContext.SENSOR, `Akkustand`, notificationMessage)
        );
        this.mqttClient.emit('telegram/message', notificationMessage);
      }
    }
    this.service.create(chipId, payload);
  }

  private createNotificationMessage(value: number, details: VoltageSensorDetailModel, name: string, chipId: string): string {
    return details.warningCriteria === 'GREATER'
      ? `Spannung zu hoch: ${value}V/${details.warningLimit}V (ESP ${chipId}, ${name || '-'})`
      : `Spannung zu niedrig: ${value}V/${details.warningLimit}V (ESP ${chipId}, ${name || '-'})`;
  }

  @Get(':chipId/history')
  getHistory(@Param('chipId') chipId: string) {
    return this.service.getHistory(chipId);
  }

  @Get(':chipId/latest')
  getLatest(@Param('chipId') chipId: string) {
    return this.service.getLatest(chipId);
  }

}
