import { log } from '@smart-home-conx/utils';
import { format } from 'date-fns';
import { from, iif, Observable, of } from "rxjs";
import { map, tap } from 'rxjs/operators';
import axios from 'axios';

export interface SolarTimes {
  key: string;
  sunrise: Date;
  sunset: Date;
}

let CACHE: SolarTimes = null;

export const getSolarTimesForDate$ = (date: Date): Observable<SolarTimes> => {
  const dateKey = format(date, 'yyyy-MM-dd');
  log(`getSolarTimesFor: ${date}`);
  const apiCall$ = from(axios.get(`https://api.sunrise-sunset.org/json?lat=51.668189&lng=6.148282&date=${date}&formatted=0`)).pipe(
    map(result => {
      const { sunrise, sunset } = result.data.results;
      CACHE = { key: dateKey, sunrise: new Date(sunrise), sunset: new Date(sunset) };
      log(`made API request and set cache: ${JSON.stringify(CACHE)}`);
      return CACHE;
    })
  );
  const cache$ = of(CACHE).pipe(tap(() => log(`used cache: ${JSON.stringify(CACHE)}`)));

  return iif(() => !!CACHE && CACHE.key === dateKey, cache$, apiCall$);
}
