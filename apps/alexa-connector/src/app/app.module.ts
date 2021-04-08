import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { CommandService } from './command.service';
import { DeviceService } from './device.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [CommandService, DeviceService],
})
export class AppModule {}
