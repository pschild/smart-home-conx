export namespace PlaygroundActions {

  export class LoadDhtHistory {
    static readonly type = '[Playground] load dht history';
  }

  export class AddDhtValue {
    static readonly type = '[Playground] add dht value';

    constructor(public deviceId: string, public payload: any) {}
  }

  export class LoadRooms {
    static readonly type = '[Playground] load rooms';
  }

  export class LoadSensors {
    static readonly type = '[Playground] load sensors';
  }

  export class UpdateSensor {
    static readonly type = '[Playground] update sensor';

    constructor(public sensorId: string, public newRoomId: string, public position: { x: number; y: number }) {}
  }
}
