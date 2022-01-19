import { Controller, Get, ParseBoolPipe, Query } from '@nestjs/common';
import { TankerkoenigStationService } from './station/station.service';
import { TankerkoenigClient } from './tankerkoenig-client.service';

@Controller('tankerkoenig')
export class TankerkoenigController {

  constructor(
    private readonly tankerkoenigClient: TankerkoenigClient,
    private readonly stationService: TankerkoenigStationService,
  ) {
  }
  
  @Get('stations')
  getStations() {
    return this.stationService.findAll();
  }

  @Get('prices')
  getPrice(@Query('force', ParseBoolPipe) force: boolean) {
    return force ? this.tankerkoenigClient.updatePrices() : this.tankerkoenigClient.getCache();
  }
}
