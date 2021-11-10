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
    .floor {
      background-color: #ccc;
      position: relative;
      width: 550px;
      height: 600px;
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
