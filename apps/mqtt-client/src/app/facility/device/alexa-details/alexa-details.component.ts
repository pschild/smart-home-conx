import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { DeviceActions } from '../state/device.actions';

@Component({
  selector: 'smart-home-conx-alexa-details',
  templateUrl: 'alexa-details.component.html'
})
export class AlexaDetailsComponent implements OnInit {

  form: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private store: Store,
    private dialogRef: MatDialogRef<AlexaDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { accountName: string }
  ) {
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      speechText: '',
      commandText: '',
    });
  }

  speak(): void {
    this.store.dispatch(new DeviceActions.SendAlexaSpeech(this.data.accountName, this.form.get('speechText').value));
  }

  sendCommand(): void {
    this.store.dispatch(new DeviceActions.SendAlexaCommand(this.data.accountName, this.form.get('commandText').value));
  }

  onCloseClick(): void {
    this.dialogRef.close();
  }

}