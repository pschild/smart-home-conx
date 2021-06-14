export namespace PreferenceActions {

  export class LoadPreferences {
    static readonly type = '[Preference] load preferences';
  }

  export class UpdatePreference {
    static readonly type = '[Preference] update preference';

    constructor(public serviceName: string, public preference: { [key: string]: any }) {}
  }
}
