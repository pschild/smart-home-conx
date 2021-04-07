import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import * as TelegramBot from 'node-telegram-bot-api';
import * as dotenv from 'dotenv';
import { Client, ClientProxy, Ctx, MessagePattern, MqttContext, Payload, Transport } from '@nestjs/microservices';
import { isDocker } from '@smart-home-conx/utils';

dotenv.config();

@Controller()
export class AppController {

  private botInstance = new TelegramBot(process.env.TELEGRAM_API_TOKEN/*, { polling: true }*/);

  @Client({ transport: Transport.MQTT, options: { url: isDocker() ? `mqtt://mqtt-broker:1883` : `mqtt://localhost:1883` } })
  mqttClient: ClientProxy;

  constructor(private readonly appService: AppService) {}

  @MessagePattern('telegram/message')
  sendMessage(@Payload() payload: string, @Ctx() context: MqttContext) {
    return Promise.all(
      this.getReceiverIds().map(id => this.botInstance.sendMessage(id, payload))
    );
  }

  private getReceiverIds(): string[] {
    return process.env.TELEGRAM_RECEIVER_IDS.split(',');
  }
}
