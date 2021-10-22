import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { PlaygroundActions } from './state/playground.actions';
import { PlaygroundState } from './state/playground.state';

@Component({
  selector: 'smart-home-conx-sensor',
  templateUrl: './sensor.component.html',
  styles: [
    `
    .sensor {
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: move;
    }
    `
  ]
})
export class SensorComponent implements OnInit {

  @Input() sensor: any;

  history$: Observable<any>;
  latest$: Observable<any>;
  isLoading$: Observable<boolean>;

  constructor(
    private store: Store
  ) {
  }

  ngOnInit(): void {
    this.history$ = this.store.select(PlaygroundState.history(this.sensor._id, this.sensor.type));
    this.latest$ = this.store.select(PlaygroundState.latest(this.sensor._id, this.sensor.type));
    this.isLoading$ = this.store.select(PlaygroundState.isLoading(this.sensor._id));

    // TODO: wird zu oft geladen (bspw. wenn Sensor verschoben wird)
    this.store.dispatch(new PlaygroundActions.LoadHistory(this.sensor._id, this.sensor.chipId, this.sensor.type, this.sensor.pin));
  }

  reloadHistory(): void {
    this.store.dispatch(new PlaygroundActions.LoadHistory(this.sensor._id, this.sensor.chipId, this.sensor.type, this.sensor.pin));
  }

  getIconName(type: string): string {
    switch (type) {
      case 'temperature':
        return 'thermostat';
      case 'humidity':
        return 'water_damage';
      case 'voltage':
        return 'battery_charging_full';
      default:
        throw new Error(`Unknown sensor type "${type}"!`);
    }
  }

  getSuffix(type: string): string {
    switch (type) {
      case 'temperature':
        return '°C';
      case 'humidity':
        return '%';
      case 'voltage':
        return 'V';
      default:
        throw new Error(`Unknown sensor type "${type}"!`);
    }
  }

}
