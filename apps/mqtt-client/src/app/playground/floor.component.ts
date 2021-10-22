import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { PlaygroundState } from './state/playground.state';

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

  rooms$: Observable<any[]>;

  constructor(
    private store: Store
  ) {
  }

  ngOnInit(): void {
    this.rooms$ = this.store.select(PlaygroundState.rooms);
  }

}
