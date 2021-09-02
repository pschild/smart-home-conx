import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { PreferenceListItem, PreferenceState } from '../state/preference.state';
import { Select, Store } from '@ngxs/store';
import { PreferenceActions } from '../state/preference.actions';

@Component({
  selector: 'smart-home-conx-preference-list',
  templateUrl: 'preference-list.component.html'
})
export class PreferenceListComponent implements OnInit {

  @Select(PreferenceState.loggerPreferences)
  loggerPreferenceItem$: Observable<PreferenceListItem>;

  @Select(PreferenceState.messengerConnectorPreferences)
  messengerConnectorPreferenceItem$: Observable<PreferenceListItem>;

  @Select(PreferenceState.commutingWatcherPreferences)
  commutingWatcherPreferenceItem$: Observable<PreferenceListItem>;

  constructor(
    private store: Store
  ) {
  }

  ngOnInit() {
  }

  handleChange(serviceName: string, preference: { [key: string]: any }): void {
    this.store.dispatch(new PreferenceActions.UpdatePreference(serviceName, preference));
  }

}