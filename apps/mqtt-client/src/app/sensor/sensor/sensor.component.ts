import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { SensorModel, SensorType } from '@smart-home-conx/api/shared/data-access/models';
import { Observable } from 'rxjs';
import { SensorActions } from '../state/sensor.actions';
import { SensorState } from '../state/sensor.state';

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

  @Input() sensor: SensorModel;

  history$: Observable<{ time: string; value: number; chipId: string; pin: number; type: SensorType }[]>;
  latest$: Observable<{ time: string; value: number; chipId: string; pin: number; type: SensorType }>;
  isLoading$: Observable<boolean>;

  constructor(
    private store: Store
  ) {
  }

  ngOnInit(): void {
    this.history$ = this.store.select(SensorState.history(this.sensor._id.toString(), this.sensor.type));
    this.latest$ = this.store.select(SensorState.latest(this.sensor._id.toString(), this.sensor.type));
    this.isLoading$ = this.store.select(SensorState.isLoading(this.sensor._id.toString()));

    // TODO: wird zu oft geladen (bspw. wenn Sensor verschoben wird)
    this.store.dispatch(new SensorActions.LoadHistory(this.sensor._id.toString(), this.sensor.chipId, this.sensor.type, this.sensor.pin));
  }

  reloadHistory(): void {
    this.store.dispatch(new SensorActions.LoadHistory(this.sensor._id.toString(), this.sensor.chipId, this.sensor.type, this.sensor.pin));
  }

  getIconName(type: string): string {
    switch (type) {
      case 'temperature':
        return 'thermostat';
      case 'humidity':
        return 'water_damage';
      case 'voltage':
        return 'battery_charging_full';
      case 'pir':
        return 'settings_input_antenna';
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
      case 'pir':
        return null;
      default:
        throw new Error(`Unknown sensor type "${type}"!`);
    }
  }

}
