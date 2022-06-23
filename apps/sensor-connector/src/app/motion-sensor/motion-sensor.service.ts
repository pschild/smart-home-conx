import { Injectable } from '@nestjs/common';
import { MovementSensorPayload } from '@smart-home-conx/api/shared/data-access/models';
import { InfluxService } from '@smart-home-conx/influx';
import { Observable } from 'rxjs';

@Injectable()
export class MotionSensorService {

  constructor(
    private readonly influx: InfluxService
  ) {}

  create(chipId: string, payload: MovementSensorPayload): Observable<void> {
    return this.influx.insert({ measurement: 'movements', fields: { pin: payload.pin || -1 }, tags: { chipId } });
  }

  getHistory(chipId: string, pin: number): Observable<Array<{ time: Date; chipId: string; } & MovementSensorPayload>> {
    return this.influx.find(`select * from movements where time > now() - 1d AND chipId = '${chipId}' AND pin = ${pin || -1}`);
  }
}
