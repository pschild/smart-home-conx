import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { SensorModel, SensorType } from '@smart-home-conx/api/shared/data-access/models';
import { SensorActions } from '../state/sensor.actions';

@Component({
  selector: 'smart-home-conx-sensor-create',
  templateUrl: 'sensor-create.component.html',
  styleUrls: ['sensor-create.component.scss']
})
export class SensorCreateComponent implements OnInit {

  createMode: boolean;

  form: FormGroup;

  typeOptions: { value: SensorType; label: string; icon: string }[] = [
    { value: SensorType.HUMIDITY, label: 'Luftfeuchtigkeit', icon: 'water_damage' },
    { value: SensorType.TEMPERATURE, label: 'Temperatur', icon: 'thermostat' },
    { value: SensorType.VOLTAGE, label: 'Batterie', icon: 'battery_charging_full' },
    { value: SensorType.PIR, label: 'Bewegungsmelder', icon: 'settings_input_antenna' },
  ];

  constructor(
    private formBuilder: FormBuilder,
    private store: Store,
    private dialogRef: MatDialogRef<SensorCreateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { sensor: SensorModel }
  ) {
  }

  ngOnInit() {
    this.createMode = !this.data || !this.data.sensor;

    this.form = this.formBuilder.group({
      type: [null, Validators.required],
      chipId: [null, Validators.required],
      pin: null,
      createdAt: { value: '', disabled: true }
    });

    if (this.createMode) {
      this.form.patchValue({ createdAt: new Date() });
    } else {
      this.form.patchValue(this.data.sensor);
    }
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  onRemoveClick(): void {
    this.store.dispatch(new SensorActions.RemoveSensor(this.data.sensor._id.toString())).subscribe(() => this.dialogRef.close());
  }

  onSaveClick(): void {
    let action$;
    if (this.createMode) {
      action$ = this.store.dispatch(new SensorActions.CreateSensor(this.form.value));
    } else {
      action$ = this.store.dispatch(new SensorActions.UpdateSensor(this.data.sensor._id.toString(), this.form.value));
    }
    action$.subscribe(() => this.dialogRef.close());
  }

  findLabel(value: string): string {
    return this.typeOptions.find(i => i.value === value)?.label;
  }

  findIcon(value: string): string {
    return this.typeOptions.find(i => i.value === value)?.icon;
  }

}
