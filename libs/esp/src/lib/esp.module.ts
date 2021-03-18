import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Esp } from './entities/esp.entity';
import { EspController } from './esp.controller';
import { EspService } from './esp.service';

@Module({
  imports: [TypeOrmModule.forFeature([Esp])],
  controllers: [EspController],
  providers: [EspService],
  exports: [],
})
export class EspModule {}
