import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { RoomModel, SensorModel, SensorType } from '@smart-home-conx/api/shared/data-access/models';
import { Observable } from 'rxjs';
import { SensorActions } from '../state/sensor.actions';
import { SensorState } from '../state/sensor.state';

@Component({
  selector: 'smart-home-conx-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit {

  @Input() room: RoomModel;

  @Input() enabled: boolean;

  sensors$: Observable<SensorModel[]>;

  SensorType = SensorType;

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
