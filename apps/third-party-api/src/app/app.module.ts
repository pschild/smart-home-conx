import { HttpModule, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FritzboxService } from './fritzbox/fritzbox.service';
import { FieldType } from 'influx';
import { InfluxModule } from '@smart-home-conx/influx';
import { isDocker } from '@smart-home-conx/utils';

@Module({
  imports: [
    HttpModule,
    ScheduleModule.forRoot(),
    InfluxModule.forRoot({
      host: isDocker() ? `influxdb` : `localhost`,
      database: 'fritzbox',
      schema: [
        { measurement: 'log', fields: { device: FieldType.STRING, message: FieldType.STRING }, tags: [] }
      ]
    })
  ],
  controllers: [AppController],
  providers: [AppService, FritzboxService],
})
export class AppModule {}
