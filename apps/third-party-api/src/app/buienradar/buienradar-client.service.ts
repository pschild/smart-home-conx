import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { BuienradarRainHistoryForecastResponse } from '@smart-home-conx/api/shared/data-access/models';
import { AxiosResponse } from 'axios';
import { Cache } from 'cache-manager';
import { from, Observable, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

const raintextMockData = `
003|08:30
002|08:35
000|08:40
005|08:45
007|08:50
010|08:55
005|09:00
000|09:05
005|09:10
000|09:15
000|09:20
000|09:25
000|09:30
000|09:35
000|09:40
000|09:45
000|09:50
000|09:55
000|10:00
000|10:05
000|10:10
000|10:15
000|10:20
000|10:25
`;

/**
 * API: https://gpsgadget.buienradar.nl/data/raintext/?lat=51.67&lon=6.15
 */
@Injectable()
export class BuienradarClient {

  private CACHE_KEY = 'BuienradarClient';
  private RAINTEXT_CACHE_KEY = `${this.CACHE_KEY}.raintext`;
  private RAIN_HISTORY_FORECAST_CACHE_KEY = `${this.CACHE_KEY}.rainHistoryForecast`;
  private CACHE_TTL_SECONDS = 60 * 5;

  constructor(
    private http: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }

  raintextCached(): Observable<any> {
    return from(this.cacheManager.get<any>(this.RAINTEXT_CACHE_KEY)).pipe(
      mergeMap(response => response ? of(response) : this.raintext())
    );
  }

  private raintext(): Observable<any> {
    if (!environment.production) {
      return of(raintextMockData);
    }

    return this.http.get<any>(`https://gpsgadget.buienradar.nl/data/raintext/?lat=${process.env.HOME_POSITION_LAT}&lon=${process.env.HOME_POSITION_LON}`).pipe(
      map((response: AxiosResponse<any>) => response.data),
      mergeMap((response: any) => this.cacheManager.set(this.RAINTEXT_CACHE_KEY, response, { ttl: this.CACHE_TTL_SECONDS }))
    );
  }

  rainHistoryForecastCached(): Observable<BuienradarRainHistoryForecastResponse> {
    return from(this.cacheManager.get<BuienradarRainHistoryForecastResponse>(this.RAIN_HISTORY_FORECAST_CACHE_KEY)).pipe(
      mergeMap(response => response ? of(response) : this.rainHistoryForecast())
    );
  }

  private rainHistoryForecast(): Observable<BuienradarRainHistoryForecastResponse> {
    return this.http.get<BuienradarRainHistoryForecastResponse>(`https://graphdata.buienradar.nl/2.0/forecast/geo/RainHistoryForecast?lat=${process.env.HOME_POSITION_LAT}&lon=${process.env.HOME_POSITION_LON}`).pipe(
      map((response: AxiosResponse<BuienradarRainHistoryForecastResponse>) => response.data),
      mergeMap((response: BuienradarRainHistoryForecastResponse) => this.cacheManager.set(this.RAIN_HISTORY_FORECAST_CACHE_KEY, response, { ttl: this.CACHE_TTL_SECONDS }))
    );
  }
}
