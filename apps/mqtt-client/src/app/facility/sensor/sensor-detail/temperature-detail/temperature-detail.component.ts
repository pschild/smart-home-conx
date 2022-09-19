import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SensorModel } from '@smart-home-conx/api/shared/data-access/models';
import { EventMqttService } from '../../../../event-mqtt.service';

@Component({
  selector: 'smart-home-conx-temperature-detail',
  templateUrl: 'temperature-detail.component.html'
})
export class TemperatureDetailComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<TemperatureDetailComponent>,
    private eventMqttService: EventMqttService,
    @Inject(MAT_DIALOG_DATA) public data: { sensor: SensorModel }
  ) {
  }

  ngOnInit(): void {
  }

  formatYAxis(value: number): string {
    return `${value} °C`;
  }

  // TODO: remove this method!
  heaterOn(): void {
    this.eventMqttService.publish(`devices/${this.data.sensor.chipId}/heater`, `on`).subscribe();
  }

  // TODO: remove this method!
  heaterOff(): void {
    this.eventMqttService.publish(`devices/${this.data.sensor.chipId}/heater`, `off`).subscribe();
  }

  // TODO: remove this method!
  readnow(): void {
    this.eventMqttService.publish(`devices/${this.data.sensor.chipId}/readnow`, `readnow`).subscribe();
  }

}
