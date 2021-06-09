import { Body, Controller, Get, HttpException, HttpStatus, Post } from '@nestjs/common';
import { Client, ClientProxy, Ctx, MessagePattern, MqttContext, Payload, Transport } from '@nestjs/microservices';
import { isDocker } from '@smart-home-conx/utils';
import { catchError, map, switchMap } from 'rxjs/operators';
import { CommandService } from './command.service';
import { DeviceService } from './device.service';

@Controller()
export class AppController {

  @Client({ transport: Transport.MQTT, options: { url: isDocker() ? `mqtt://mqtt-broker:1883` : `mqtt://localhost:1883` } })
  mqttClient: ClientProxy;

  constructor(
    private readonly commandService: CommandService,
    private readonly deviceService: DeviceService
  ) {}

  @MessagePattern('alexa/in/automation')
  automation(@Payload() payload: { device: string; message: string; }, @Ctx() context: MqttContext) {
    this.mqttClient.emit('log', {source: 'alexa-connector', message: `automation: ${JSON.stringify(payload)}`});
    return this.commandService.execute(payload.device, { action: 'automation', param: payload.message });
  }

  @MessagePattern('alexa/in/speak')
  speak(@Payload() payload: { device: string; message: string; }, @Ctx() context: MqttContext) {
    this.mqttClient.emit('log', {source: 'alexa-connector', message: `speak: ${JSON.stringify(payload)}`});
    return this.commandService.execute(payload.device, { action: 'speak', param: payload.message });
  }

  @MessagePattern('alexa/in/textcommand')
  textcommand(@Payload() payload: { device: string; message: string; }, @Ctx() context: MqttContext) {
    this.mqttClient.emit('log', {source: 'alexa-connector', message: `textcommand: ${JSON.stringify(payload)}`});
    return this.commandService.execute(payload.device, { action: 'textcommand', param: payload.message });
  }

  @Post('automation')
  automationRest(@Body() payload: { device: string; message: string; }) {
    const device = payload.device;
    const message = decodeURI(payload.message);
    this.mqttClient.emit('alexa/in/automation', { device, message });
  }

  @Post('speak')
  speakRest(@Body() payload: { device: string; message: string; }) {
    const device = payload.device;
    const message = decodeURI(payload.message);
    this.mqttClient.emit('alexa/in/speak', { device, message });
  }

  @Post('textcommand')
  textcommandRest(@Body() payload: { device: string; message: string; }) {
    const device = payload.device;
    const message = decodeURI(payload.message);
    this.mqttClient.emit('alexa/in/textcommand', { device, message });
  }

  @Get('show-alexa-devices')
  loadAvailableDevices() {
    return this.deviceService.loadAvailableDevices().pipe(
      catchError(err => {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      }),
      map(stdout => ({ status: 'success', stdout }))
    );
  }

  @Get('devices')
  readDeviceList() {
    return this.deviceService.readDeviceList().pipe(
      catchError(err => this.deviceService.loadAvailableDevices().pipe(switchMap(_ => this.deviceService.readDeviceList()))),
      catchError(err => {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      }),
      map(content => JSON.parse(content))
    );
  }

}
