import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Select, Store } from '@ngxs/store';
import { DeviceModel, SensorModel, SensorType } from '@smart-home-conx/api/shared/data-access/models';
import { Observable } from 'rxjs';
import { DeviceState } from '../../device/state/device.state';
import { SensorUtil } from '../sensor.util';
import { SensorActions } from '../state/sensor.actions';

@Component({
  selector: 'smart-home-conx-sensor-create',
  templateUrl: 'sensor-create.component.html',
  styleUrls: ['sensor-create.component.scss']
})
export class SensorCreateComponent implements OnInit {

  createMode: boolean;

  form: FormGroup;

  typeOptions: SensorType[] = Object.values(SensorType);

  @Select(DeviceState.espList)
  espOptions$: Observable<DeviceModel[]>;

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

  getLabel(type: SensorType): string {
    return !!type ? SensorUtil.getLabelByType(type) : null;
  }

  getIconName(type: SensorType): string {
    return !!type ? SensorUtil.getIconNameByType(type) : null;
  }

}
