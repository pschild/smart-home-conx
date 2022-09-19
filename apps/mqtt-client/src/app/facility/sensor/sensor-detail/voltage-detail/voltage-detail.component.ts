import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SensorModel } from '@smart-home-conx/api/shared/data-access/models';

@Component({
  selector: 'smart-home-conx-voltage-detail',
  templateUrl: 'voltage-detail.component.html'
})
export class VoltageDetailComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<VoltageDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { sensor: SensorModel }
  ) {
  }

  ngOnInit(): void {
  }

  formatYAxis(value: number): string {
    return `${value} V`;
  }

}
