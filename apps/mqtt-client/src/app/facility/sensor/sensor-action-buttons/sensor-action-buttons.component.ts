import { Component, Input, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { SensorModel, SensorType } from '@smart-home-conx/api/shared/data-access/models';
import { EventMqttService } from '../../../event-mqtt.service';
import { SensorActions } from '../state/sensor.actions';

@Component({
  selector: 'smart-home-conx-sensor-action-buttons',
  templateUrl: 'sensor-action-buttons.component.html'
})
export class SensorActionButtonsComponent implements OnInit {

  @Input() sensor: SensorModel;

  @Input() dialogRef: MatDialogRef<unknown>;

  constructor(
    private store: Store,
    private eventMqttService: EventMqttService,
  ) {
  }

  ngOnInit(): void {
  }

  edit(): void {
    this.dialogRef.close();
    this.store.dispatch(new SensorActions.OpenEditDialog(this.sensor));
  }

  sendMqttMessage(): void {
    this.eventMqttService.publish(`devices/${this.sensor.chipId}/${this.sensor.type}`, `{"value":${this.getFakeValue()}${!!this.sensor.pin ? ',"pin":' + this.sensor.pin : ''}}`).subscribe();
  }

  private getFakeValue(): number {
    if (this.sensor.type === SensorType.SWITCH) {
      return Math.random() >= 0.5 ? 1 : 0;
    } else if (this.sensor.type === SensorType.MOVEMENT) {
      return 1;
    } else if (this.sensor.type === SensorType.VOLTAGE) {
      return Math.random() + 3;
    }
    return Math.random() + 20;
  }

}
