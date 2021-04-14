import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InfluxDB, IPoint, IResults } from 'influx';
import { from, Observable } from 'rxjs';
import { InfluxModuleOptions, INFLUX_DB_OPTIONS_TOKEN } from './interfaces';

@Injectable()
export class InfluxService implements OnModuleInit {

  private instance: InfluxDB;

  constructor(@Inject(INFLUX_DB_OPTIONS_TOKEN) private readonly config: InfluxModuleOptions) {
    this.instance = new InfluxDB(this.config);
  }

  onModuleInit(): void {
    this.instance.getDatabaseNames().then(names => {
      if (!names.includes(this.config.database)) {
        return this.instance.createDatabase(this.config.database);
      }
    });
  }

  insert(data: IPoint | IPoint[]): Observable<void> {
    if (!Array.isArray(data)) {
      data = [data];
    }
    return from(this.instance.writePoints(data));
  }

  find<T>(query: string): Observable<IResults<T>> {
    return from(this.instance.query<T>(query));
  }

  delete<T>(whereQuery?: string): Observable<IResults<T>> {
    return from(this.instance.query<T>(`DELETE from ${this.config.database} ${whereQuery ? 'where ' + whereQuery : ''}`));
  }
}
