import { Injectable } from '@nestjs/common';
import { InfluxService } from '@smart-home-conx/influx';
import { IResults } from 'influx';
import { Observable } from 'rxjs';

@Injectable()
export class CommutingService {

  constructor(private readonly influx: InfluxService) {}

  saveState(state: 'START' | 'END' | 'CANCELLED'): Observable<void> {
    return this.influx.insert({ measurement: 'states', fields: { state }});
  }

  saveDurations(start: string[], destination: string[], durations: number[]): Observable<void> {
    return this.influx.insert({ measurement: 'durations', fields: {
      startLat: +start[0],
      startLng: +start[1],
      destinationLat: +destination[0],
      destinationLng: +destination[1],
      durations
    }});
  }

  findAll(): Observable<IResults<any[]>> {
    return this.influx.find<any[]>(`select * from durations`);
  }

}
