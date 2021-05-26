export namespace PlaygroundActions {
  export class LoadEspDevices {
    static readonly type = '[Playground] load esp devices';
  }

  export class LoadAlexaDevices {
    static readonly type = '[Playground] load alexa devices';
  }

  export class LoadDhtHistory {
    static readonly type = '[Playground] load dht history';
  }

  export class AddDhtValue {
    static readonly type = '[Playground] add dht value';

    constructor(public deviceId: string, public payload: any) {}
  }
}
