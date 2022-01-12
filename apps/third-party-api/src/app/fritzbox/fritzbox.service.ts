import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Timeout, Cron, CronExpression } from '@nestjs/schedule';
import { filter, map, mergeAll, mergeMap, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { createHash } from 'crypto';
import { Observable } from 'rxjs';
import { isAfter } from 'date-fns';
import { InfluxService } from '@smart-home-conx/influx';

interface FritzboxLogItem {
  date: Date;
  description: string;
}

interface LogItem {
  time: Date;
  device: string;
  message: string;
}

@Injectable()
export class FritzboxService {

  private static POST_CONFIG = { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } };

  constructor(
    private http: HttpService,
    private readonly influx: InfluxService
  ) {}

  latestLogEntry(): Observable<LogItem> {
    return this.influx.findOne(`select * from log order by time desc limit 1`);
  }

  login(): Observable<string> {
    return this.http.get(`http://${process.env.FRITZ_BOX_IP}/login_sid.lua`).pipe(
      map(response => response.data.match('<Challenge>(.*?)</Challenge>')[1]),
      tap(challenge => Logger.log(`Retrieved challenge ${challenge}`)),
      filter(challenge => !!challenge),
      switchMap(challenge => {
        const buffer = Buffer.from(`${challenge}-${process.env.FRITZ_BOX_PASSWORD}`, 'utf16le');
        const challengeAnswer = challenge + '-' + createHash('md5').update(buffer).digest('hex');
        return this.http.get(`http://${process.env.FRITZ_BOX_IP}/login_sid.lua?username=${process.env.FRITZ_BOX_USER}&response=${challengeAnswer}`);
      }),
      map(response => response.data.match('<SID>(.*?)</SID>')[1]),
      tap(sid => Logger.log(`Retrieved SID ${sid}`))
    );
  }

  // @Timeout(10) // testing
  @Cron('0 55 23 * * *') // every day at 23:55:00
  getSystemLog(): void {
    this.login().pipe(
      tap(() => Logger.log(`starting cron getSystemLog...`)),
      switchMap(sid => this.http.post(`http://${process.env.FRITZ_BOX_IP}/data.lua`, this.createParams(sid, 'log'), FritzboxService.POST_CONFIG)),
      map(response => response.data?.data?.log),
      map(rawEntries => rawEntries.map(e => ({ date: new Date(`${this.parseDate(e[0])} ${e[1]}`), description: e[2] }))),
      withLatestFrom(this.latestLogEntry()),
      map(([logItems, latestItem]: [FritzboxLogItem[], LogItem]) => {
        const filteredItems = logItems.filter(item => isAfter(item.date, latestItem.time));
        Logger.log(`Found ${filteredItems.length} item(s) after ${latestItem.time}`);
        return filteredItems;
      }),
      mergeAll(),
      mergeMap((logItem: FritzboxLogItem) => {
        let device = '';
        if (logItem.description.match('IP 192.168.178.[0-9+]{1,3}, MAC ([0-9A-Z]{2}:?){6}')) {
          const parts = logItem.description.split(',');
          device = parts.slice(-3)[0].trim();
        }
        return this.influx.insert({ measurement: 'log', fields: { device, message: logItem.description }, timestamp: logItem.date });
      })
    ).subscribe();
  }

  // @Timeout(10) // testing
  getOverview(): void {
    this.login().pipe(
      switchMap(sid => this.http.post(`http://${process.env.FRITZ_BOX_IP}/data.lua`, this.createParams(sid, 'overview'), FritzboxService.POST_CONFIG)),
      // map(response => response.data?.data?.foncalls as { date: string; time: string; number: string; duration: string; classes: string; name: string; }[]), // { number: '017682231572', link: 'fonbook_addnum', date: '06. Dez.', duration: '0:03', addible: false, classes: 'call_in', name: 'Julia', display: 'Julia', fonname: 'Telefon', unknown: false, time: '16:01' }
      // map(foncalls => foncalls.calls.map(call => ({ date: `${call.date} ${call.time}`, number: call.number, duration: call.duration, name: call.name, type: call.classes === 'call_in' ? 'IN' : 'OUT' }))),
      map(response => response.data?.data?.net.devices as { type: string; name: string; classes: string; }[]), // { classes: 'led_green', type: 'WLAN - 2,4 GHz', name: 'ESP-C57040', url: '', realtimeprio: false }
      map(devices => devices.map(d => ({ type: d.type, name: d.name, status: d.classes.match('^led_green|globe_online$') ? 'ONLINE' : 'UNKNOWN' }))),
      tap(console.log)
    ).subscribe(() => Logger.log('done'));
  }

  private parseDate(raw: string): string {
    return `20${raw.split('.').reverse().join('-')}`;
  }

  private createParams(sid: string, page: string): URLSearchParams {
    const params = new URLSearchParams();
    params.append('sid', sid);
    params.append('page', page);
    params.append('lang', 'de');
    return params;
  }
}
