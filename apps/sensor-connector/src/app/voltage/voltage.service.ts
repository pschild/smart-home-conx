import { Injectable } from '@nestjs/common';
import { VoltageSensorPayload } from '@smart-home-conx/api/shared/data-access/models';
import { InfluxService } from '@smart-home-conx/influx';
import { Observable } from 'rxjs';

@Injectable()
export class VoltageService {

  constructor(
    private readonly influx: InfluxService
  ) { }

  create(chipId: string, payload: VoltageSensorPayload): Observable<void> {
    return this.influx.insert({ measurement: 'voltage', fields: { value: payload.value }, tags: { chipId } });
  }

  getHistory(chipId: string): Observable<Array<{ time: Date; chipId: string; } & VoltageSensorPayload>> {
    return this.influx.find(`select * from voltage where time > now() - 1d AND chipId = '${chipId}'`);
  }

  getLatest(chipId: string): Observable<{ time: Date; chipId: string; } & VoltageSensorPayload> {
    return this.influx.findOne(`select * from voltage where chipId = '${chipId}' order by time desc limit 1`);
  }
}
