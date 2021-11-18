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
      background-color: lightblue;
      padding: 0;
    }
    
    .room-name {
      position: absolute;
      top: 10px;
      left: 10px;
    }

    .cdk-drag-placeholder {
      display: none;
    }

    .cdk-drop-list-dragging {
      box-shadow: 0px 6px 6px -3px rgb(0 0 0 / 20%), 0px 10px 14px 1px rgb(0 0 0 / 14%), 0px 4px 18px 3px rgb(0 0 0 / 12%);
    }
    `
  ]
})
export class RoomComponent implements OnInit {

  @Input() room: RoomModel;

  @Input() enabled: boolean;

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
