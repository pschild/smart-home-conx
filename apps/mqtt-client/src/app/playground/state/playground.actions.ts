export namespace PlaygroundActions {

  export class LoadDhtHistory {
    static readonly type = '[Playground] load dht history';
  }

  export class AddDhtValue {
    static readonly type = '[Playground] add dht value';

    constructor(public deviceId: string, public payload: any) {}
  }
}
