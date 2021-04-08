import { Injectable } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';

@Injectable()
export class TelegramService {

  private instance = new TelegramBot(process.env.TELEGRAM_API_TOKEN/*, { polling: true }*/);

  sendMessage(message: string): Promise<any> {
    return Promise.all(
      this.getReceiverIds().map(id => this.instance.sendMessage(id, message))
    );
  }

  sendLocation(lat: number, lon: number): Promise<any> {
    return Promise.all(
      this.getReceiverIds().map(id => this.instance.sendLocation(id, lat, lon))
    );
  }

  private getReceiverIds(): string[] {
    return process.env.TELEGRAM_RECEIVER_IDS.split(',');
  }
  
}
