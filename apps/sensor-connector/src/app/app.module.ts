import { Module } from '@nestjs/common';
import { MotionSensorController } from './motion-sensor/motion-sensor.controller';
import { MotionSensorService } from './motion-sensor/motion-sensor.service';
import { TemperatureSensorController } from './temperature/temperature.controller';
import { HumiditySensorController } from './humidity/humidity.controller';
import { FieldType } from 'influx';
import { InfluxModule } from '@smart-home-conx/influx';
import { isDocker } from '@smart-home-conx/utils';
import { VoltageController } from './voltage/voltage.controller';

@Module({
  imports: [
    InfluxModule.forRoot({
      host: isDocker() ? `influxdb` : `localhost`,
      database: 'sensors',
      schema: [
        { measurement: 'movements', fields: { pin: FieldType.INTEGER }, tags: ['chipId'] },
        { measurement: 'temperature', fields: { value: FieldType.FLOAT, pin: FieldType.INTEGER }, tags: ['chipId'] },
        { measurement: 'humidity', fields: { value: FieldType.FLOAT, pin: FieldType.INTEGER }, tags: ['chipId'] },
        { measurement: 'voltage', fields: { value: FieldType.FLOAT, pin: FieldType.INTEGER }, tags: ['chipId'] }
      ]
    })
  ],
  controllers: [MotionSensorController, TemperatureSensorController, HumiditySensorController, VoltageController],
  providers: [MotionSensorService],
})
export class AppModule {}
