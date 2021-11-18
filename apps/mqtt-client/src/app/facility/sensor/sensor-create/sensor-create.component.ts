import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Select, Store } from '@ngxs/store';
import { DeviceModel, SensorModel, SensorType } from '@smart-home-conx/api/shared/data-access/models';
import { Controls, NgxSubFormRemapComponent, subformComponentProviders } from 'ngx-sub-form';
import { Observable } from 'rxjs';
import { DeviceState } from '../../device/state/device.state';
import { SensorUtil } from '../sensor.util';
import { SensorActions } from '../state/sensor.actions';
import { SensorForm } from './sensor-create-form.model';

@Component({
  selector: 'smart-home-conx-sensor-create',
  templateUrl: 'sensor-create.component.html',
  styleUrls: ['sensor-create.component.scss'],
  providers: subformComponentProviders(SensorCreateComponent),
})
export class SensorCreateComponent extends NgxSubFormRemapComponent<SensorModel, SensorForm> implements OnInit {

  createMode: boolean;

  typeOptions: SensorType[] = Object.values(SensorType);

  SensorType = SensorType;

  @Select(DeviceState.espList)
  espOptions$: Observable<DeviceModel[]>;

  constructor(
    private store: Store,
    private dialogRef: MatDialogRef<SensorCreateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { sensor: SensorModel }
  ) {
    super();
  }

  ngOnInit() {
    this.createMode = !this.data || !this.data.sensor;

    if (!this.createMode) {
      this.formGroup.patchValue(this.data.sensor);
    }
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  onRemoveClick(): void {
    this.store.dispatch(new SensorActions.RemoveSensor(this.data.sensor._id.toString())).subscribe(() => this.dialogRef.close());
  }

  onSaveClick(): void {
    console.log(this.formGroup.value);
    let action$;
    if (this.createMode) {
      action$ = this.store.dispatch(new SensorActions.CreateSensor(this.formGroup.value));
    } else {
      action$ = this.store.dispatch(new SensorActions.UpdateSensor(this.data.sensor._id.toString(), this.formGroup.value));
    }
    action$.subscribe(() => this.dialogRef.close());
  }

  protected getFormControls(): Controls<SensorForm> {
    return {
      createdAt: new FormControl({ value: '', disabled: true }),
      type: new FormControl(null, Validators.required),
      chipId: new FormControl(null, Validators.required),
      pin: new FormControl(null),
      details: new FormControl(null),
    };
  }

  protected getDefaultValues(): Partial<SensorForm> | null {
    return {
      createdAt: new Date()
    };
  }

  protected transformToFormGroup(obj: SensorModel, defaultValues: Partial<SensorForm>): SensorForm {
    return {
      ...obj,
      details: null
    };
  }

  protected transformFromFormGroup(formValue: SensorForm): SensorModel {
    return {
      ...formValue,
      _id: null,
      roomId: null,
      position: null
    };
  }

  getLabel(type: SensorType): string {
    return !!type ? SensorUtil.getLabelByType(type) : null;
  }

  getIconName(type: SensorType): string {
    return !!type ? SensorUtil.getIconNameByType(type) : null;
  }

}
