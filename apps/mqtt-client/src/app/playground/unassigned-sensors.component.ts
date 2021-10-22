import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { PlaygroundActions } from './state/playground.actions';
import { PlaygroundState } from './state/playground.state';

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

  sensors$: Observable<any[]>;

  constructor(
    private store: Store
  ) {
  }

  ngOnInit(): void {
    this.sensors$ = this.store.select(PlaygroundState.unassignedSensors);
  }

  drop(event: CdkDragDrop<any>) {
    this.store.dispatch(new PlaygroundActions.SensorDropped(event));
  }

}
