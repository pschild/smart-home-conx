import { DynamicModule, Module } from '@nestjs/common';
import { InfluxService } from './influx.service';
import { InfluxModuleOptions, INFLUX_DB_OPTIONS_TOKEN } from './interfaces';

// @Global()
@Module({})
export class InfluxModule {
  static forRoot(options: InfluxModuleOptions): DynamicModule {
    return {
      module: InfluxModule,
      // global: true,
      providers: [
        { provide: INFLUX_DB_OPTIONS_TOKEN, useValue: options },
        InfluxService
      ],
      exports: [InfluxService]
    };
  }
}
