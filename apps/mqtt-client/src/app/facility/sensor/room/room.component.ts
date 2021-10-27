import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { RoomModel, SensorModel } from '@smart-home-conx/api/shared/data-access/models';
import { Observable } from 'rxjs';
import { SensorActions } from '../state/sensor.actions';
import { SensorState } from '../state/sensor.state';

@Component({
  selector: 'smart-home-conx-room',
  templateUrl: './room.component.html',
  styles: [
    `
    .room {
      position: absolute;
      border: 2px solid #000;
      background-color: lightblue;
    }
    
    .room-name {
      position: absolute;
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
export class RoomComponent implements OnInit {

  @Input() room: RoomModel;

  sensors$: Observable<SensorModel[]>;

  constructor(
    private store: Store
  ) {
  }

  ngOnInit(): void {
    this.sensors$ = this.store.select(SensorState.sensorsOfRoom(this.room._id.toString()));
  }

  drop(event: CdkDragDrop<any>) {
    this.store.dispatch(new SensorActions.SensorDropped(event));
  }

}
