import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SensorModel } from '@smart-home-conx/api/shared/data-access/models';
import * as shape from 'd3-shape';

@Component({
  selector: 'smart-home-conx-switch-detail',
  templateUrl: 'switch-detail.component.html'
})
export class SwitchDetailComponent implements OnInit {

  curve = shape.curveStepAfter;

  constructor(
    public dialogRef: MatDialogRef<SwitchDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { sensor: SensorModel }
  ) {
  }

  ngOnInit(): void {
  }

}
