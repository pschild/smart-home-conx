/* export namespace TankerkoenigActions {

  export class LoadPrices {
    static readonly type = '[Tankerkoenig] load prices';
  }
} */

export class LoadStations {
  static readonly type = '[Tankerkoenig] load stations';
}

export class LoadPrices {
  static readonly type = '[Tankerkoenig] load prices';
}

export class SetFilter {
  static readonly type = '[Tankerkoenig] set filter';
  constructor(public filter: { place?: string; fuelsort?: string }) {}
}
