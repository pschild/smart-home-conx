import { Component, forwardRef, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { EventMqttService } from '../../../../event-mqtt.service';
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
    private eventMqttService: EventMqttService,
  ) {
    super(store);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }

  sendMqttMessage(): void {
    this.eventMqttService.publish(`devices/${this.sensor.chipId}/${this.sensor.type}`, `{"value":${40 + Math.random()}${!!this.sensor.pin ? ',"pin":' + this.sensor.pin : ''}}`).subscribe();
  }

  // TODO: remove this method!
  heaterOn(): void {
    this.eventMqttService.publish(`devices/${this.sensor.chipId}/heater`, `on`).subscribe();
  }

  // TODO: remove this method!
  heaterOff(): void {
    this.eventMqttService.publish(`devices/${this.sensor.chipId}/heater`, `off`).subscribe();
  }

  // TODO: remove this method!
  readnow(): void {
    this.eventMqttService.publish(`devices/${this.sensor.chipId}/readnow`, `readnow`).subscribe();
  }

}
