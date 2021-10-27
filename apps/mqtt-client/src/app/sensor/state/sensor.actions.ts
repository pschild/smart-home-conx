import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { SensorModel, SensorType } from '@smart-home-conx/api/shared/data-access/models';

export namespace SensorActions {

  export class LoadHistory {
    static readonly type = '[Playground] load history';

    constructor(public sensorId: string, public chipId: number, public type: SensorType, public pin?: number) {}
  }

  export class LoadRooms {
    static readonly type = '[Playground] load rooms';
  }

  export class LoadSensors {
    static readonly type = '[Playground] load sensors';
  }

  export class UpdateSensor {
    static readonly type = '[Playground] update sensor';

    constructor(public id: string, public dto: Partial<SensorModel>) {}
  }

  export class CreateSensor {
    static readonly type = '[Sensor] create';

    constructor(public dto: SensorModel) {}
  }

  export class RemoveSensor {
    static readonly type = '[Sensor] remove';

    constructor(public id: string) {}
  }

  export class SensorDropped {
    static readonly type = '[Playground] sensor dropped';

    constructor(public dropEvent: CdkDragDrop<any>) {}
  }

}
