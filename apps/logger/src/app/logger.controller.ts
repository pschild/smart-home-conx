import { Controller, Get } from '@nestjs/common';
import { Ctx, MessagePattern, MqttContext, Payload } from '@nestjs/microservices';
import { CreateLogDto } from './dto';

import { LoggerService } from './logger.service';

@Controller()
export class LoggerController {

  constructor(private readonly loggerService: LoggerService) {}

  @Get()
  findAll() {
    return this.loggerService.findAll();
  }

  @MessagePattern('log')
  create(@Payload() payload: CreateLogDto, @Ctx() context: MqttContext) {
    return this.loggerService.create(payload);
  }
}
