import { Module } from '@nestjs/common';
import { MotionSensorController } from './motion-sensor.controller';

@Module({
  controllers: [MotionSensorController],
  providers: [],
})
export class AppModule {}
