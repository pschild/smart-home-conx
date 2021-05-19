import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { Client, ClientProxy, Ctx, MessagePattern, MqttContext, Payload, Transport } from '@nestjs/microservices';
import { isDocker } from '@smart-home-conx/utils';
import { DeviceService } from './device.service';
import { CreateDeviceDto, UpdateDeviceDto } from './dto';
import { Device } from './entity/device.entity';
import { ConnectionStatus } from './enum/connection-status.enum';

@Controller()
export class DeviceController {

  @Client({ transport: Transport.MQTT, options: { url: isDocker() ? `mqtt://mqtt-broker:1883` : `mqtt://localhost:1883` } })
  mqttClient: ClientProxy;

  constructor(private readonly deviceService: DeviceService) {}

  @Post()
  create(@Body() createEspDto: CreateDeviceDto) {
    return this.deviceService.create(createEspDto);
  }

  @Get()
  @MessagePattern('loadDeviceList')
  findAll() {
    return this.deviceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') _id: string) {
    return this.deviceService.findOne(_id);
  }

  @Patch(':id')
  update(@Param('id') _id: string, @Body() updateEspDto: UpdateDeviceDto) {
    return this.deviceService.update(_id, updateEspDto);
  }

  @Delete(':id')
  remove(@Param('id') _id: string) {
    return this.deviceService.remove(_id);
  }

  @MessagePattern('$SYS/+/new/clients')
  async onMqttClientConnected(@Payload() payload: string, @Ctx() context: MqttContext) {
    if (payload.startsWith('ESP_')) {
      const chipId = +payload.replace('ESP_', '');
      const device = await this.deviceService.findByChipId(chipId);
      this.updateConnectionStatus(device, ConnectionStatus.ONLINE);

      if (!device.batteryPowered) {
        this.mqttClient.emit('telegram/message', `✔️ "${payload}"`);
      }
      this.mqttClient.emit('log', {source: 'device-manager', message: `"${payload}" connected`});
    }
  }

  @MessagePattern('$SYS/+/disconnect/clients')
  async onMqttClientDisconnected(@Payload() payload: string, @Ctx() context: MqttContext) {
    if (payload.startsWith('ESP_')) {
      const chipId = +payload.replace('ESP_', '');
      const device = await this.deviceService.findByChipId(chipId);
      this.updateConnectionStatus(device, ConnectionStatus.OFFLINE);

      if (!device.batteryPowered) {
        this.mqttClient.emit('telegram/message', `❌ "${payload}"`);
      }
      this.mqttClient.emit('log', {source: 'device-manager', message: `"${payload}" disconnected`});
    }
  }

  private updateConnectionStatus(device: Device, newStatus: ConnectionStatus): void {
    this.deviceService.update(device._id.toString(), { connectionStatus: newStatus, connectionStatusChangedAt: new Date() });
  }
}
