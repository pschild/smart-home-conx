import { Module } from '@nestjs/common';
import { InfluxModule } from '@smart-home-conx/influx';
import { FieldType } from 'influx';
import { isDocker } from '@smart-home-conx/utils';
import { CommutingController } from './commuting.controller';
import { CommutingService } from './commuting.service';
import { TravelTimeService } from './travel-time.service';
import { GoogleMapsCrawler } from './maps-crawler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InitialPreferences1630561787000 } from '../migration/1630561787000-InitialPreferences';
import { PreferenceModule } from '@smart-home-conx/preference';

@Module({
  imports: [
    InfluxModule.forRoot({
      host: isDocker() ? `influxdb` : `localhost`,
      database: 'commuting',
      schema: [
        { measurement: 'states', fields: { state: FieldType.STRING }, tags: [] },
        { measurement: 'durations', fields: {
          startLat: FieldType.FLOAT,
          startLng: FieldType.FLOAT,
          destinationLat: FieldType.FLOAT,
          destinationLng: FieldType.FLOAT,
          durations: FieldType.STRING
        }, tags: [] }
      ]
    }),
    TypeOrmModule.forRoot({
      type: 'mongodb',
      host: isDocker() ? `mongodb` : `localhost`,
      port: 27017,
      database: 'commuting-watcher',
      autoLoadEntities: true, // with that option specified, every entity registered through the forFeature() method will be automatically added to the entities array
      synchronize: true,
      migrations: [InitialPreferences1630561787000],
      migrationsRun: true
    }),
    PreferenceModule
  ],
  controllers: [CommutingController],
  providers: [CommutingService, TravelTimeService, GoogleMapsCrawler],
})
export class AppModule {}
