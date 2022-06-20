import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { SensorModel } from '@smart-home-conx/api/shared/data-access/models';
import { SensorActions } from '../../state/sensor.actions';

@Component({
  selector: 'smart-home-conx-voltage-detail',
  templateUrl: 'voltage-detail.component.html'
})
export class VoltageDetailComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<VoltageDetailComponent>,
    private store: Store,
    @Inject(MAT_DIALOG_DATA) public data: { sensor: SensorModel }
  ) {
  }

  ngOnInit(): void {
  }

  formatYAxis(value: number): string {
    return `${value} V`;
  }

  edit(): void {
    this.dialogRef.close();
    this.store.dispatch(new SensorActions.OpenEditDialog(this.data.sensor));
  }

}
