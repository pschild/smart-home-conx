import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { PlaygroundActions } from './state/playground.actions';
import { PlaygroundState } from './state/playground.state';

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

  @Input() room: any;

  sensors$: Observable<any[]>;

  constructor(
    private store: Store
  ) {
  }

  ngOnInit(): void {
    this.sensors$ = this.store.select(PlaygroundState.sensorsOfRoom(this.room._id));
  }

  drop(event: CdkDragDrop<any>) {
    this.store.dispatch(new PlaygroundActions.SensorDropped(event));
  }

}
