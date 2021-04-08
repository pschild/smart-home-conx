import { Module } from '@nestjs/common';
import { TelegramController, TelegramService } from './telegram';

@Module({
  imports: [],
  controllers: [TelegramController],
  providers: [TelegramService],
})
export class AppModule {}
