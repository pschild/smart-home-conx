import { Module } from '@nestjs/common';
import { DeviceController } from './device.controller';
import { DeviceDataAccessModule } from '@smart-home-conx/api/device/data-access';

@Module({
  imports: [DeviceDataAccessModule],
  controllers: [DeviceController],
  providers: [],
  exports: [],
})
export class DeviceFeatureModule {}
