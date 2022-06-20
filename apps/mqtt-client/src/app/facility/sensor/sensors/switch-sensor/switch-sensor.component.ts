import { Component, forwardRef, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseSensorComponent } from '../base-sensor.component';
import { BASE_SENSOR_TOKEN } from '../base-sensor.token';

@Component({
  selector: 'smart-home-conx-switch-sensor',
  templateUrl: './switch-sensor.component.html',
  styleUrls: ['../sensor.scss'],
  providers: [
    {
      provide: BASE_SENSOR_TOKEN,
      useExisting: forwardRef(() => SwitchSensorComponent),
    }
  ]
})
export class SwitchSensorComponent extends BaseSensorComponent implements OnInit {

  iconName$: Observable<string>;

  constructor(
    store: Store
  ) {
    super(store);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.iconName$ = this.latest$.pipe(
      map(latest => !!latest?.value ? 'toggle_on' : 'toggle_off')
    );
  }

}
