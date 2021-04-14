import { Module } from '@nestjs/common';
import { isDocker } from '@smart-home-conx/utils';
import { LoggerController } from './logger.controller';
import { LoggerService } from './logger.service';
import { FieldType } from 'influx';
import { InfluxModule } from '@smart-home-conx/influx';

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
    })
  ],
  controllers: [LoggerController],
  providers: [LoggerService],
})
export class AppModule {}
