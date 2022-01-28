import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { Cache } from 'cache-manager';
import { from, Observable, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { OpenWeatherMapOneCallResponse } from './model/open-weather-map-response.model';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const oneCallMockData = require('./mock/oneCall.json');

/**
 * One Call API: https://openweathermap.org/api/one-call-api#parameter
 */
@Injectable()
export class OpenWeatherMapClient {

  private CACHE_KEY = 'OpenWeatherMapClient.oneCall';
  private CACHE_TTL_SECONDS = 60 * 5;

  private static BASE_URL = 'https://api.openweathermap.org/data/2.5';

  constructor(
    private http: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }

  oneCallCached(): Observable<OpenWeatherMapOneCallResponse> {
    return from(this.cacheManager.get<OpenWeatherMapOneCallResponse>(this.CACHE_KEY)).pipe(
      mergeMap(response => response ? of(response) : this.oneCall())
    );
  }

  private oneCall(): Observable<OpenWeatherMapOneCallResponse> {
    if (!environment.production) {
      return of(oneCallMockData);
    }

    return this.http.get<OpenWeatherMapOneCallResponse>(`${OpenWeatherMapClient.BASE_URL}/onecall?lat=${process.env.HOME_POSITION_LAT}&lon=${process.env.HOME_POSITION_LON}&appid=${process.env.OPEN_WEATHER_MAP_APP_ID}&units=metric&lang=de`).pipe(
      map((response: AxiosResponse<OpenWeatherMapOneCallResponse>) => response.data),
      mergeMap((response: OpenWeatherMapOneCallResponse) => this.cacheManager.set(this.CACHE_KEY, response, { ttl: this.CACHE_TTL_SECONDS }))
    );
  }
}
