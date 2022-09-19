import { Component, forwardRef, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { VoltageDetailComponent } from '../../sensor-detail';
import { BaseSensorComponent } from '../base-sensor.component';
import { BASE_SENSOR_TOKEN } from '../base-sensor.token';

@Component({
  selector: 'smart-home-conx-voltage-sensor',
  templateUrl: './voltage-sensor.component.html',
  styleUrls: ['../sensor.scss'],
  providers: [
    {
      provide: BASE_SENSOR_TOKEN,
      useExisting: forwardRef(() => VoltageSensorComponent),
    }
  ]
})
export class VoltageSensorComponent extends BaseSensorComponent implements OnInit {

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
    this.dialog.open(VoltageDetailComponent, { autoFocus: false, data: { sensor: this.sensor } });
  }

}
