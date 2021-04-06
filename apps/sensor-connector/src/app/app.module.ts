import { Module } from '@nestjs/common';
import { MotionSensorController } from './motion-sensor/motion-sensor.controller';
import { MotionSensorService } from './motion-sensor/motion-sensor.service';

@Module({
  controllers: [MotionSensorController],
  providers: [MotionSensorService],
})
export class AppModule {}
