import { Component } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Select, Store } from '@ngxs/store';
import { SensorModel } from '@smart-home-conx/api/shared/data-access/models';
import { Observable } from 'rxjs';
import { SensorActions } from '../state/sensor.actions';
import { SensorState } from '../state/sensor.state';

@Component({
  selector: 'smart-home-conx-sensor-list',
  templateUrl: 'sensor-list.component.html'
})
export class SensorListComponent {

  @Select(SensorState.sensors)
  sensors$: Observable<SensorModel[]>;

  editModeEnabled: boolean;

  constructor(
    private store: Store
  ) {
  }

  create(): void {
    this.store.dispatch(new SensorActions.OpenEditDialog());
  }

  edit(sensor: SensorModel): void {
    this.store.dispatch(new SensorActions.OpenEditDialog(sensor));
  }

  onEditModeChange(event: MatSlideToggleChange): void {
    this.editModeEnabled = event.checked;
  }

}
