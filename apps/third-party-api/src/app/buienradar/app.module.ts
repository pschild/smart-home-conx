import { CacheModule, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BuienradarController } from './buienradar.controller';
import { BuienradarClient } from './buienradar-client.service';
import { BuienradarRaintextMapper } from './buienradar-raintext-mapper.service';
import { BuienradarRainHistoryForecastMapper } from './buienradar-rain-history-forecast-mapper.service';

@Module({
  imports: [
    HttpModule,
    CacheModule.register()
  ],
  controllers: [BuienradarController],
  providers: [BuienradarClient, BuienradarRaintextMapper, BuienradarRainHistoryForecastMapper]
})
export class BuienradarModule {}
