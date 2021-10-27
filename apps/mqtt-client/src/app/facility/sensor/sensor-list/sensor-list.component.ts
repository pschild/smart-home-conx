import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Select, Store } from '@ngxs/store';
import { SensorModel } from '@smart-home-conx/api/shared/data-access/models';
import { Observable } from 'rxjs';
import { SensorCreateComponent } from '../sensor-create/sensor-create.component';
import { SensorState } from '../state/sensor.state';

@Component({
  selector: 'smart-home-conx-sensor-list',
  templateUrl: 'sensor-list.component.html'
})
export class SensorListComponent {

  @Select(SensorState.sensors)
  sensors$: Observable<SensorModel[]>;

  constructor(
    public dialog: MatDialog,
    private store: Store
  ) {
  }

  create(): void {
    this.showDialog();
  }

  edit(sensor: SensorModel): void {
    this.showDialog(sensor);
  }

  private showDialog(sensor?: SensorModel): void {
    const dialogRef = this.dialog.open(SensorCreateComponent, { data: sensor ? { sensor } : null });
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
    });
  }

}
