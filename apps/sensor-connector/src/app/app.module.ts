import { Module } from '@nestjs/common';
import { MotionSensorController } from './motion-sensor/motion-sensor.controller';
import { MotionSensorService } from './motion-sensor/motion-sensor.service';
import { FieldType } from 'influx';
import { InfluxModule } from '@smart-home-conx/influx';
import { isDocker } from '@smart-home-conx/utils';

@Module({
  imports: [
    InfluxModule.forRoot({
      host: isDocker() ? `influxdb` : `localhost`,
      database: 'sensor_values',
      schema: [{
        measurement: 'movements',
        fields: {
          message: FieldType.STRING
        },
        tags: ['deviceId']
      }]
    })
  ],
  controllers: [MotionSensorController],
  providers: [MotionSensorService],
})
export class AppModule {}
