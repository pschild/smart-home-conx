import { CacheModule, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OpenWeatherMapController } from './open-weather-map.controller';
import { OpenWeatherMapClient } from './open-weather-map-client.service';
import { OpenWeatherMapMapper } from './open-weather-map-mapper.service';

@Module({
  imports: [
    HttpModule,
    CacheModule.register()
  ],
  controllers: [OpenWeatherMapController],
  providers: [OpenWeatherMapClient, OpenWeatherMapMapper]
})
export class OpenWeatherMapModule {}
