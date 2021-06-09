import { DeviceModel } from '@smart-home-conx/api/shared/data-access/models';

export namespace DeviceActions {

  export class LoadEspDevices {
    static readonly type = '[Device] load esp devices';
  }

  export class CreateEspDevice {
    static readonly type = '[Device] create esp device';

    constructor(public dto: DeviceModel) {}
  }

  export class UpdateEspDevice {
    static readonly type = '[Device] update esp device';

    constructor(public id: string, public dto: DeviceModel) {}
  }

  export class RemoveEspDevice {
    static readonly type = '[Device] remove esp device';

    constructor(public id: string) {}
  }

  export class LoadAlexaDevices {
    static readonly type = '[Device] load alexa devices';
  }

  export class SendAlexaSpeech {
    static readonly type = '[Device] send Alexa speech';

    constructor(public alexaDeviceName: string, public text: string) {}
  }

  export class SendAlexaCommand {
    static readonly type = '[Device] send Alexa command';

    constructor(public alexaDeviceName: string, public command: string) {}
  }
}
