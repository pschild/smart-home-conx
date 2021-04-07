import { Body, Controller, Get, HttpException, HttpStatus, Post } from '@nestjs/common';
import { Client, ClientProxy, Ctx, MessagePattern, MqttContext, Payload, Transport } from '@nestjs/microservices';
import { isDocker } from '@smart-home-conx/utils';
import { catchError, map, switchMap } from 'rxjs/operators';

import { AppService } from './app.service';

@Controller()
export class AppController {

  @Client({ transport: Transport.MQTT, options: { url: isDocker() ? `mqtt://mqtt-broker:1883` : `mqtt://localhost:1883` } })
  mqttClient: ClientProxy;

  constructor(private readonly appService: AppService) {}

  @MessagePattern('alexa/in/automation')
  automation(@Payload() payload: any, @Ctx() context: MqttContext) {
    console.log(`automation`, payload);
    this.mqttClient.emit('log', {source: 'alexa-connector', message: `automation: ${JSON.stringify(payload)}`});

    // TODO: replace static name with payload.device
    return this.appService.execCommand('Philippes Echo Flex', { action: 'automation', param: payload.message });
  }

  @MessagePattern('alexa/in/speak')
  speak(@Payload() payload: any, @Ctx() context: MqttContext) {
    console.log(`speak`, payload);
    this.mqttClient.emit('log', {source: 'alexa-connector', message: `speak: ${JSON.stringify(payload)}`});

    // TODO: replace static name with payload.device
    return this.appService.execCommand('Philippes Echo Flex', { action: 'speak', param: payload.message });
  }

  @MessagePattern('alexa/in/textcommand')
  textcommand(@Payload() payload: any, @Ctx() context: MqttContext) {
    console.log(`textcommand`, payload);
    this.mqttClient.emit('log', {source: 'alexa-connector', message: `textcommand: ${JSON.stringify(payload)}`});

    // TODO: replace static name with payload.device
    return this.appService.execCommand('Philippes Echo Flex', { action: 'textcommand', param: payload.message });
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
    return this.appService.loadAvailableDevices().pipe(
      catchError(err => {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      }),
      map(stdout => ({ status: 'success', stdout }))
    );
  }

  @Get('devices')
  readDeviceList() {
    return this.appService.readDeviceList().pipe(
      catchError(err => this.appService.loadAvailableDevices().pipe(switchMap(_ => this.appService.readDeviceList()))),
      catchError(err => {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      }),
      map(content => JSON.parse(content))
    );
  }

}
