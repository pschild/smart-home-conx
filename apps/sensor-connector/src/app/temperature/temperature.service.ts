import { Injectable } from '@nestjs/common';
import { TemperatureSensorPayload } from '@smart-home-conx/api/shared/data-access/models';
import { InfluxService } from '@smart-home-conx/influx';
import { Observable } from 'rxjs';

@Injectable()
export class TemperatureService {

  constructor(
    private readonly influx: InfluxService
  ) { }

  create(chipId: string, payload: TemperatureSensorPayload, correctedValue: number): Observable<void> {
    return this.influx.insert({ measurement: 'temperature', fields: { value: correctedValue, raw: payload.value, pin: payload.pin || -1 }, tags: { chipId } });
  }

  getHistory(chipId: string, pin: number): Observable<Array<{ time: Date; chipId: string; } & TemperatureSensorPayload>> {
    return this.influx.find(`select * from temperature where time > now() - 1d AND chipId = '${chipId}' AND pin = ${pin || -1}`);
  }

  getLatest(chipId: string, pin: number): Observable<{ time: Date; chipId: string; } & TemperatureSensorPayload> {
    return this.influx.findOne(`select * from temperature where chipId = '${chipId}' AND pin = ${pin || -1} order by time desc limit 1`);
  }
}
