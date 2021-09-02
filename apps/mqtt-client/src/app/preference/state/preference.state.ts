import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext, StateToken } from '@ngxs/store';
import { forkJoin } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PreferenceHttpService } from './preference-http.service';
import { PreferenceActions } from './preference.actions';
import { patch, updateItem } from '@ngxs/store/operators';

export const PREFERENCE_STATE_NAME = new StateToken<PreferenceStateModel>('preference');

const LOGGER_SERVICE_NAME = 'logger';
const MESSENGER_CONNECTOR_SERVICE_NAME = 'messengerConnector';
const COMMUTING_WATCHER_SERVICE_NAME = 'commutingWatcher';

export interface PreferenceItem {
  key: string;
  label: string;
  value: any;
}

export interface PreferenceListItem {
  serviceName: string;
  prefs: PreferenceItem[];
}

export interface PreferenceStateModel {
  preferenceList: PreferenceListItem[];
}

@State<PreferenceStateModel>({
  name: PREFERENCE_STATE_NAME,
  defaults: {
    preferenceList: []
  }
})
@Injectable()
export class PreferenceState {

  @Selector()
  static loggerPreferences(state: PreferenceStateModel) {
    return state.preferenceList.find(item => item.serviceName === LOGGER_SERVICE_NAME);
  }

  @Selector()
  static messengerConnectorPreferences(state: PreferenceStateModel) {
    return state.preferenceList.find(item => item.serviceName === MESSENGER_CONNECTOR_SERVICE_NAME);
  }

  @Selector()
  static commutingWatcherPreferences(state: PreferenceStateModel) {
    return state.preferenceList.find(item => item.serviceName === COMMUTING_WATCHER_SERVICE_NAME);
  }

  constructor(
    private preferenceHttpService: PreferenceHttpService
  ) {
  }

  @Action(PreferenceActions.LoadPreferences)
  loadPreferences(ctx: StateContext<PreferenceStateModel>) {
    return forkJoin([
      this.preferenceHttpService.loadLoggerPreferences(),
      this.preferenceHttpService.loadMessengerConnectorPreferences(),
      this.preferenceHttpService.loadCommutingWatcherPreferences()
    ]).pipe(
      tap(([loggerPrefs, messengerPrefs, commuterPrefs]) => {
        ctx.patchState({
          preferenceList: [
            { serviceName: LOGGER_SERVICE_NAME, prefs: loggerPrefs },
            { serviceName: MESSENGER_CONNECTOR_SERVICE_NAME, prefs: messengerPrefs },
            { serviceName: COMMUTING_WATCHER_SERVICE_NAME, prefs: commuterPrefs }
          ]
        });
      })
    );
  }

  @Action(PreferenceActions.UpdatePreference)
  updatePreference(ctx: StateContext<PreferenceStateModel>, action: PreferenceActions.UpdatePreference) {
    const key = Object.keys(action.preference)[0];
    const value = Object.values(action.preference)[0];
    return this.preferenceHttpService.update(this.buildEndpointUrl(action.serviceName), key, value).pipe(
      tap(response => {
        ctx.setState(patch({
          preferenceList: updateItem<PreferenceListItem>(item => item.serviceName === action.serviceName, patch({
            prefs: updateItem<PreferenceItem>(item => item.key === key, item => ({ ...item, value }))
          }))
        }));
      })
    );
  }

  private buildEndpointUrl(serviceName: string): string {
    switch (serviceName) {
      case MESSENGER_CONNECTOR_SERVICE_NAME:
        return 'messenger-connector';
      case LOGGER_SERVICE_NAME:
        return 'logger';
      case COMMUTING_WATCHER_SERVICE_NAME:
        return 'commuter';
      default:
        throw new Error(`Unknown serviceName ${serviceName}`);
    }
  }

}
