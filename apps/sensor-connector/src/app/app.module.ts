import { Module } from '@nestjs/common';
import { MotionSensorController } from './motion-sensor/motion-sensor.controller';
import { MotionSensorService } from './motion-sensor/motion-sensor.service';
import { TemperatureSensorController } from './temperature/temperature.controller';
import { HumiditySensorController } from './humidity/humidity.controller';
import { FieldType } from 'influx';
import { InfluxModule } from '@smart-home-conx/influx';
import { isDocker } from '@smart-home-conx/utils';
import { VoltageController } from './voltage/voltage.controller';
import { SwitchController } from './switch/switch.controller';
import { VentilationController } from './ventilation.controller';
import { SwitchService } from './switch/switch.service';
import { TemperatureService } from './temperature/temperature.service';
import { HumidityService } from './humidity/humidity.service';
import { VoltageService } from './voltage/voltage.service';

@Module({
  imports: [
    InfluxModule.forRoot({
      host: isDocker() ? `influxdb` : `localhost`,
      database: 'sensors',
      schema: [
        { measurement: 'movements', fields: { pin: FieldType.INTEGER }, tags: ['chipId'] },
        { measurement: 'temperature', fields: { value: FieldType.FLOAT, raw: FieldType.FLOAT, pin: FieldType.INTEGER }, tags: ['chipId'] },
        { measurement: 'humidity', fields: { value: FieldType.FLOAT, raw: FieldType.FLOAT, pin: FieldType.INTEGER }, tags: ['chipId'] },
        { measurement: 'voltage', fields: { value: FieldType.FLOAT }, tags: ['chipId'] },
        { measurement: 'switch', fields: { switchId: FieldType.STRING, value: FieldType.INTEGER, pin: FieldType.INTEGER }, tags: ['chipId'] }
      ]
    })
  ],
  controllers: [MotionSensorController, TemperatureSensorController, HumiditySensorController, VoltageController, SwitchController, VentilationController],
  providers: [MotionSensorService, SwitchService, TemperatureService, HumidityService, VoltageService]
})
export class AppModule {}
