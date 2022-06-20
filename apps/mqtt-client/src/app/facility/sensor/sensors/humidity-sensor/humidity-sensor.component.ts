import { Component, forwardRef, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
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
    store: Store
  ) {
    super(store);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }

}
