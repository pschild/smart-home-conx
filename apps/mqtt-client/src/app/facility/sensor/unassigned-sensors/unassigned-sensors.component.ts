import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { SensorModel, SensorType } from '@smart-home-conx/api/shared/data-access/models';
import { Observable } from 'rxjs';
import { SensorUtil } from '../sensor.util';
import { SensorActions } from '../state/sensor.actions';
import { SensorState } from '../state/sensor.state';

@Component({
  selector: 'smart-home-conx-unassigned-sensors',
  templateUrl: './unassigned-sensors.component.html',
  styleUrls: ['./unassigned-sensors.component.scss']
})
export class UnassignedSensorsComponent implements OnInit {

  @Input() enabled: boolean;

  sensors$: Observable<SensorModel[]>;

  constructor(
    private store: Store
  ) {
  }

  ngOnInit(): void {
    this.sensors$ = this.store.select(SensorState.unassignedSensors);
  }

  drop(event: CdkDragDrop<any>) {
    this.store.dispatch(new SensorActions.SensorDropped(event));
  }

  getIconName(type: SensorType): string {
    return SensorUtil.getIconNameByType(type);
  }

}
