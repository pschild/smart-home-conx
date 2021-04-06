import { Injectable } from '@nestjs/common';
import { log } from '@smart-home-conx/utils';
import { format, isAfter, isBefore } from 'date-fns';
import * as SunCalc from 'suncalc2';

@Injectable()
export class MotionSensorService {

  constructor() {}

  /**
   * Checks whether the time of the given date is between the times for sunset and sunrise.
   * In other words, it checks, whether it is "night"/"dark".
   */
  isNight(date: Date): boolean {
    const { dusk, dawn } = SunCalc.getTimes(date, 51.668189, 6.148282);
    log(`SunCalc times for ${format(date, 'yyyy-MM-dd HH:mm')}: ${JSON.stringify(SunCalc.getTimes(date, 51.668189, 6.148282))}`);
    log(`isNight=${isAfter(date, new Date(dusk)) || isBefore(date, new Date(dawn))}`);
    return isAfter(date, new Date(dusk)) || isBefore(date, new Date(dawn));
  }
}
