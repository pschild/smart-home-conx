import * as TelegramBot from 'node-telegram-bot-api';
import * as dotenv from 'dotenv';

dotenv.config();

export namespace Telegram {

  // polling: true leads to 409 errors. Use singleton instance in apps?
  const botInstance = new TelegramBot(process.env.TELEGRAM_API_TOKEN/*, { polling: true }*/);

  export function sendMessage(message: string): Promise<any[]> {
    return Promise.all(getReceiverIds().map(id => botInstance.sendMessage(id, message)));
  }

  export function sendLocation(lat: number, lon: number): Promise<any> {
    return Promise.all(getReceiverIds().map(id => botInstance.sendLocation(id, lat, lon)));
  }

  function getReceiverIds(): string[] {
    return process.env.TELEGRAM_RECEIVER_IDS.split(',');
  }

}
