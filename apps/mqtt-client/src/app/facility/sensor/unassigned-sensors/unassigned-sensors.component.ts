import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { SensorModel } from '@smart-home-conx/api/shared/data-access/models';
import { Observable } from 'rxjs';
import { SensorActions } from '../state/sensor.actions';
import { SensorState } from '../state/sensor.state';

@Component({
  selector: 'smart-home-conx-unassigned-sensors',
  templateUrl: './unassigned-sensors.component.html',
  styles: [
    `
    #unassigned-list {
      position: absolute;
      right: -50px;
      width: 50px;
      height: 200px;
      background: lightgreen;
      border: 2px solid #000;
    }

    #unassigned-list ::ng-deep .sensor {
      position: static;
    }

    .cdk-drag-placeholder {
      display: none;
    }

    .cdk-drop-list-dragging {
      border-style: dashed !important;
    }
    `
  ]
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

}
