import { CdkDragDrop } from "@angular/cdk/drag-drop";
import { SensorType } from "@smart-home-conx/api/shared/data-access/models";

export namespace PlaygroundActions {

  export class LoadHistory {
    static readonly type = '[Playground] load history';

    constructor(public sensorId: string, public chipId: string, public type: SensorType, public pin?: number) {}
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

  export class SensorDropped {
    static readonly type = '[Playground] sensor dropped';

    constructor(public dropEvent: CdkDragDrop<any>) {}
  }
}
