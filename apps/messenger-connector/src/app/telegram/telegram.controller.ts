import { Controller } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { Ctx, MessagePattern, MqttContext, Payload } from '@nestjs/microservices';

@Controller()
export class TelegramController {

  constructor(private readonly telegramService: TelegramService) {}

  @MessagePattern('telegram/message')
  sendMessage(@Payload() payload: string, @Ctx() context: MqttContext) {
    return this.telegramService.sendMessage(payload);
  }

  @MessagePattern('telegram/location')
  sendLocation(@Payload() payload: { lat: number; lon: number }, @Ctx() context: MqttContext) {
    const { lat, lon } = payload;
    return this.telegramService.sendLocation(lat, lon);
  }
}
