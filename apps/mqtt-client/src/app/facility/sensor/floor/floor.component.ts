import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { RoomModel } from '@smart-home-conx/api/shared/data-access/models';
import { Observable } from 'rxjs';
import { SensorState } from '../state/sensor.state';

@Component({
  selector: 'smart-home-conx-floor',
  templateUrl: './floor.component.html',
  styles: [
    `
    .room-container {
      background-color: #ccc;
      position: relative;
      height: 600px;

      max-width: 100vw;
      overflow-x: auto;
    }
    `
  ]
})
export class FloorComponent implements OnInit {

  @Input() enabled: boolean;

  rooms$: Observable<RoomModel[]>;

  constructor(
    private store: Store
  ) {
  }

  ngOnInit(): void {
    this.rooms$ = this.store.select(SensorState.rooms);
  }

}
