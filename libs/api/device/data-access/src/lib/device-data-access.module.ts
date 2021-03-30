import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceService } from './device.service';
import { Device } from './entity/device.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Device])],
  controllers: [],
  providers: [DeviceService],
  exports: [DeviceService],
})
export class DeviceDataAccessModule {}
