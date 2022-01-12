import { CacheModule, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FritzboxService } from './fritzbox/fritzbox.service';
import { FieldType } from 'influx';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InfluxModule } from '@smart-home-conx/influx';
import { isDocker } from '@smart-home-conx/utils';
import { TankerkoenigController } from './tankerkoenig/tankerkoenig.controller';
import { StationDetail } from './tankerkoenig/entity/station.entity';
import { TankerkoenigStationService } from './tankerkoenig/station/station.service';
import { TankerkoenigClient } from './tankerkoenig/tankerkoenig-client.service';

@Module({
  imports: [
    HttpModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mongodb',
      host: isDocker() ? `mongodb` : `localhost`,
      port: 27017,
      database: 'third-party-api_tankerkoenig',
      autoLoadEntities: true, // with that option specified, every entity registered through the forFeature() method will be automatically added to the entities array
      synchronize: true
    }),
    TypeOrmModule.forFeature([StationDetail]),
    InfluxModule.forRoot({
      host: isDocker() ? `influxdb` : `localhost`,
      database: 'fritzbox',
      schema: [
        { measurement: 'log', fields: { device: FieldType.STRING, message: FieldType.STRING }, tags: [] }
      ]
    }),
    CacheModule.register()
  ],
  controllers: [AppController, TankerkoenigController],
  providers: [AppService, FritzboxService, TankerkoenigClient, TankerkoenigStationService],
})
export class AppModule {}
