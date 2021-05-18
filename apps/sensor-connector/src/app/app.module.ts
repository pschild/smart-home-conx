import { Module } from '@nestjs/common';
import { MotionSensorController } from './motion-sensor/motion-sensor.controller';
import { MotionSensorService } from './motion-sensor/motion-sensor.service';
import { DhtSensorController } from './dht-sensor/dht-sensor.controller';
import { FieldType } from 'influx';
import { InfluxModule } from '@smart-home-conx/influx';
import { isDocker } from '@smart-home-conx/utils';
import { VoltageController } from './voltage/voltage.controller';

@Module({
  imports: [
    InfluxModule.forRoot({
      host: isDocker() ? `influxdb` : `localhost`,
      database: 'sensor_values',
      schema: [
        { measurement: 'movements', fields: { message: FieldType.STRING }, tags: ['deviceId'] },
        { measurement: 'dht', fields: { temperature: FieldType.FLOAT, humidity: FieldType.FLOAT }, tags: ['deviceId'] },
        { measurement: 'voltage', fields: { value: FieldType.FLOAT }, tags: ['deviceId'] }
      ]
    })
  ],
  controllers: [MotionSensorController, DhtSensorController, VoltageController],
  providers: [MotionSensorService],
})
export class AppModule {}
