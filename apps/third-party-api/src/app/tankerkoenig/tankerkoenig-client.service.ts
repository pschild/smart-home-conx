import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { PricesAtDate, StationPrices } from '@smart-home-conx/api/shared/data-access/models';
import { AxiosResponse } from 'axios';
import { Cache } from 'cache-manager';
import { forkJoin, from, Observable, of } from 'rxjs';
import { map, mergeAll, mergeMap, toArray } from 'rxjs/operators';
import { UpdateResult } from 'typeorm';
import { environment } from '../../environments/environment';
import { DetailResponse, ListResponse, PricesResponse, Station, StationDetail, TankerkoenigErrorResponse, TankerkoenigSuccessResponse } from './model/tankerkoenig-response.model';
import { StationDetail as StationDetailEntity } from './entity/station.entity';
import { TankerkoenigStationService } from './station/station.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const getPricesMockData = require('./mock/getPrices.json');

@Injectable()
export class TankerkoenigClient {

  private CACHE_KEY = 'TankerkoenigClient.getPrices';
  private CACHE_TTL_SECONDS = 60 * 5;
  private MAX_CHUNK_SIZE = 10;

  private static BASE_URL = 'https://creativecommons.tankerkoenig.de/json';

  public static STATION_IDS_WHITELIST = [
    '9ceb2bc4-2c87-4386-817a-b7293ddda3f8',
    '537d0e7d-cae6-4421-96c9-90728f4d33fc',
    '6806c1d7-cc71-4268-8021-ccc7de07380c',
    'fc9eac3e-4013-4933-9f32-70056b822d66',
    'c5b73a5e-0800-43d9-a4cd-365c5b46ef26',
    '51d4b67c-a095-1aa0-e100-80009459e03a',
    'cd8b8686-3bc0-1ed7-97a1-be91d054d0d1',
    '005056ba-7cb6-1ed2-bceb-650366684d1d',
    'd88192d6-b477-4768-847b-c15a6b1e39ac',
    'dec5b215-410c-48a8-939a-c0a826ba6c9d',
    '8f31d95d-971a-4298-8e10-62622d4cb54c',
    '50d9fd7e-aa47-48f4-85f5-06a0558f5d48',
    '3820e199-05c1-4251-bf08-635cc878ecb1',
    'fe698899-f5a6-4562-b1cf-96102f12ecac',
    'cc39abf1-52f1-4d6c-ad3d-a741fe8155e2',
    '97e72f69-b021-4453-9c0d-66c3d56d16ab',
    '68d6b6e5-7ab7-4b01-8b27-96506d5e6791'
  ];

  constructor(
    private http: HttpService,
    private stationService: TankerkoenigStationService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }

  updateStations(): Observable<(StationDetailEntity | UpdateResult)[]> {
    const requests$ = TankerkoenigClient.STATION_IDS_WHITELIST.map(id => this.getDetail(id));
    return forkJoin(requests$).pipe(
      mergeAll(),
      mergeMap((station: StationDetail) => from(this.stationService.findOne(station.id)).pipe(
        mergeMap(loadedStation => {
          const entity = {
            updatedAt: new Date(),
            id: station.id,
            name: station.name,
            brand: station.brand,
            street: station.street,
            houseNumber: station.houseNumber,
            postCode: station.postCode,
            place: station.place,
            lat: station.lat,
            lng: station.lng
          };

          if (!loadedStation) {
            Logger.log(`Creating station ${entity.id}...`);
            return from(this.stationService.create(entity));
          } else {
            Logger.log(`Updating station ${entity.id}...`);
            return from(this.stationService.update(loadedStation._id, entity));
          }
        })
      )),
      toArray()
    );
  }

  getPricesCached(): Observable<PricesAtDate> {
    return from(this.cacheManager.get<PricesAtDate>(this.CACHE_KEY)).pipe(
      mergeMap(response => response ? of(response) : this.getPricesChunked())
    );
  }

  private getPricesChunked(): Observable<PricesAtDate> {
    // TODO: Umbau auf bufferCount(10) statt chunk
    const chunk = (arr, size) => arr.reduce((acc, e, i) => (i % size ? acc[acc.length - 1].push(e) : acc.push([e]), acc), []);

    return from(this.stationService.findAllStationIds()).pipe(
      mergeMap((stationIds: string[]) => {
        const chunks: string[][] = chunk(stationIds, this.MAX_CHUNK_SIZE);
        return forkJoin(chunks.map((stationIds: string[]) => this.getPrices(stationIds)));
      }),
      map((responses: StationPrices[]) => {
        const all = {};
        responses.forEach(res => Object.keys(res).forEach(key => all[key] = res[key]));
        return all;
      }),
      map((prices: StationPrices) => ({ datetime: new Date(), prices })),
      mergeMap((response: PricesAtDate) => this.cacheManager.set(this.CACHE_KEY, response, { ttl: this.CACHE_TTL_SECONDS }))
    );
  }

  private getDetail(stationId: string): Observable<StationDetail> {
    return this.http.get<DetailResponse | TankerkoenigErrorResponse>(`${TankerkoenigClient.BASE_URL}/detail.php?id=${stationId}&apikey=${process.env.TANKERKOENIG_API_KEY}`).pipe(
      map(response => this.handleApiError<DetailResponse>(response)),
      map((response: DetailResponse) => response.station)
    );
  }

  private getList(lat: number, lng: number, rad: number, fuelType: string): Observable<Station[]> {
    return this.http.get<ListResponse | TankerkoenigErrorResponse>(`${TankerkoenigClient.BASE_URL}/list.php?lat=${lat}&lng=${lng}&rad=${rad}&sort=price&type=${fuelType}&apikey=${process.env.TANKERKOENIG_API_KEY}`).pipe(
      map(response => this.handleApiError<ListResponse>(response)),
      map((response: ListResponse) => response.stations)
    );
  }

  private getPrices(stationIds: string[]): Observable<StationPrices> {
    if (stationIds.length > 10) {
      Logger.warn(`Tankerkoenig-API supports only up to 10 IDs at a time, given ${stationIds.length}!`);
    }

    if (!environment.production) {
      return of(getPricesMockData as StationPrices);
    }

    return this.http.get<PricesResponse | TankerkoenigErrorResponse>(`${TankerkoenigClient.BASE_URL}/prices.php?ids=${stationIds.join(',')}&apikey=${process.env.TANKERKOENIG_API_KEY}`).pipe(
      map(response => this.handleApiError<PricesResponse>(response)),
      map((response: PricesResponse) => response.prices)
    );
  }

  private handleApiError<R extends TankerkoenigSuccessResponse>(response: AxiosResponse<R | TankerkoenigErrorResponse>): R {
    if (response.data.ok) {
      return response.data as R;
    }
    throw new Error((response.data as TankerkoenigErrorResponse).message);
  }
}
