import { Controller, Get } from '@nestjs/common';
import { from, map, mergeMap } from 'rxjs';
import { StationDetail } from './entity/station.entity';
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
  getPrices() {
    return from(this.stationService.findAll()).pipe(
      map((stations: StationDetail[]) => stations.map(s => s.id)),
      mergeMap((stationIds: string[]) => this.tankerkoenigClient.getPricesChunked(stationIds))
    );
  }
}
