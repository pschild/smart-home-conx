import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { SensorModel } from '@smart-home-conx/api/shared/data-access/models';
import { EventMqttService } from '../../../../event-mqtt.service';
import { SensorActions } from '../../state/sensor.actions';

@Component({
  selector: 'smart-home-conx-temperature-detail',
  templateUrl: 'temperature-detail.component.html'
})
export class TemperatureDetailComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<TemperatureDetailComponent>,
    private store: Store,
    private eventMqttService: EventMqttService,
    @Inject(MAT_DIALOG_DATA) public data: { sensor: SensorModel }
  ) {
  }

  ngOnInit(): void {
  }

  formatYAxis(value: number): string {
    return `${value} °C`;
  }

  edit(): void {
    this.dialogRef.close();
    this.store.dispatch(new SensorActions.OpenEditDialog(this.data.sensor));
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
