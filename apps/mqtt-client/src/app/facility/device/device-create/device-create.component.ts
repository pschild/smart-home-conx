import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { DeviceActions } from '../state/device.actions';
import { DeviceModel } from '@smart-home-conx/api/shared/data-access/models';

@Component({
  selector: 'smart-home-conx-device-create',
  templateUrl: 'device-create.component.html',
  styleUrls: ['device-create.component.scss']
})
export class DeviceCreateComponent implements OnInit {

  createMode: boolean;

  form: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private store: Store,
    private dialogRef: MatDialogRef<DeviceCreateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { esp: DeviceModel }
  ) {
  }

  ngOnInit() {
    this.createMode = !this.data || !this.data.esp;

    this.form = this.formBuilder.group({
      model: ['', Validators.required],
      description: '',
      pioEnv: ['', Validators.required],
      chipId: ['', Validators.required],
      batteryPowered: false,
      createdAt: { value: '', disabled: true }
    });

    if (this.createMode) {
      this.form.patchValue({ createdAt: new Date() });
    } else {
      this.form.patchValue(this.data.esp);
    }
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  onRemoveClick(): void {
    this.store.dispatch(new DeviceActions.RemoveEspDevice(this.data.esp._id.toString())).subscribe(() => this.dialogRef.close());
  }

  onSaveClick(): void {
    let action$;
    if (this.createMode) {
      action$ = this.store.dispatch(new DeviceActions.CreateEspDevice(this.form.value));
    } else {
      action$ = this.store.dispatch(new DeviceActions.UpdateEspDevice(this.data.esp._id.toString(), this.form.value));
    }
    action$.subscribe(() => this.dialogRef.close());
  }

}