import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { SensorModel, SensorType } from '@smart-home-conx/api/shared/data-access/models';

export namespace SensorActions {

  export class LoadHistory {
    static readonly type = '[Sensor] load history';

    constructor(public sensorId: string, public chipId: number, public type: SensorType, public pin?: number) {}
  }

  export class LoadRooms {
    static readonly type = '[Sensor] load rooms';
  }

  export class LoadSensors {
    static readonly type = '[Sensor] load sensors';
  }

  export class UpdateSensor {
    static readonly type = '[Sensor] update sensor';

    constructor(public id: string, public dto: Partial<SensorModel>) {}
  }

  export class CreateSensor {
    static readonly type = '[Sensor] create';

    constructor(public dto: Partial<SensorModel>) {}
  }

  export class RemoveSensor {
    static readonly type = '[Sensor] remove';

    constructor(public id: string) {}
  }

  export class SensorDropped {
    static readonly type = '[Sensor] sensor dropped';

    constructor(public dropEvent: CdkDragDrop<any>) {}
  }

  export class OpenEditDialog {
    static readonly type = '[Sensor] open edit dialog';

    constructor(public sensor?: SensorModel) {}
  }

  export class OpenDetailDialog {
    static readonly type = '[Sensor] open detail dialog';

    constructor(public sensor: SensorModel) {}
  }

}
