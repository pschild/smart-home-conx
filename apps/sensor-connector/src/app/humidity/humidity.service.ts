import { Injectable } from '@nestjs/common';
import { HumiditySensorPayload } from '@smart-home-conx/api/shared/data-access/models';
import { InfluxService } from '@smart-home-conx/influx';
import { Observable } from 'rxjs';

@Injectable()
export class HumidityService {

  constructor(
    private readonly influx: InfluxService
  ) { }

  create(chipId: string, payload: HumiditySensorPayload, correctedValue: number): Observable<void> {
    return this.influx.insert({ measurement: 'humidity', fields: { value: correctedValue, raw: payload.value, pin: payload.pin || -1 }, tags: { chipId } });
  }

  getHistory(chipId: string, pin: number): Observable<Array<{ time: Date; chipId: string; } & HumiditySensorPayload>> {
    return this.influx.find(`select * from humidity where time > now() - 1d AND chipId = '${chipId}' AND pin = ${pin || -1}`);
  }

  getLatest(chipId: string, pin: number): Observable<{ time: Date; chipId: string; } & HumiditySensorPayload> {
    return this.influx.findOne(`select * from humidity where chipId = '${chipId}' AND pin = ${pin || -1} order by time desc limit 1`);
  }
}
