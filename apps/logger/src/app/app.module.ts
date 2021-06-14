import { Module } from '@nestjs/common';
import { isDocker } from '@smart-home-conx/utils';
import { LoggerController } from './logger.controller';
import { LoggerService } from './logger.service';
import { FieldType } from 'influx';
import { InfluxModule } from '@smart-home-conx/influx';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PreferenceModule } from '@smart-home-conx/preference';
import { InitialPreferences1618563524000 } from '../migration/1618563524000-InitialPreferences';

@Module({
  imports: [
    InfluxModule.forRoot({
      host: isDocker() ? `influxdb` : `localhost`,
      database: 'logs',
      schema: [{
        measurement: 'log',
        fields: {
          message: FieldType.STRING
        },
        tags: ['origin']
      }]
    }),
    TypeOrmModule.forRoot({
      type: 'mongodb',
      host: isDocker() ? `mongodb` : `localhost`,
      port: 27017,
      database: 'logger',
      autoLoadEntities: true, // with that option specified, every entity registered through the forFeature() method will be automatically added to the entities array
      synchronize: true,
      migrations: [InitialPreferences1618563524000],
      migrationsRun: true
    }),
    PreferenceModule
  ],
  controllers: [LoggerController],
  providers: [LoggerService],
})
export class AppModule {}
