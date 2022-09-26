import { Injectable } from '@nestjs/common';
import { addDays, isBefore, set } from 'date-fns';
import { environment } from '../../environments/environment';

@Injectable()
export class BuienradarRaintextMapper {

  mapToResponse(response: string): { datetime: Date; precipitation: number }[] {
    const parsedResponse = response
      .split('\n')
      .filter(row => row.length > 0)
      .map(row => {
        const splitResult = row.split('|');
        return { hourAndMinute: splitResult[1], precipitation: +splitResult[0] };
      })
      .map(row => ({ datetime: this.createDate(row.hourAndMinute), precipitation: row.precipitation }))
    return this.adjustDates(parsedResponse);
  }

  private createDate(hourAndMinute: string): Date {
    const date = this.getDateByEnvironment();
    const splitResult = hourAndMinute.split(':');
    const hours = +splitResult[0];
    const minutes = +splitResult[1];
    return set(date, {
      hours,
      minutes,
      seconds: 0,
      milliseconds: 0,
    });
  }

  private adjustDates(rows: { datetime: Date; precipitation: number }[]): { datetime: Date; precipitation: number }[] {
    const result = [];
    let addDay = false;
    for (let i = 0; i < rows.length; i++) {
      const current = rows[i].datetime;
      const prev = rows[i - 1]?.datetime;
      if (!!prev && isBefore(current, prev)) {
        addDay = true;
      }
      if (addDay) {
        result.push({ ...rows[i], datetime: addDays(current, 1) });
      } else {
        result.push(rows[i]);
      }
    }

    return result;
  }

  private getDateByEnvironment(): Date {
    if (!environment.production) {
      return new Date('2022-01-28');
    } else {
      return new Date();
    }
  }
}
