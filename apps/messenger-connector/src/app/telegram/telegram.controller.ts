import { Controller } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { Ctx, MessagePattern, MqttContext, Payload } from '@nestjs/microservices';
import { PreferenceService } from '@smart-home-conx/preference';

@Controller()
export class TelegramController {

  constructor(
    private readonly telegramService: TelegramService,
    private readonly preferenceService: PreferenceService
  ) {}

  @MessagePattern('telegram/message')
  async sendMessage(@Payload() payload: string, @Ctx() context: MqttContext) {
    if (await this.preferenceService.getValueFor('telegramEnabled')) {
      return this.telegramService.sendMessage(payload);
    }
  }

  @MessagePattern('telegram/location')
  async sendLocation(@Payload() payload: { lat: number; lon: number }, @Ctx() context: MqttContext) {
    if (await this.preferenceService.getValueFor('telegramEnabled')) {
      const { lat, lon } = payload;
      return this.telegramService.sendLocation(lat, lon);
    }
  }
}
