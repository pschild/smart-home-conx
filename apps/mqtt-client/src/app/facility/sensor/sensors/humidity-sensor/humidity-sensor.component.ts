import { Component, forwardRef, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { HumidityDetailComponent } from '../../sensor-detail';
import { BaseSensorComponent } from '../base-sensor.component';
import { BASE_SENSOR_TOKEN } from '../base-sensor.token';

@Component({
  selector: 'smart-home-conx-humidity-sensor',
  templateUrl: './humidity-sensor.component.html',
  styleUrls: ['../sensor.scss'],
  providers: [
    {
      provide: BASE_SENSOR_TOKEN,
      useExisting: forwardRef(() => HumiditySensorComponent),
    }
  ]
})
export class HumiditySensorComponent extends BaseSensorComponent implements OnInit {

  constructor(
    store: Store,
    dialog: MatDialog
  ) {
    super(store, dialog);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }

  openDetails(): void {
    this.dialog.open(HumidityDetailComponent, { autoFocus: false, data: { sensor: this.sensor } });
  }

}
