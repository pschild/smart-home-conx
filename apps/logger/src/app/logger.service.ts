import { Injectable } from '@nestjs/common';
import { CreateLogDto } from './dto';
import { Log } from './entity/log.entity';
import { InfluxService } from '@smart-home-conx/influx';
import { Observable } from 'rxjs';
import { IResults } from 'influx';

@Injectable()
export class LoggerService {

  constructor(private readonly influx: InfluxService) {}

  create(createLogDto: CreateLogDto): Observable<void> {
    return this.influx.insert({ measurement: 'log', fields: { message: createLogDto.message }, tags: { origin: createLogDto.source } });
  }

  findAll(): Observable<IResults<Log[]>> {
    return this.influx.find<Log[]>(`select * from log WHERE time > now() - 1d`);
  }
}
