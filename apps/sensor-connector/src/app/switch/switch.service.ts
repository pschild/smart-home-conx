import { Injectable } from '@nestjs/common';
import { SwitchSensorPayload } from '@smart-home-conx/api/shared/data-access/models';
import { InfluxService } from '@smart-home-conx/influx';
import { Observable } from 'rxjs';

@Injectable()
export class SwitchService {

  constructor(
    private readonly influx: InfluxService
  ) { }

  create(chipId: string, payload: SwitchSensorPayload): Observable<void> {
    return this.influx.insert({ measurement: 'switch', fields: { switchId: payload.switchId, value: payload.value, pin: payload.pin || -1 }, tags: { chipId } });
  }

  getHistory(chipId: string, pin: number): Observable<Array<{ time: Date; chipId: string; } & SwitchSensorPayload>> {
    return this.influx.find(`select * from switch where time > now() - 1d AND chipId = '${chipId}' AND pin = ${pin || -1}`);
  }

  getLatest(chipId: string, pin: number): Observable<{ time: Date; chipId: string; } & SwitchSensorPayload> {
    return this.influx.findOne(`select * from switch where chipId = '${chipId}' AND pin = ${pin || -1} order by time desc limit 1`);
  }
}
