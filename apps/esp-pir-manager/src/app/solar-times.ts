import { log } from '@smart-home-conx/utils';
import { format, isAfter, isBefore } from 'date-fns';
import { from, iif, Observable, of } from "rxjs";
import { map, tap } from 'rxjs/operators';
import axios, { AxiosResponse } from 'axios';
import * as SunCalc from 'suncalc2';

export interface SolarTimesResponse {
  results: {
    sunrise: string;
    sunset: string;
    solar_noon: string;
    day_length: string;
    civil_twilight_begin: string;
    civil_twilight_end: string;
    nautical_twilight_begin: string;
    nautical_twilight_end: string;
    astronomical_twilight_begin: string;
    astronomical_twilight_end: string;
  };
  status: string;
}

export interface SolarTimes {
  key: string;
  civilTwilightBegin: Date;
  civilTwilightEnd: Date;
}

let CACHE: SolarTimes = null;

export const getSolarTimesForDate$ = (date: Date): Observable<SolarTimes> => {
  const ymd = format(date, 'yyyy-MM-dd');
  log(`get solar times for ${date}`);
  const apiCall$ = from(axios.get(`https://api.sunrise-sunset.org/json?lat=51.668189&lng=6.148282&date=${ymd}&formatted=0`)).pipe(
    map((result: AxiosResponse<SolarTimesResponse>) => {
      const { civil_twilight_begin, civil_twilight_end } = result.data.results;
      CACHE = { key: ymd, civilTwilightBegin: new Date(civil_twilight_begin), civilTwilightEnd: new Date(civil_twilight_end) };
      log(`made API request and set cache to ${JSON.stringify(CACHE)}`);
      return CACHE;
    })
  );
  const cache$ = of(CACHE).pipe(tap(() => log(`used cache: ${JSON.stringify(CACHE)}`)));

  return iif(() => !!CACHE && CACHE.key === ymd, cache$, apiCall$).pipe(
    tap(_ => {
      const times = SunCalc.getTimes(date, 51.668189, 6.148282);
      log(`suncalc2 = ${JSON.stringify(times)}`);
    })
  );
}

/**
 * Checks whether the time of the given date is between the times for sunset and sunrise.
 * In other words, it checks, whether it is "night"/"dark".
 */
export function isNight(date: Date): boolean {
  const { dusk, dawn } = SunCalc.getTimes(date, 51.668189, 6.148282);
  log(`SunCalc times for ${format(date, 'yyyy-MM-dd HH:mm')}: ${JSON.stringify(SunCalc.getTimes(date, 51.668189, 6.148282))}`);
  return isAfter(date, new Date(dusk)) || isBefore(date, new Date(dawn));
}
