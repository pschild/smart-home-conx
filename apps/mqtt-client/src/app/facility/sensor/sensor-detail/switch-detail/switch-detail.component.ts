import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { SensorModel } from '@smart-home-conx/api/shared/data-access/models';
import { SensorActions } from '../../state/sensor.actions';
import * as shape from 'd3-shape';

@Component({
  selector: 'smart-home-conx-switch-detail',
  templateUrl: 'switch-detail.component.html'
})
export class SwitchDetailComponent implements OnInit {

  curve = shape.curveStepAfter;

  constructor(
    private dialogRef: MatDialogRef<SwitchDetailComponent>,
    private store: Store,
    @Inject(MAT_DIALOG_DATA) public data: { sensor: SensorModel }
  ) {
  }

  ngOnInit(): void {
  }

  edit(): void {
    this.dialogRef.close();
    this.store.dispatch(new SensorActions.OpenEditDialog(this.data.sensor));
  }

}
