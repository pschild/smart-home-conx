import { Controller, Get } from '@nestjs/common';
import { Ctx, MessagePattern, MqttContext, Payload } from '@nestjs/microservices';

import { CreateLogEntryDto } from './dto/create-log-entry.dto';
import { LogService } from './log.service';

@Controller()
export class LogController {
  constructor(private readonly logService: LogService) {}

  @MessagePattern('log')
  create(@Payload() dto: CreateLogEntryDto, @Ctx() context: MqttContext) {
    return this.logService.create(dto);
  }

  @Get('logs')
  findAll() {
    return this.logService.findAll();
  }
}
