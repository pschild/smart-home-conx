import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { InfluxModule } from '@smart-home-conx/influx';
import { isDocker } from '@smart-home-conx/utils';
import { FieldType } from 'influx';
import { FritzboxService } from './fritzbox/fritzbox.service';
import { OpenWeatherMapModule } from './openweathermap/app.module';
import { TankerkoenigModule } from './tankerkoenig/app.module';

@Module({
  imports: [
    HttpModule,
    ScheduleModule.forRoot(),
    InfluxModule.forRoot({ // TODO: in FritzboxModule verschieben
      host: isDocker() ? `influxdb` : `localhost`,
      database: 'fritzbox',
      schema: [
        { measurement: 'log', fields: { device: FieldType.STRING, message: FieldType.STRING }, tags: [] }
      ]
    }),
    TankerkoenigModule,
    OpenWeatherMapModule
  ],
  controllers: [],
  providers: [FritzboxService] // TODO: in FritzboxModule verschieben
})
export class AppModule {}
